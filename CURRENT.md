
## TODO — Pending Env Vars (add to Vercel production)

- [ ] OPENAI_API_KEY — from platform.openai.com ? API keys
- [ ] STRIPE_SECRET_KEY — from dashboard.stripe.com ? Developers ? API keys (sk_live_...)
- [ ] STRIPE_WEBHOOK_SECRET — from Stripe ? Webhooks ? add endpoint: https://clausekit-lemon.vercel.app/api/webhooks/stripe ? copy signing secret
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY — from Stripe ? API keys (pk_live_...)

Once added, run: vercel env add [KEY] production
Then redeploy: vercel --prod --token $env:VERCEL_TOKEN

Also add to local .env.local for testing.
