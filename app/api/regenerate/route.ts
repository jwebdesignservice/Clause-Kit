import { NextRequest, NextResponse } from 'next/server'
import { getContractAsync, updateContractAsync } from '@/lib/contract-store'
import { openai } from '@/lib/openai'

export async function POST(req: NextRequest) {
  let body: { contractId: string; sessionId: string; feedback?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { contractId, sessionId, feedback } = body
  if (!contractId || !sessionId) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  // Verify payment
  const { stripe } = await import('@/lib/stripe')
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== 'paid') return NextResponse.json({ error: 'Payment not verified' }, { status: 402 })
    if (session.metadata?.contractId !== contractId) return NextResponse.json({ error: 'Session mismatch' }, { status: 403 })
  } catch { return NextResponse.json({ error: 'Invalid session' }, { status: 400 }) }

  const record = await getContractAsync(contractId)
  if (!record) return NextResponse.json({ error: 'Contract not found' }, { status: 404 })

  // Only allow within 24 hours of creation
  const ageHours = (Date.now() - new Date(record.createdAt).getTime()) / 3600000
  if (ageHours > 24) return NextResponse.json({ error: 'Regeneration window has expired (24 hours)' }, { status: 403 })

  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 })

  try {
    const systemPrompt = `You are a UK legal document drafter. The user has requested a revision of their contract.
Previous contract is provided. User feedback: "${feedback ?? 'Please improve and refine the contract'}"
Produce an improved version addressing the feedback while keeping all mandatory UK legal clauses.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Original contract:\n\n${record.content}\n\nPlease regenerate with improvements.` },
      ],
      temperature: 0.2,
      max_tokens: 4000,
    })

    const newContent = completion.choices[0]?.message?.content?.trim() ?? ''
    if (!newContent) throw new Error('Empty response')

    await updateContractAsync(contractId, { content: newContent })
    return NextResponse.json({ success: true, content: newContent })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: `Regeneration failed: ${msg}` }, { status: 502 })
  }
}
