import type { Metadata } from "next";

const CONTRACT_META: Record<
  string,
  {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
  }
> = {
  freelance: {
    title: "Freelance Contract UK",
    description:
      "Generate a bespoke UK freelance contract in minutes. Covers project scope, payment terms, IP rights, and more. PDF + Word download.",
    ogTitle: "UK Freelance Contract Generator | ClauseKit",
    ogDescription:
      "Create a legally-sound freelance contract under UK law. Answer a few questions and download your customised PDF or Word file.",
  },
  nda: {
    title: "NDA Template UK – Non-Disclosure Agreement",
    description:
      "Create a UK non-disclosure agreement (NDA) in minutes. Mutual or one-way, covering confidentiality for any business deal.",
    ogTitle: "UK NDA Generator – Non-Disclosure Agreement | ClauseKit",
    ogDescription:
      "Generate a mutual or one-way NDA under UK law. Instant customisation, PDF and Word download.",
  },
  retainer: {
    title: "Retainer Agreement UK",
    description:
      "Generate a UK retainer agreement for ongoing services. Set monthly fees, scope, and notice periods. Instant PDF + Word download.",
    ogTitle: "UK Retainer Agreement Generator | ClauseKit",
    ogDescription:
      "Create a retainer agreement for ongoing client work under UK law. Covers monthly fee, scope, and exit terms.",
  },
  subcontractor: {
    title: "Subcontractor Agreement UK",
    description:
      "Create a UK subcontractor agreement in minutes. Define scope, payment, IP rights, and liability when bringing in a third party.",
    ogTitle: "UK Subcontractor Agreement Generator | ClauseKit",
    ogDescription:
      "Generate a legally-sound subcontractor agreement under UK law. Download as PDF or Word, ready to sign.",
  },
  service: {
    title: "Client Service Agreement UK",
    description:
      "Build a UK client service agreement for any professional service. Covers deliverables, payment, and dispute resolution.",
    ogTitle: "UK Client Service Agreement Generator | ClauseKit",
    ogDescription:
      "Create a tailored client service contract under UK law. Plain-English questions, instant PDF + Word download.",
  },
  terms: {
    title: "Website Terms & Conditions UK",
    description:
      "Generate UK-compliant website terms and conditions for your site or app. Covers usage, liability, IP, and more. Instant download.",
    ogTitle: "UK Website Terms & Conditions Generator | ClauseKit",
    ogDescription:
      "Create website T&Cs under UK law — covers user obligations, IP, disclaimers, and liability limits.",
  },
  debt: {
    title: "Late Payment Letter UK – Debt Recovery",
    description:
      "Generate a formal late payment or debt recovery letter under UK law. Chase unpaid invoices professionally and protect your rights.",
    ogTitle: "UK Late Payment & Debt Recovery Letter | ClauseKit",
    ogDescription:
      "Chase unpaid invoices with a professional late payment letter under UK law. Download as PDF or Word.",
  },
  employment: {
    title: "Employment Offer Letter UK",
    description:
      "Create a UK employment offer letter for new hires. Covers role, salary, start date, and key terms. Instant PDF + Word download.",
    ogTitle: "UK Employment Offer Letter Generator | ClauseKit",
    ogDescription:
      "Generate a basic employment offer letter under UK law. Covers job title, salary, hours, and start date. Ready to sign.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: { type: string };
}): Promise<Metadata> {
  const meta = CONTRACT_META[params.type];
  if (!meta) {
    return { title: "Create a Contract" };
  }
  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
    },
  };
}

export default function IntakePage({ params }: { params: { type: string } }) {
  return (
    <main className="min-h-screen bg-white max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2 capitalize">{params.type.replace(/-/g, " ")} contract</h1>
      <p className="text-gray-500">Intake form coming soon.</p>
    </main>
  );
}
