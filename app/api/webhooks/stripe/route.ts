import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { markPaid, setPaymentStatus, setSubscriptionStatus } from '@/lib/payment-store';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const contractId = session.metadata?.contractId;

      if (session.mode === 'subscription') {
        // Subscription checkout — mark customer as subscribed
        if (session.customer && session.subscription) {
          setSubscriptionStatus(
            session.customer as string,
            session.subscription as string,
            'active'
          );
        }
      } else if (contractId) {
        // One-time payment
        if (session.payment_status === 'paid') {
          markPaid(session.id);
        } else {
          setPaymentStatus(session.id, contractId, 'pending');
        }
      }
      break;
    }

    case 'checkout.session.async_payment_succeeded': {
      const session = event.data.object as Stripe.Checkout.Session;
      markPaid(session.id);
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      setSubscriptionStatus(
        sub.customer as string,
        sub.id,
        sub.status === 'active' ? 'active' : 'inactive'
      );
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      setSubscriptionStatus(sub.customer as string, sub.id, 'inactive');
      break;
    }

    default:
      console.log(`Unhandled Stripe event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
