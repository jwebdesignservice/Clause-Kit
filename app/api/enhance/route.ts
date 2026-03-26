import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'

export async function POST(req: NextRequest) {
  let body: { contractType: string; description: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { contractType, description } = body
  if (!description?.trim()) return NextResponse.json({ questions: [] })
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ questions: [] })

  // Only enhance if description is too short/vague
  if (description.trim().length > 200) return NextResponse.json({ questions: [], sufficient: true })

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a UK contract assistant. A user is creating a ${contractType} contract. Review their description and identify up to 3 critical missing pieces of information that would significantly improve the contract quality.

Return JSON: { "questions": ["question 1?", "question 2?"], "sufficient": false }

If the description is detailed enough (mentions parties, work, payment, timeline), return: { "questions": [], "sufficient": true }

Only ask about genuinely important missing info (fee amount, timeline, specific deliverables, IP rights). Do not ask about things already covered. Maximum 3 questions. Keep questions short and plain English.`,
        },
        { role: 'user', content: `Contract type: ${contractType}\n\nDescription: ${description}` },
      ],
      temperature: 0.2,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    const result = JSON.parse(raw)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ questions: [], sufficient: true })
  }
}
