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

  const sub = getSubscription(session.user.email)
  if (!sub?.stripeCustomerId) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clausekit-lemon.vercel.app'

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${appUrl}/app?tab=subscription`,
  })

  return NextResponse.json({ url: portalSession.url })
}
