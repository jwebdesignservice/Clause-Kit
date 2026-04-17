import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getContractAsync, updateContractAsync } from '@/lib/contract-store'
import { hasActiveSubscriptionAsync } from '@/lib/subscription-store'
import { openai } from '@/lib/openai'

export async function POST(req: NextRequest) {
  let body: { contractId: string; sessionId?: string; feedback?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { contractId, sessionId, feedback } = body
  if (!contractId) return NextResponse.json({ error: 'Missing contractId' }, { status: 400 })

  // Access: either a signed-in subscriber OR a paid one-time session
  const session = await getServerSession(authOptions)
  const callerEmail = session?.user?.email?.toLowerCase() ?? null
  const subscribed = callerEmail ? await hasActiveSubscriptionAsync(callerEmail) : false

  if (!subscribed) {
    if (!sessionId) return NextResponse.json({ error: 'Payment or subscription required' }, { status: 402 })
    // Verify Stripe payment
    const { stripe } = await import('@/lib/stripe')
    try {
      const stripeSession = await stripe.checkout.sessions.retrieve(sessionId)
      if (stripeSession.payment_status !== 'paid') return NextResponse.json({ error: 'Payment not verified' }, { status: 402 })
      if (stripeSession.metadata?.contractId !== contractId) return NextResponse.json({ error: 'Session mismatch' }, { status: 403 })
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
    }
  }

  const record = await getContractAsync(contractId)
  if (!record) return NextResponse.json({ error: 'Contract not found' }, { status: 404 })

  // Subscribers can regenerate anytime. Non-subscribers only within 24 hours of creation.
  if (!subscribed) {
    const ageHours = (Date.now() - new Date(record.createdAt).getTime()) / 3600000
    if (ageHours > 24) return NextResponse.json({ error: 'Regeneration window has expired (24 hours)' }, { status: 403 })
  }

  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 })

  // Sanitise feedback so prompt-injection attempts don't escape the role
  const safeFeedback = (feedback ?? '').replace(/[`]/g, '').slice(0, 800)

  try {
    const systemPrompt = `You are a UK legal document drafter. The user has requested a revision of their contract.
Keep all mandatory UK legal clauses. Preserve the overall structure and numbering unless the feedback explicitly asks for structural change.
Address this feedback faithfully: ${safeFeedback || 'Please improve clarity and legal protection across all clauses.'}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Original contract:\n\n${record.content}\n\nPlease regenerate with the requested improvements. Return only the full revised contract text.` },
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
