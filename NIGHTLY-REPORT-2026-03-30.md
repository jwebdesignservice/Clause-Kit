# ClauseKit Nightly Audit Report — 2026-03-30

**Audit run:** 2026-03-30 03:00 GMT  
**Branch:** nightly/2026-03-30  
**Build status:** ✅ PASSING

---

## Summary

Overall the codebase is in good shape. Build passes clean. No TypeScript errors. No blocking issues. Several minor observations logged below — most are informational or low-priority improvements rather than bugs.

---

## 1. TypeScript / Lint

**Status: ✅ Clean**

- `npx tsc --noEmit` — no errors
- `npm run build` — compiled successfully with 0 errors
- ESLint warnings (non-blocking):
  - `app/app/IntakeWizard.tsx:890` — `<img>` instead of Next.js `<Image>` (LCP warning)
  - `app/app/page.tsx:905, 1030, 1046` — same `<img>` warnings (3 occurrences)
  - These are warnings only and do not break the build

**Recommendation:** Consider replacing `<img>` with `next/image` for better LCP performance, but not urgent.

---

## 2. Homepage — app/page.tsx

**Status: ✅ No issues**

- **Encoding artifacts:** None found. File is clean UTF-8.
- **Framer Motion:** No import errors detected (build passes).
- **Lucide icons:** Imported correctly — build compiles without icon errors.
- **Links:** All hrefs verified:
  - Nav: `#how-it-works`, `#contracts`, `#pricing`, `#faq` ✅
  - CTA buttons: `/app` ✅
  - Footer: `/privacy`, `/terms` ✅
- **WhatsApp floating button:** Present at line 921, links to `https://wa.me/447700900000`, `fixed bottom-6 right-6 z-50` ✅
- **Mobile responsiveness:** No obvious overflow issues in markup.

---

## 3. Dashboard — app/app/page.tsx

**Status: ✅ No issues**

- **Contract types:** 8 types confirmed (freelance, nda-mutual, nda-one-way, retainer, subcontractor, client-service, website-tcs, employment-offer) ✅
- **Multi-step form (steps 1–4):** All steps type-safe. Step transitions use proper null checks (`if (!selectedType) return`).
- **localStorage SSR safety:** `loadSaved()` checks `typeof window === 'undefined'` before access. `persistSaved()` checks `typeof window !== 'undefined'` ✅
- **Loading messages:** Array has 4 messages, cycle capped at `LOADING_MESSAGES.length - 1` ✅
- **API error handling:** Fetch has `if (!res.ok)` with JSON body parsing and fallback error message ✅

---

## 4. API Routes

### api/generate/route.ts
**Status: ✅ Good**
- OpenAI uses a lazy proxy singleton via `lib/openai.ts` — no module-level instantiation ✅
- `await` present on all async calls ✅
- Response format: `{ contractId, id, title, contractType, content, createdAt }` ✅
- OPENAI_API_KEY guard check present ✅
- Rate limiting implemented (5 req/min per IP) ✅

### api/checkout/route.ts
**Status: ✅ Good**
- Stripe imported via lazy proxy (`lib/stripe.ts`) ✅
- Request body parsed with try/catch ✅
- `contractId` validation present ✅

### api/payment/webhook/route.ts
**Status: ⚠️ STUB — Operator Attention Required**
- This route is a stub: returns `{ received: true }` with no verification
- There is a **real** webhook handler at `api/webhooks/stripe/route.ts` (with full signature verification)
- The stub at `api/payment/webhook/` is dead code — it does nothing and has no signature verification
- **Recommendation:** Either delete this stub or redirect logic to the real handler. Low security risk as it does nothing, but confusing and should be cleaned up.

