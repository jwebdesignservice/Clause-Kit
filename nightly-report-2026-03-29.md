# ClauseKit Nightly Audit Report — 2026-03-29

**Branch:** `nightly/2026-03-29`
**Build:** ✅ PASS (23 pages, 0 TypeScript errors)
**Agent:** George (OpenClaw nightly audit)

---

## FOUND & FIXED

### 1. `app/api/sign/route.ts` — Sync contract store calls silently fail in production
**Severity: HIGH — signing is broken on Vercel when KV is configured**

Both `getContract()` and `updateContract()` return `null` when Vercel KV env vars are present (the sync wrappers are explicitly documented as local-dev-only in contract-store.ts). In production on Vercel, every signing attempt would return 404 "Contract not found" even for valid contracts, and signature writes would be silently dropped.

**Fix:** Replaced with `getContractAsync()` and `updateContractAsync()` throughout `app/api/sign/route.ts` (both POST and GET handlers).

### 2. `app/api/download/pdf/route.ts` — Same sync store issue for PDF download
**Severity: HIGH — PDF download broken on Vercel when KV is configured**

`getContract()` was still in use here after last night's fix focused on the colour bug. Same failure mode: returns null in KV mode → 404 on every paid download attempt.

**Fix:** Replaced `getContract()` import with `getContractAsync()`, made the call `await getContractAsync()`.

---

## CHECKED — NO ISSUES

- **TypeScript:** `npx tsc --noEmit` — clean, zero errors
- **`npm run build`:** 23 pages compiled, 0 errors, 0 ESLint errors (only 3 performance warnings about `<img>` vs `<Image />` — pre-existing, not regressions)
- **Security:** No hardcoded API keys or secrets found anywhere in the codebase
- **`lib/openai.ts`:** Lazy singleton proxy confirmed intact from last night's fix
- **`lib/stripe.ts`:** Lazy singleton proxy intact, no `currency: 'gbp'` on per-doc session
- **`lib/utils.ts`** (in `src/lib/`): `cn()` exported correctly, imported via `@/lib/utils` path alias
- **`lib/contract-types.ts`:** 9 CONTRACT_TYPES exported (including `employment-offer`), matches API usage
- **`lib/contract-store.ts`:** Dual-mode KV/file store, async API complete, sync wrappers correctly documented as local-dev-only
- **`lib/payment-store.ts`:** File-based store with `setPaymentStatus`, `getPaymentRecord`, `markPaid`. Subscription stub still present (unchanged — flagged last night)
- **`app/page.tsx` (homepage):** No encoding artifacts in rendered text (Unicode escapes used cleanly). Framer Motion, Lucide icons — all imports valid. All links present: `/app`, `/create`, `#pricing`, `#faq`. Comparison table data clean. Mobile nav menu present.
- **`app/app/page.tsx` (dashboard):** 8 CONTRACT_TYPES defined. All 4 form steps (type select → intake → loading → preview) — no null references found. `loadSaved()` and `persistSaved()` both guard with `typeof window !== 'undefined'` — SSR safe. 4 loading messages defined. Generate API error handling present with `res.ok` check.
- **`app/api/generate/route.ts`:** OpenAI lazy proxy import correct, proper `await` on `openai.chat.completions.create()`, `OPENAI_API_KEY` guard before call, full error handling, no env var leaks in responses.
- **`app/api/checkout/route.ts`:** Stripe lazy proxy import correct, request body parsed with try/catch, no env var leaks.
- **`app/api/checkout/subscription/route.ts`:** Stripe lazy proxy, falls back to inline `price_data` if `STRIPE_PRICE_ID_SUBSCRIPTION` not set — good defensive coding.
- **`app/api/payment/route.ts`:** Correctly deprecated with `410 Gone`.
- **`app/api/payment/webhook/route.ts`:** Still a no-op stub (flagged last night, unchanged).
- **`app/api/webhooks/stripe/route.ts`:** Verifies Stripe signature before processing. Handles `checkout.session.completed`, `async_payment_succeeded`, subscription created/updated/deleted. ✅
- **`app/api/download/docx/route.ts`:** Already using `getContractAsync` — no issue.
- **`app/api/regenerate/route.ts`:** Already using `getContractAsync` + `updateContractAsync` — no issue.
- **`.env.local.example`:** All required vars present: `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_APP_URL`, `STRIPE_PRICE_ID_PER_DOC`, `STRIPE_PRICE_ID_SUBSCRIPTION`, `RESEND_API_KEY`, `JWT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`. Correct var names (fixed last night).
- **Dependencies:** All required deps present — `framer-motion`, `pdf-lib`, `openai`, `stripe`, `lucide-react`, `clsx`, `tailwind-merge`. No missing peer deps from `npm ls`.
- **Routes compiled:** All 23 pages including `/`, `/app`, `/create`, `/download/[id]`, `/intake/[type]`, `/preview/[id]`, `/sign/[contractId]`.
- **Bundle sizes:** Nominal. `/app` at 26.5 kB (190 kB first load) is expected given complexity. No unusual bloat.

---

## NEEDS OPERATOR ATTENTION (carry-forward from previous nights)

1. **`lib/payment-store.ts` — `setSubscriptionStatus` is a stub**
   Subscription state is not persisted. After a successful Stripe subscription webhook, the user's status doesn't update in the app. Needs Vercel KV or Supabase implementation before subscription features work end-to-end. LOW urgency until subscription launch.

2. **`app/api/payment/webhook/route.ts` — no-op stub**
   Returns `{ received: true }` with zero processing. Real webhook logic is at `/api/webhooks/stripe/route.ts`. The stub creates confusion. Recommend deleting `/api/payment/webhook/route.ts` to keep the codebase clean.

3. **WhatsApp placeholder number**
   `wa.me/447700900000` appears 10 times across `app/page.tsx`. Must be replaced with the real business number before public launch.

4. **`<img>` vs `<Image />` warnings (3 instances)**
   `app/app/IntakeWizard.tsx` line 890 and `app/app/page.tsx` lines 756 + 884 use raw `<img>` instead of Next.js `<Image />`. Not an error — warnings only. Swap these when convenient for LCP/bandwidth improvements.

---

## BUILD STATUS

✅ **PASS** — `npm run build` completed successfully
- 23 pages compiled
- 0 TypeScript errors (tsc --noEmit clean)
- 0 ESLint errors
- 3 pre-existing `no-img-element` warnings (unchanged from before)

---

## BRANCH

`nightly/2026-03-29` — pushed to origin. Awaiting operator review and merge approval.
