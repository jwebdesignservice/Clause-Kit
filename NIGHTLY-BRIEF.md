# ClauseKit Nightly Agent Brief
## Full Frontend + Backend Audit

You are the ClauseKit nightly agent. Your job tonight is to audit the entire codebase, find every bug, error, and issue, fix what you can safely fix, and report everything you find.

---

## Project
- Local: C:\Users\Jack\Desktop\AI Website\htdocs\Websites\clausekit
- Repo: github.com/jwebdesignservice/Clause-Kit
- Live: https://clausekit-lemon.vercel.app

---

## Iteration Loop (MUST FOLLOW)
1. Make changes
2. Run `npm run build`
3. Build passes → commit to `nightly/YYYY-MM-DD`, report success
4. Build fails → revert (`git checkout .`), try different approach
5. Max 5 iterations, 45 min budget
6. Never commit broken code

---

## Tonight's Audit Tasks

### 1. TypeScript / Lint Errors
- Run `npx tsc --noEmit` — fix every type error
- Run `npm run build` — fix every ESLint error
- Common issues to look for: unused imports, any types, missing return types on async functions

### 2. Frontend Audit — app/page.tsx (Homepage)
- Check all text renders correctly (no encoding artifacts — look for Â£, â€", Ã, etc.)
- Verify Framer Motion animations compile without type errors
- Check all Lucide icons are imported correctly
- Verify all href links point to valid routes (/app, /create, #pricing, #faq, etc.)
- Check the comparison table renders correctly
- Ensure mobile responsiveness is not broken (look for overflow issues, missing responsive classes)
- Verify the WhatsApp floating button is present and links correctly

### 3. Frontend Audit — app/app/page.tsx (Dashboard)
- Verify all 8 contract types are defined
- Check the sidebar tabs all render and switch correctly
- Verify the multi-step form flow (step 1 → 2 → 3 → 4) has no null reference issues
- Check localStorage read/write doesn't throw on SSR
- Verify the loading messages array is correct
- Check contract generation API call has proper error handling

### 4. API Routes Audit
For each route in app/api/:
- `api/generate/route.ts` — verify OpenAI client import is correct, check for missing await, verify response format
- `api/checkout/route.ts` — verify Stripe import is lazy (no module-level throws), check request body parsing
- `api/payment/webhook/route.ts` — verify webhook signature checking structure
- `api/webhooks/stripe/route.ts` — check for duplicate webhook handler logic
- `api/download/pdf/route.ts` — verify pdf-lib import works, check for memory issues

### 5. Library Imports
- Verify `lib/stripe.ts` uses lazy init (no module-level Stripe instantiation)
- Verify `lib/openai.ts` imports cleanly
- Verify `lib/contract-types.ts` exports match what the components expect
- Verify `lib/utils.ts` exports `cn()` correctly
- Check `lib/contract-store.ts` and `lib/payment-store.ts` for any issues

### 6. Dependency Check
- Run `npm ls` and check for any peer dependency warnings
- Check package.json has all required deps (framer-motion, pdf-lib, openai, stripe, lucide-react, clsx, tailwind-merge)

### 7. Build Output Check
After a successful build:
- Verify all routes compiled: /, /app, /create, /intake/[type], /preview/[id], /download/[id]
- Check no route is unexpectedly static that should be dynamic
- Note any unusually large bundle sizes

### 8. Environment Variables Check
- Verify .env.local.example has all required vars listed:
  - OPENAI_API_KEY
  - STRIPE_SECRET_KEY
  - STRIPE_PUBLISHABLE_KEY (NEXT_PUBLIC_)
  - STRIPE_WEBHOOK_SECRET
  - NEXT_PUBLIC_URL

### 9. Security Checks
- API routes should not leak environment variables in responses
- Stripe webhook should verify signature before processing
- No hardcoded API keys anywhere in the codebase

---

## After Completing Audit

1. Fix everything that is safe to fix
2. Run `npm run build` — must pass
3. Create branch `nightly/2026-03-26` from main
4. Commit all fixes with descriptive message
5. Push branch
6. Post report to Discord channel 1486498003715096858 (clausekit-nightly) with:
   - What was found
   - What was fixed
   - What needs operator attention
   - Build status

---

## Hard Rules
- Never commit to main
- Never deploy to production
- If a fix might break something else, document it instead of applying it
- If you find the HOMEPAGE-BRIEF.md, do NOT execute it tonight — it's for a separate task
