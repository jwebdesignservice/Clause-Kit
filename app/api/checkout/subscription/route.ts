import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { email } = body

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey || !stripeKey.startsWith('sk_')) {
      return NextResponse.json({
        error: 'Stripe not configured',
        detail: `Key present: ${!!stripeKey}, starts with sk_: ${stripeKey?.startsWith('sk_')}`
      }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const subscriptionPriceId = process.env.STRIPE_PRICE_ID_SUBSCRIPTION;

    const lineItem = subscriptionPriceId
      ? { price: subscriptionPriceId, quantity: 1 }
      : {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'ClauseKit Pro',
              description: 'Up to 20 contracts per day — £19/month',
            },
            unit_amount: 1900,
            recurring: { interval: 'month' as const },
          },
          quantity: 1,
        };

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      line_items: [lineItem],
      mode: 'subscription',
      success_url: `${appUrl}/app?subscribed=true`,
      cancel_url: `${appUrl}/app`,
    };

    if (email) {
      sessionParams.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Subscription checkout error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to create subscription session', detail: message }, { status: 500 });
  }
}
