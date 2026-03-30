// Deprecated — all webhook handling is at /api/webhooks/stripe
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'This endpoint is deprecated. Stripe webhooks are handled at /api/webhooks/stripe.' },
    { status: 410 }
  );
}
