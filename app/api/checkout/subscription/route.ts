import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { contractId, email } = await req.json();

    if (!contractId) {
      return NextResponse.json({ error: 'contractId is required' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Build line item — use configured Price ID if available, else price_data
    const subscriptionPriceId = process.env.STRIPE_PRICE_ID_SUBSCRIPTION;

    const lineItem = subscriptionPriceId
      ? { price: subscriptionPriceId, quantity: 1 }
      : {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'ClauseKit Unlimited',
              description: 'Unlimited UK contract generation — £19/month',
            },
            unit_amount: 1900, // £19.00
            recurring: { interval: 'month' as const },
          },
          quantity: 1,
        };

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      line_items: [lineItem],
      mode: 'subscription',
      success_url: `${appUrl}/download/{CHECKOUT_SESSION_ID}?contractId=${contractId}&mode=subscription`,
      cancel_url: `${appUrl}/preview/${contractId}`,
      metadata: { contractId },
    };

    if (email) {
      sessionParams.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Subscription checkout error:', error);
    return NextResponse.json({ error: 'Failed to create subscription session' }, { status: 500 });
  }
}
