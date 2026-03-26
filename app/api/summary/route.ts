import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { getContractAsync } from '@/lib/contract-store'

export async function POST(req: NextRequest) {
  let body: { contractId?: string; content?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  let content = body.content
  if (!content && body.contractId) {
    const record = await getContractAsync(body.contractId)
    if (!record) return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    content = record.content
  }
  if (!content) return NextResponse.json({ error: 'No contract content provided' }, { status: 400 })
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 })

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a UK legal document explainer. Given a contract, produce a plain English summary for non-lawyers.

Format your response as JSON with this exact structure:
{
  "headline": "One sentence describing what this contract is",
  "whatYouAreAgreeing": ["bullet 1", "bullet 2", ...],
  "whatTheyAreAgreeing": ["bullet 1", "bullet 2", ...],
  "keyProtections": ["bullet 1", "bullet 2", ...],
  "keyRisks": ["bullet 1 (what could go wrong if not careful)", ...],
  "importantDates": ["date/deadline 1", ...],
  "moneyTerms": "One sentence summarising payment terms"
}

Keep bullets short (under 15 words each). Maximum 5 bullets per section. Plain English only — no legal jargon.`,
        },
        { role: 'user', content: `Summarise this contract:\n\n${content.slice(0, 6000)}` },
      ],
      temperature: 0.2,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    const summary = JSON.parse(raw)
    return NextResponse.json({ summary })
  } catch (e: unknown) {
    console.error('Summary generation error:', e)
    return NextResponse.json({ error: 'Summary generation failed' }, { status: 502 })
  }
}
