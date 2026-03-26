import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'

export interface HealthScore {
  overall: number // 0-10
  categories: {
    label: string
    score: 'strong' | 'moderate' | 'weak' | 'missing'
    detail: string
  }[]
  topTip: string
}

export async function POST(req: NextRequest) {
  let body: { content: string; contractType: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { content, contractType } = body
  if (!content?.trim()) return NextResponse.json({ error: 'No content' }, { status: 400 })
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 })

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a UK contract quality assessor. Review the given ${contractType} contract and score it.

Return JSON with this exact structure:
{
  "overall": <number 0-10>,
  "categories": [
    { "label": "Payment Protection", "score": "strong|moderate|weak|missing", "detail": "one sentence" },
    { "label": "IP Ownership", "score": "strong|moderate|weak|missing", "detail": "one sentence" },
    { "label": "Termination Rights", "score": "strong|moderate|weak|missing", "detail": "one sentence" },
    { "label": "Liability Protection", "score": "strong|moderate|weak|missing", "detail": "one sentence" },
    { "label": "Confidentiality", "score": "strong|moderate|weak|missing", "detail": "one sentence" },
    { "label": "Dispute Resolution", "score": "strong|moderate|weak|missing", "detail": "one sentence" }
  ],
  "topTip": "The single most important improvement this contract needs (one sentence, plain English)"
}

Be honest. A contract missing important clauses should score 5 or below.`,
        },
        { role: 'user', content: `Review this contract:\n\n${content.slice(0, 5000)}` },
      ],
      temperature: 0.1,
      max_tokens: 600,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    const score: HealthScore = JSON.parse(raw)
    return NextResponse.json({ score })
  } catch (e: unknown) {
    console.error('Health score error:', e)
    return NextResponse.json({ error: 'Health score failed' }, { status: 502 })
  }
}
