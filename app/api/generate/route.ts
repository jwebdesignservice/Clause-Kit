import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { saveContract } from "@/lib/contract-store";
import { ContractType, IntakeFormData } from "@/types";
import { randomUUID } from "crypto";

// In-memory rate limiter: max 5 requests per IP per 60 seconds
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

const UK_LAW_BASE = `You are a specialist UK legal document drafter. You MUST adhere to the following requirements in every contract you produce:

1. Governing law: English and Welsh law exclusively. Include a jurisdiction clause specifying the courts of England and Wales.
2. Late Payment: Where payment terms are present, reference the Late Payment of Commercial Debts (Interest) Act 1998 and state that statutory interest at 8% above the Bank of England base rate will accrue on overdue invoices.
3. GDPR: Include a brief data processing note acknowledging compliance with the UK GDPR and the Data Protection Act 2018 for any personal data shared between parties.
4. Professional tone: Use clear, plain-English legal drafting suitable for UK SMEs and freelancers.
5. Structure: Use numbered clauses and clear headings. Output the full contract as formatted plain text (no markdown fences).`;

const CONTRACT_PROMPTS: Record<ContractType, string> = {
  freelance: `${UK_LAW_BASE}
6. IP Ownership: The freelancer retains all intellectual property rights in deliverables until full payment is received, at which point ownership transfers to the client.
7. IR35: Include a clause flagging IR35 awareness — the parties acknowledge this agreement is for genuinely self-employed services and that the contractor accepts sole responsibility for their tax and NI obligations.`,

  "nda-mutual": `${UK_LAW_BASE}
6. Mutual confidentiality: Both parties agree to keep each other's confidential information strictly private. Include standard exceptions (publicly available info, prior knowledge, legal compulsion).`,

  "nda-one-way": `${UK_LAW_BASE}
6. One-way confidentiality: The Receiving Party agrees to protect the Disclosing Party's confidential information. Include standard exceptions.`,

  retainer: `${UK_LAW_BASE}
6. Retainer terms: Include fixed monthly fee, minimum commitment period, notice period for termination, and scope of availability/hours included.
7. IP Ownership: IP in work produced transfers to the client upon payment of that month's retainer fee.
8. IR35: Include an IR35 awareness clause acknowledging self-employed status.`,

  subcontractor: `${UK_LAW_BASE}
6. Sub-contracting: The contractor engages a subcontractor to assist with specific deliverables. The contractor remains responsible to the end client for all work quality.
7. IP flows up to the contractor (and onward to the end client under the main contract).
8. IR35: Flag IR35 awareness for the subcontractor's self-employed status.`,

  "client-service": `${UK_LAW_BASE}
6. Service scope: Include a scope of services, acceptance criteria, and change request process.
7. Liability: Include a reasonable liability limitation clause appropriate for UK SME transactions.`,

  "website-tcs": `${UK_LAW_BASE}
6. Include: acceptable use policy, intellectual property ownership of site content, disclaimer of warranties, limitation of liability, cookie/privacy policy reference, and right to amend terms with notice.`,

  "late-payment": `${UK_LAW_BASE}
6. This is a formal debt recovery letter. Cite the specific invoice(s), the amount(s) outstanding, and the original due date(s).
7. State that statutory interest under the Late Payment of Commercial Debts (Interest) Act 1998 is now accruing at 8% above the Bank of England base rate.
8. Give a final payment deadline of 7 days and state that legal proceedings may follow without further notice.`,

  "employment-offer": `${UK_LAW_BASE}
6. This is an employment offer letter (not a full employment contract). Include: role title, start date, salary, working hours, holiday entitlement (minimum 28 days including bank holidays per Working Time Regulations 1998), probationary period, and a note that a full written statement of particulars will follow within 2 months per the Employment Rights Act 1996.`,

  custom: `${UK_LAW_BASE}
6. Adapt the contract to the custom description provided by the user. Ensure all standard UK legal requirements above are met.`,
};

function buildUserPrompt(data: IntakeFormData): string {
  const lines: string[] = [`Contract Type: ${data.contractType}`];

  if (data.customDescription) {
    lines.push(`Custom Description: ${data.customDescription}`);
  }

  if (data.fields && Object.keys(data.fields).length > 0) {
    lines.push("\nParty and Contract Details:");
    for (const [key, value] of Object.entries(data.fields)) {
      if (value) {
        const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
        lines.push(`- ${label}: ${value}`);
      }
    }
  }

  lines.push("\nGenerate the complete contract now.");
  return lines.join("\n");
}

function deriveTitle(contractType: ContractType, fields: Record<string, string>): string {
  const typeLabels: Record<ContractType, string> = {
    freelance: "Freelance Project Agreement",
    "nda-mutual": "Mutual Non-Disclosure Agreement",
    "nda-one-way": "Non-Disclosure Agreement",
    retainer: "Retainer Agreement",
    subcontractor: "Subcontractor Agreement",
    "client-service": "Client Service Agreement",
    "website-tcs": "Website Terms and Conditions",
    "late-payment": "Late Payment Notice",
    "employment-offer": "Employment Offer Letter",
    custom: "Custom Agreement",
  };

  const base = typeLabels[contractType] ?? "Agreement";
  const clientName = fields?.clientName || fields?.client || fields?.recipientName;
  return clientName ? `${base} — ${clientName}` : base;
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  let body: IntakeFormData;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { contractType, customDescription, fields } = body;

  if (!contractType) {
    return NextResponse.json({ error: "contractType is required." }, { status: 400 });
  }

  const systemPrompt = CONTRACT_PROMPTS[contractType] ?? CONTRACT_PROMPTS.custom;
  const userPrompt = buildUserPrompt({ contractType, customDescription, fields: fields ?? {} });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured." },
      { status: 500 }
    );
  }

  let contractContent: string;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    contractContent = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!contractContent) {
      throw new Error("Empty response from OpenAI.");
    }
  } catch (err: unknown) {
    console.error("OpenAI generation error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Contract generation failed: ${message}` },
      { status: 502 }
    );
  }

  const contractId = randomUUID();
  const title = deriveTitle(contractType, fields ?? {});
  const createdAt = new Date().toISOString();

  try {
    saveContract({
      id: contractId,
      contractType,
      title,
      content: contractContent,
      createdAt,
    });
  } catch (err) {
    console.error("Failed to save contract to store:", err);
    // Still return the content — don't fail the user
  }

  return NextResponse.json({
    contractId,
    title,
    contractType,
    content: contractContent,
    createdAt,
  });
}
