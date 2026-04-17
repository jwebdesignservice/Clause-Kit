import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { markPaidAsync, setPaymentStatusAsync } from '@/lib/payment-store';
import { setSubscriptionAsync } from '@/lib/subscription-store';

async function getEmailFromCustomer(customerId: string): Promise<string | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId)
    if (customer.deleted) return null
    return (customer as Stripe.Customer).email ?? null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const contractId = session.metadata?.contractId;

        if (session.mode === 'subscription') {
          // Subscription — record against user email
          const customerId = session.customer as string
          const email = session.customer_email ?? await getEmailFromCustomer(customerId)
          if (email) {
            await setSubscriptionAsync({
              userId: email,
              stripeCustomerId: customerId,
              stripeSubscriptionId: session.subscription as string,
              status: 'active',
              createdAt: new Date().toISOString(),
            })
          }
        } else if (contractId) {
          // One-time payment
          if (session.payment_status === 'paid') {
            await markPaidAsync(session.id);
          } else {
            await setPaymentStatusAsync(session.id, contractId, 'pending');
          }
        }
        break;
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        await markPaidAsync(session.id);
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const email = await getEmailFromCustomer(sub.customer as string)
        if (email) {
          await setSubscriptionAsync({
            userId: email,
            stripeCustomerId: sub.customer as string,
            stripeSubscriptionId: sub.id,
            status: sub.status === 'active' ? 'active' : sub.status === 'past_due' ? 'past_due' : 'cancelled',
            currentPeriodEnd: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
            createdAt: new Date().toISOString(),
          })
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const email = await getEmailFromCustomer(sub.customer as string)
        if (email) {
          await setSubscriptionAsync({
            userId: email,
            stripeCustomerId: sub.customer as string,
            stripeSubscriptionId: sub.id,
            status: 'cancelled',
            createdAt: new Date().toISOString(),
          })
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error('Webhook handler failed for', event.type, err);
    // Returning 500 causes Stripe to retry — which is the correct behaviour
    // for transient KV/database failures.
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
