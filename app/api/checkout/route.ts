import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { setPaymentStatus } from '@/lib/payment-store';

export async function POST(req: NextRequest) {
  try {
    const { contractId, email } = await req.json();

    if (!contractId) {
      return NextResponse.json({ error: 'contractId is required' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'ClauseKit Document',
              description: 'One-time contract generation and download',
            },
            unit_amount: 700, // £7.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/download/{CHECKOUT_SESSION_ID}?contractId=${contractId}`,
      cancel_url: `${appUrl}/preview/${contractId}`,
      metadata: { contractId },
    };

    if (email) {
      sessionParams.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    setPaymentStatus(session.id, contractId, 'pending');

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