### api/webhooks/stripe/route.ts
**Status: ✅ Secure**
- Reads raw body with `req.text()` before JSON parsing ✅
- Verifies `stripe-signature` header — rejects with 400 if missing ✅
- `stripe.webhooks.constructEvent()` called with webhook secret ✅
- Handles: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted` ✅
- No duplicate logic with checkout route

### api/download/pdf/route.ts
**Status: ✅ Good**
- pdf-lib imported via named exports ✅
- Payment verification done before serving PDF ✅
- Contract-session ID matching checked (`session.metadata?.contractId !== contractId`) ✅
- No obvious memory leak (pdf bytes created fresh per request)

---

## 5. Library Imports

### lib/stripe.ts
**Status: ✅ Lazy init**
- Uses a singleton pattern with `let _stripe: Stripe | null = null` ✅
- No module-level instantiation ✅
- ⚠️ Minor: falls back to `'sk_test_placeholder'` if no key configured — this prevents a crash at build time but would silently fail at runtime. Acceptable pattern.

### lib/openai.ts
**Status: ✅ Lazy init**
- Proxy-based lazy singleton ✅
- No module-level OpenAI instantiation ✅

### lib/contract-types.ts
**Status: ✅ Matches usage**
- Exports `CONTRACT_TYPES` as `ContractTypeOption[]` with `id`, `title`, `description`, `icon` fields
- Used correctly in `app/create/page.tsx`

### lib/contractTypes.ts (separate file)
**Status: ⚠️ Duplicate / Dead Code**
- There are TWO contract-type files: `lib/contract-types.ts` and `lib/contractTypes.ts`
- `lib/contractTypes.ts` uses different slugs (`freelance`, `nda`, `retainer` etc.) that do NOT match the canonical IDs used by the API and generate route
- No files appear to import `lib/contractTypes.ts` — it may be unused legacy code
- **Recommendation:** Confirm `lib/contractTypes.ts` is unused and delete it to avoid confusion.

### lib/utils.ts
**Status: ⚠️ File does not exist**
- `lib/utils.ts` was not found in the lib directory
- The build passes without it, so no components are importing it
- This may have been renamed or consolidated into another file (clsx + tailwind-merge are in package.json)
- **No action needed** unless you plan to add a `cn()` utility function

### lib/contract-store.ts
**Status: ✅ Good**
- Dual-backend (Vercel KV + file fallback) ✅
- Async API throughout ✅
- Sync wrappers exist for compatibility ✅

### lib/payment-store.ts
**Status: ✅ Good**
- File-based store for local dev / fallback ✅
- Minor: `setSubscriptionStatus` is a stub with a console.log — not called anywhere in production flow (real subscription logic is in `lib/subscription-store.ts`)

---

## 6. Dependencies

**Status: ✅ Clean**

All required packages present:
- framer-motion@12.38.0 ✅
- pdf-lib@1.17.1 ✅
- openai@6.32.0 ✅
- stripe@20.4.1 ✅
- lucide-react@1.6.0 ✅
- clsx@2.1.1 ✅
- tailwind-merge@3.5.0 ✅

`npm ls` — no peer dependency warnings, no missing packages.

---

## 7. Build Output

**Status: ✅ All routes compiled**

Routes verified:
- `/` (Static) ✅
- `/app` (Static) ✅
- `/create` (Static) ✅
- `/auth/signin`, `/auth/signout`, `/auth/signup` (Static) ✅
- `/download/[id]` (Dynamic) ✅
- `/intake/[type]` (Dynamic) ✅
- `/preview/[id]` (Dynamic) ✅
- `/sign/[contractId]` (Dynamic) ✅
- `/privacy`, `/terms`, `/refunds` (Static) ✅
- All API routes (Dynamic) ✅

Bundle sizes look normal. `/app` is the largest page at 193kB first load JS — expected given Framer Motion and the dashboard UI.

---

## 8. Environment Variables

**Status: ✅ .env.local.example is complete**

Variables present:
- `OPENAI_API_KEY` ✅
- `STRIPE_SECRET_KEY` ✅
- `STRIPE_PUBLISHABLE_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` ✅
- `STRIPE_WEBHOOK_SECRET` ✅
- `NEXT_PUBLIC_APP_URL` ✅ (note: brief mentions `NEXT_PUBLIC_URL` but code uses `NEXT_PUBLIC_APP_URL` — no gap)
- `STRIPE_PRICE_ID_PER_DOC` + `STRIPE_PRICE_ID_SUBSCRIPTION` ✅
- `RESEND_API_KEY` ✅
- `JWT_SECRET` ✅
- `NEXTAUTH_SECRET` + `NEXTAUTH_URL` ✅
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` ✅

Missing from example: `KV_REST_API_URL` + `KV_REST_API_TOKEN` (Vercel KV). The code in `lib/contract-store.ts` checks for these but they're not documented in the example file.

**Recommendation:** Add `KV_REST_API_URL` and `KV_REST_API_TOKEN` to `.env.local.example` with a comment explaining they're needed for production (Vercel KV).

---

## 9. Security

**Status: ✅ No critical issues**

- API routes do not echo environment variables in responses ✅
- `api/webhooks/stripe/route.ts` verifies signature before processing ✅
- No hardcoded API keys in codebase ✅
- `lib/stripe.ts` placeholder `'sk_test_placeholder'` is hardcoded but is a known-fake value with no real credentials ✅
- `api/payment/webhook/route.ts` stub (mentioned above) — no security risk as it does nothing, but should be removed

---

## Issues Requiring Operator Attention

| Priority | File | Issue |
|----------|------|-------|
| 🟡 Medium | `app/api/payment/webhook/route.ts` | Stub webhook handler with no logic or signature verification — dead code alongside the real handler in `api/webhooks/stripe/route.ts`. Should be deleted. |
| 🟡 Medium | `lib/contractTypes.ts` | Duplicate/legacy contract types file with different slugs from canonical types. Likely unused — should be confirmed and deleted. |
| 🟡 Medium | `.env.local.example` | Missing `KV_REST_API_URL` and `KV_REST_API_TOKEN` docs for Vercel KV production storage. |
| 🟢 Low | `app/app/IntakeWizard.tsx`, `app/app/page.tsx` | 4x `<img>` instead of `<Image>` from next/image — ESLint warnings, LCP impact. |
| 🟢 Low | `lib/utils.ts` | File doesn't exist — not imported anywhere, but noted as missing if `cn()` utility is needed. |

---

## Files Changed

None — the codebase is clean. All findings above are observations/recommendations. No fixes were required to achieve a passing build.

Build passed on first attempt with 0 errors and 4 non-blocking ESLint warnings.

---

*Report generated by George (ClauseKit nightly agent) — 2026-03-30 03:00 GMT*
