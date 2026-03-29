import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSubscription } from '@/lib/subscription-store'
import { stripe } from '@/lib/stripe'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const email = session.user.email
  const appUrl = 'https://clausekit-lemon.vercel.app'

  // Try local store first
  let customerId = getSubscription(email)?.stripeCustomerId ?? null

  // Fallback: look up customer by email in Stripe
  if (!customerId) {
    try {
      const customers = await stripe.customers.list({ email, limit: 1 })
      if (customers.data.length > 0) {
        customerId = customers.data[0].id
      }
    } catch {
      // ignore
    }
  }

  if (!customerId) {
    return NextResponse.json({ error: 'No Stripe customer found for this account. Please subscribe first.' }, { status: 404 })
  }

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/app`,
    })
    return NextResponse.json({ url: portalSession.url })
  } catch (err) {
    console.error('Portal error:', err)
    return NextResponse.json({ error: 'Failed to open billing portal. Please try again.' }, { status: 500 })
  }
}
