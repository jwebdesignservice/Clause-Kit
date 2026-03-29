# ClauseKit Nightly Audit Report — 2026-03-28

**Branch:** `nightly/2026-03-28`
**Build:** ✅ PASS (23 pages, 0 TypeScript errors)
**Agent:** Claude Code (claude-sonnet-4-6)

---

## FOUND

1. `lib/stripe.ts` — `createPerDocCheckout` passed `currency: "gbp"` at session level alongside a Stripe Price ID. Stripe rejects this: currency is already set on the Price object. This would cause runtime API errors for all per-doc checkout attempts.

2. `app/api/download/pdf/route.ts` — PDF header colour comment says `#2D6A4F` but actual RGB was `(0.176, 0.263, 0.31)` — green channel off by 0.153, rendering as dark teal instead of ClauseKit green.

3. `lib/openai.ts` — Module-level `new OpenAI()` ran at build time. Inconsistent with the lazy pattern in stripe.ts. In serverless environments this can cause issues if env vars aren't available at module load time.

4. `.env.local.example` — Documented `STRIPE_SUBSCRIPTION_PRICE_ID` but code reads `STRIPE_PRICE_ID_SUBSCRIPTION`. Silent mismatch would break subscription checkout with no obvious error.

---

## FIXED

| # | File | Fix Applied |
|---|------|-------------|
| 1 | `lib/stripe.ts` | Removed `currency: "gbp"` from `createPerDocCheckout` session params |
| 2 | `app/api/download/pdf/route.ts` | Fixed RGB to `(0.176, 0.416, 0.310)` — correct ClauseKit green |
| 3 | `lib/openai.ts` | Converted to lazy singleton proxy (same pattern as stripe.ts) |
| 4 | `.env.local.example` | Corrected to `STRIPE_PRICE_ID_SUBSCRIPTION` |

---

## CHECKED — NO ISSUES

- **TypeScript:** `npx tsc --noEmit` — clean, zero errors
- **Security:** No hardcoded API keys found anywhere in codebase
- **Stripe webhook** (`/api/webhooks/stripe`): verifies signature before processing ✅
- **All required deps:** framer-motion, pdf-lib, openai, stripe, lucide-react, clsx, tailwind-merge — all present
- **`.env.local.example`** has all required vars: OPENAI_API_KEY, STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_APP_URL
- **WhatsApp button:** present in nav (desktop + mobile)
- **`app/page.tsx`:** no encoding artifacts, imports clean, all links valid
- **`app/app/page.tsx`:** no SSR localStorage usage, proper `'use client'` boundary, 8 contract types defined
- **`lib/contract-types.ts`:** exports match component usage
- **`lib/utils.ts`:** cn() exported correctly
- **`lib/stripe.ts`:** lazy init confirmed

---

## NEEDS OPERATOR ATTENTION

1. **`lib/payment-store.ts` — `setSubscriptionStatus` is a stub (log-only)**
   Subscription state is not persisted anywhere. After a successful Stripe subscription webhook, the user's subscription status doesn't update in the app. Needs a KV store or DB implementation before subscription features can work end-to-end.

2. **`app/api/payment/webhook/route.ts` — no-op stub**
   This route just returns `{ received: true }` with no processing. Real webhook handling is at `/api/webhooks/stripe/route.ts`. The stub creates confusion about which webhook endpoint is active. Consider deleting `/api/payment/webhook/route.ts`.

3. **WhatsApp placeholder number**
   The WhatsApp floating button uses `447700900000` — a placeholder. Must be replaced with the real business number before launch.

---

## BUILD STATUS

✅ **PASS** — `npm run build` completed successfully
- 23 pages compiled
- 0 TypeScript errors
- 0 build warnings (beyond expected next.js infra messages)

---

## BRANCH

`nightly/2026-03-28` — pushed to origin. Awaiting operator review and merge approval.
