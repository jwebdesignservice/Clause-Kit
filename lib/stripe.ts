import Stripe from "stripe";

// Lazy singleton — only instantiated at runtime, never at build time
let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY ?? '';
    _stripe = new Stripe(key || 'sk_test_placeholder', { apiVersion: "2026-02-25.clover" });
  }
  return _stripe;
}

// Keep named export for backwards compat — lazy getter
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const STRIPE_PRICES = {
  perDoc: process.env.STRIPE_PRICE_ID_PER_DOC || "",
  subscription: process.env.STRIPE_PRICE_ID_SUBSCRIPTION || "",
};

export async function getOrCreateCustomer(email: string): Promise<string> {
  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data.length > 0) {
    return existing.data[0].id;
  }
  const customer = await stripe.customers.create({ email });
  return customer.id;
}

export async function getSubscriptionStatus(
  customerId: string
): Promise<{ isActive: boolean; subscriptionId?: string; currentPeriodEnd?: number }> {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
    limit: 1,
  });

  if (subscriptions.data.length > 0) {
    const sub = subscriptions.data[0];
    return {
      isActive: true,
      subscriptionId: sub.id,
      currentPeriodEnd: (sub as unknown as { current_period_end: number }).current_period_end,
    };
  }

  return { isActive: false };
}

export async function createSubscriptionCheckout(
  customerId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  // Note: currency is determined by the Price object — do not pass it at session level for subscription mode
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: STRIPE_PRICES.subscription,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session.url!;
}

export async function createPerDocCheckout(
  customerId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: STRIPE_PRICES.perDoc,
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session.url!;
}

export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session.url;
}
