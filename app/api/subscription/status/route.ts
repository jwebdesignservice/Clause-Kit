import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hasActiveSubscriptionAsync } from '@/lib/subscription-store'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ active: false })
  }
  const active = await hasActiveSubscriptionAsync(session.user.email)
  return NextResponse.json({ active })
}
