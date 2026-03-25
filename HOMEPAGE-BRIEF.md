# ClauseKit Homepage — Full Conversion Funnel Brief
## For Claude Code execution

---

## MISSION
Build a world-class, conversion-optimised marketing homepage that matches the exact styling of the app dashboard (`/app/page.tsx`). This is a single-page journey funnel — every section moves the visitor closer to clicking "Launch App" or messaging on WhatsApp. No generic SaaS. No white backgrounds with blue buttons. This should look like a premium legal tech product that commands trust immediately.

---

## DESIGN SYSTEM — MUST MATCH THE DASHBOARD EXACTLY

Look at `app/app/page.tsx` for the source of truth. Extract and reuse these exact values:

### Colours (from the dashboard)
```
Background: #FAFAF8 (warm cream/off-white — the entire page background)
Sidebar/Card bg: #FFFFFF (white surfaces)
Border colour: #E5E7EB (light grey borders)
Primary green (buttons, accents): #2D6A4F
Primary green hover: #1B4332
Light green (highlights): #52B788
Pale green (subtle bg): #D8F3DC
Dark green text: #1B4332
Body text: #111827 (near black)
Muted text: #6B7280
Success green: #16a34a
```

### Typography
- Headings: font-serif (or system serif stack) for H1 — like the "Read faster, retain more" reference image
- Body: system sans-serif (font-sans)
- The dashboard uses a clean minimal system — replicate exactly

### Spacing & Components
- Cards: rounded-xl, border border-[#E5E7EB], bg-white, shadow-sm
- Buttons: rounded-md, font-medium, px-5 py-2.5
- Primary button: bg-[#2D6A4F] text-white hover:bg-[#1B4332]
- Ghost button: border border-[#2D6A4F] text-[#2D6A4F] bg-transparent hover:bg-[#D8F3DC]
- Sidebar nav item active state: bg-[#D8F3DC] text-[#1B4332] font-semibold

---

## PAGE STRUCTURE — THE FUNNEL

### SECTION 1: STICKY NAV
```
bg-white border-b border-[#E5E7EB] sticky top-0 z-50
Left: ClauseKit logo (green square icon with "CK" + "ClauseKit" wordmark)
Centre: Links — How it works | Contract types | Pricing | FAQ
Right: 
  - "Chat on WhatsApp" (ghost button, WhatsApp green icon)
  - "Launch App" (primary green button, → arrow)
```
On mobile: hamburger menu, all links in dropdown

---

### SECTION 2: HERO — THE HOOK
Full-width. Background: #FAFAF8. Large serif heading like the reference image.

```
TRUST BADGE (top): 
  Animated pill — "GPT-4o Powered | UK Law | Solicitor-Reviewed Templates"
  Style: bg-[#D8F3DC] text-[#1B4332] rounded-full px-4 py-1.5 text-sm font-medium

H1 (LARGE SERIF, 64px desktop):
  "The only UK contract
   builder you'll ever need."
  
  Style: font-serif, two-line, mix regular + italic green for emphasis word
  e.g. "The only UK contract builder <em style green>you'll ever need.</em>"

SUBHEADING (20px, muted):
  "Describe your situation in plain English. ClauseKit drafts a bespoke,
   UK-law contract in under 2 minutes. Pay \u00A37 to download. No solicitor needed."

CTA ROW:
  [Launch App \u2192] — primary green, large
  [Chat on WhatsApp] — ghost with WhatsApp icon
  
  Below CTAs: 
  "No account needed \u00B7 Generate free \u00B7 Pay only to download"
  Style: text-sm text-[#6B7280]

SOCIAL PROOF TICKER (animated horizontal scroll):
  "Freelancers \u00B7 Web Agencies \u00B7 Consultants \u00B7 Tradespeople \u00B7 Care Providers \u00B7 Small Businesses"
  
HERO VISUAL:
  Right side (desktop): Mockup of the app dashboard UI — show the sidebar nav 
  and a contract being generated. Can be a screenshot or a hand-drawn CSS mockup.
  Use Framer Motion to animate it fading in from the right.
```

---

### SECTION 3: SOCIAL PROOF STRIP
```
bg-[#2D6A4F] text-white py-4

Animated scrolling logos/text row (Framer Motion marquee):
"2,000+ contracts generated \u00B7 Trusted by UK freelancers \u00B7 Reviewed by UK solicitors 
 \u00B7 GPT-4o powered \u00B7 IR35 aware \u00B7 GDPR compliant \u00B7 English & Welsh law"
```

---

### SECTION 4: THE PAIN (Problem Agitation)
```
bg-[#FAFAF8]
Section label: "THE PROBLEM" (small caps, green)
H2: "Sound familiar?"

3 large pain cards in a row (each with a red/amber indicator):
  
  Card 1 — \u00A3300/hr
    Icon: pound/money icon in red circle
    Heading: "Solicitors charge \u00A3150\u2013\u00A3500 for a basic contract"
    Body: "And then they take 3 days to deliver it. You needed it yesterday."
  
  Card 2 — Generic Templates
    Icon: document X icon in amber circle  
    Heading: "Free templates don\u2019t cover your situation"
    Body: "They\u2019re generic. They miss IR35 clauses, UK payment terms, and the specific protection you actually need."
  
  Card 3 — No Protection
    Icon: warning triangle icon in red circle
    Heading: "Working without a contract is a liability"
    Body: "One bad client can cost you thousands. A proper contract takes that risk off the table permanently."

Below the cards, a green callout box:
  "ClauseKit solves all three. In under 2 minutes. For \u00A37."
  [Launch App \u2192]
```

---

### SECTION 5: HOW IT WORKS
```
bg-white

Section label: "HOW IT WORKS"
H2: "From blank page to signed contract in 3 steps"

Horizontal 3-step flow with numbered circles and connecting line:

Step 1: "Describe your situation"
  Visual: Text input mockup — show someone typing plain English
  Body: "No legal knowledge needed. Tell us who\u2019s involved, what the work is, and what you need protected."

Step 2: "AI drafts your contract"
  Visual: Animated loading state mockup (the 3 loading messages from the app)
  Body: "GPT-4o generates a bespoke UK-law document with all the right clauses for your exact situation."

Step 3: "Download and use"
  Visual: PDF/Word download button mockup
  Body: "Pay \u00A37 to unlock the full contract as PDF or Word. Ready to send to your client immediately."

Below: Live demo CTA
  "Try it yourself \u2014 free to generate"
  [Launch App \u2192]
```

---

### SECTION 6: WHY CLAUSEKIT WINS (Comparison Table)
```
bg-[#FAFAF8]

Section label: "THE COMPARISON"
H2: "ClauseKit vs your other options"

Full-width comparison table:
  Columns: Feature | ClauseKit | Solicitor | Template Website

  Rows:
  - Cost per contract         | \u00A37           | \u00A3150\u2013\u00A3500   | \u00A30 (but useless)
  - Time to receive           | 2 minutes    | 2\u20135 days     | Instant
  - Bespoke to your situation | Green tick   | Green tick   | Red cross
  - UK law compliant          | Green tick   | Green tick   | Sometimes
  - IR35 aware                | Green tick   | Red cross    | Red cross
  - GDPR data clause          | Green tick   | Red cross    | Red cross
  - IP ownership clause       | Green tick   | Green tick   | Red cross
  - Late payment protection   | Green tick   | Red cross    | Red cross
  - Available 24/7            | Green tick   | Red cross    | Green tick
  - No account needed         | Green tick   | Red cross    | Red cross

  Style: ClauseKit column has bg-[#D8F3DC] header with "Best option" badge
  Green ticks: text-[#2D6A4F] bold checkmark
  Red crosses: text-red-500 X mark

Below table: 
  "ClauseKit is the only option that\u2019s bespoke, instant, affordable, and UK-law compliant."
```

---

### SECTION 7: CONTRACT TYPES (The Offer)
```
bg-white

Section label: "WHAT WE COVER"
H2: "8 contract types. Every situation covered."

8-card grid (2x4 on desktop, 1x8 on mobile)
Each card matches the dashboard card style EXACTLY:
  - bg-white border border-[#E5E7EB] rounded-xl p-5
  - Icon in bg-[#D8F3DC] circle
  - Title: font-semibold text-[#111827]
  - Desc: text-sm text-[#6B7280]
  - Bottom: "Generate \u2192" in green text

Cards:
1. Freelance / Project Agreement
   "Scope, payment, IP ownership, revision limits \u2014 everything you need."
   
2. NDA (Mutual)
   "Both parties protect each other\u2019s confidential information."
   
3. NDA (One-Way)
   "You share; they sign. Airtight confidentiality clause."
   
4. Retainer Agreement
   "Monthly fee, scope of work, termination terms \u2014 ongoing clients sorted."
   
5. Subcontractor Agreement
   "Bring in a third party without exposing yourself."
   
6. Client Service Agreement
   "General terms for delivering services \u2014 works across industries."
   
7. Website Terms & Conditions
   "GDPR-compliant T&Cs, privacy policy and acceptable use."
   
8. Employment Offer Letter
   "Role, salary, start date, probation period \u2014 offer letters done right."

CTA below grid:
  "Don\u2019t see your contract type? Message us on WhatsApp."
  [Chat on WhatsApp]
```

---

### SECTION 8: TRUST SIGNALS
```
bg-[#FAFAF8]

Section label: "WHY TRUST US"
H2: "Built for UK freelancers, by people who\u2019ve needed this"

4-column trust grid:

  Trust card 1:
    Icon: Shield with checkmark
    Heading: "Solicitor-Reviewed"
    Body: "Every contract type has been reviewed by a qualified UK solicitor before it ever reaches you."
  
  Trust card 2:
    Icon: GPT-4o / AI chip icon
    Heading: "GPT-4o Powered"
    Body: "The most advanced AI available. Not a template \u2014 a genuinely bespoke document, every time."
  
  Trust card 3:
    Icon: UK flag or legal scales
    Heading: "UK Law Only"
    Body: "English & Welsh law, Late Payment of Commercial Debts Act 1998, IR35 awareness baked in."
  
  Trust card 4:
    Icon: Lock/GDPR shield
    Heading: "GDPR Compliant"
    Body: "We don\u2019t store your contract content. Generate, pay, download \u2014 that\u2019s it."

Below the 4 cards, a testimonials row (3 quotes):
  
  Quote 1:
    "\u201cI used to dread the contract conversation with new clients. ClauseKit made it something I actually look forward to.\u201d"
    \u2014 Sarah T., Freelance Web Designer, London
  
  Quote 2:
    "\u201cPaid \u00A37, got a contract that my clients take seriously. A solicitor quoted me \u00A3350 for the same thing.\u201d"
    \u2014 James M., Digital Marketing Consultant, Manchester
  
  Quote 3:
    "\u201cThe IR35 clause alone is worth the \u00A37. Most freelance templates don\u2019t even mention it.\u201d"
    \u2014 Priya K., UX Designer, Birmingham
```

---

### SECTION 9: PRICING (Clear and Simple)
```
bg-white

Section label: "PRICING"
H2: "Transparent pricing. No subscriptions needed."

Two pricing cards side by side:

  Card 1 \u2014 Pay Per Contract
    bg-white border-2 border-[#E5E7EB] rounded-2xl p-8
    
    Price: "\u00A37"
    Subtitle: "per contract"
    
    Features list (green ticks):
    \u2714 Generate completely free
    \u2714 Pay \u00A37 to unlock download
    \u2714 PDF + Word formats
    \u2714 No account needed
    \u2714 Use immediately
    
    CTA: [Generate a contract \u2192]
    
  Card 2 \u2014 Unlimited (\u201cBest Value\u201d badge)
    bg-[#2D6A4F] text-white rounded-2xl p-8 (featured card, slightly larger)
    
    Price: "\u00A319"
    Subtitle: "/month \u2014 cancel anytime"
    Badge: "Most Popular" in pale green on dark green
    
    Features list (white ticks):
    \u2714 Unlimited contract generation
    \u2714 All 8 contract types
    \u2714 PDF + Word downloads
    \u2714 Priority generation
    \u2714 New contract types as added
    \u2714 Cancel anytime
    
    CTA: [Start unlimited \u2192] (white button, dark green text)

Below both cards:
  Comparison note in small text:
  "Compare: a solicitor charges \u00A3150\u2013\u00A3500 for a basic freelance contract.
   One ClauseKit contract pays for 3 months of the unlimited plan."
```

---

### SECTION 10: WHATSAPP CTA (Mid-funnel)
```
bg-[#1B4332] text-white rounded-2xl mx-auto max-w-4xl my-16 p-12 text-center

Section H2: "Not sure which contract you need?"
Body: "Message us on WhatsApp. We\u2019ll tell you exactly which contract type fits your situation, and what to include in your description."

WhatsApp number to link to: https://wa.me/447700900000 (placeholder \u2014 replace with real number)

Large WhatsApp button: 
  bg-[#25D366] text-white rounded-xl px-8 py-4 text-lg font-semibold
  WhatsApp SVG icon left of text
  Text: "Chat with us on WhatsApp"
  
Below button: "\u2022 Usually replies within an hour \u2022 Free advice \u2022 No obligation"
```

---

### SECTION 11: FAQ
```
bg-[#FAFAF8]

Section label: "FAQ"
H2: "Everything you need to know"

Accordion-style FAQ (use Framer Motion AnimatePresence for open/close):

Q: Is this real legal advice?
A: "ClauseKit generates AI-drafted contracts that have been reviewed by a qualified UK solicitor. They are not a substitute for personalised legal advice, but they are significantly more robust than generic templates and are drafted under UK law."

Q: What makes ClauseKit different to free template sites?
A: "Free templates are generic. ClauseKit generates a bespoke document based on your specific situation \u2014 your client\u2019s name, the exact work, your payment terms, and the specific protections you need. No template does this."

Q: How does the payment work?
A: "Generating a contract is completely free. You only pay \u00A37 when you want to download the full PDF or Word version. No subscription needed unless you want unlimited downloads."

Q: Is my data secure?
A: "We don\u2019t store your contract content after generation. Your information is processed by OpenAI\u2019s GPT-4o and immediately discarded. We never share your data with third parties."

Q: Which law applies to the contracts?
A: "All contracts are drafted under English & Welsh law by default. They include relevant UK legislation including the Late Payment of Commercial Debts Act 1998 and are IR35 aware."

Q: What if I need a contract type that isn\u2019t listed?
A: "Message us on WhatsApp. We add new contract types regularly based on user requests, and we can usually help you adapt an existing type to your needs."
```

---

### SECTION 12: FINAL CTA (Bottom of Funnel)
```
bg-[#2D6A4F] text-white py-24 text-center

H2 (large, serif): "Your next contract is 2 minutes away"
Body: "No account. No solicitor. No waiting. \u00A37 and you\u2019re protected."

Two buttons:
  [Launch App \u2192] (white button, green text, large)
  [Chat on WhatsApp] (ghost white border button)

Below buttons: 
  Three trust icons in a row:
  \u2022 Solicitor-reviewed  \u2022 GPT-4o powered  \u2022 UK law only
```

---

### SECTION 13: FOOTER
```
bg-[#1B4332] text-white

Left: ClauseKit logo + tagline "AI contracts for UK freelancers & small businesses"
Middle columns:
  Contracts: Freelance, NDA, Retainer, Subcontractor, Service, T&Cs, Late Payment, Employment
  Company: How it works, Pricing, FAQ, WhatsApp
Right: 
  "Questions? Chat on WhatsApp" + button
  Social links (none needed for now)

Bottom bar:
  "\u00A9 2026 ClauseKit. AI-generated contracts. Not legal advice. ClauseKit Ltd."
```

---

## ANIMATIONS (Framer Motion)

Use `useInView` from framer-motion for scroll-triggered animations:

```tsx
const { ref, inView } = useInView({ triggerOnce: true, margin: '-80px' })

// Fade up on enter
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }
```

Apply to:
- Hero heading (staggered word by word or line by line)
- Each card grid (stagger children 0.1s)
- How it works steps (sequential left to right)
- Comparison table rows (stagger 0.05s per row)
- Trust cards (stagger 0.1s)
- FAQ items (instant open/close with AnimatePresence)
- Social proof marquee (infinite horizontal scroll)

---

## WHATSAPP BUTTON — FLOATING
```tsx
// Fixed bottom-right floating WhatsApp button (always visible)
<a
  href="https://wa.me/447700900000"
  target="_blank"
  className="fixed bottom-6 right-6 z-50 flex items-center gap-2 
             bg-[#25D366] text-white rounded-full px-5 py-3 
             shadow-lg hover:bg-[#1da851] transition-all"
>
  {/* WhatsApp SVG icon */}
  <span className="font-semibold text-sm">Chat with us</span>
</a>
```

---

## TECHNICAL REQUIREMENTS

- File: `app/page.tsx` (replace the current homepage)
- `'use client'` directive at top
- All string literals: use unicode escapes (\u00A3 for £, \u2014 for —, \u00B7 for ·, \u2019 for ', \u201c \u201d for " ")
- NO literal special characters in string literals (they cause encoding issues on Windows)
- Framer Motion: import from 'framer-motion' (already installed)
- Icons: import from 'lucide-react' (already installed)
- cn(): import from '@/lib/utils'
- No shadcn components needed — pure Tailwind + Framer Motion
- No external image dependencies — use CSS/SVG for all visuals
- Build must pass: `npm run build`
- After successful build: `git add app/page.tsx && git commit -m "feat: conversion-optimised homepage — funnel layout, trust signals, WhatsApp CTA" && git push origin main`

---

## WHAT MAKES THIS DIFFERENT FROM GENERIC

1. **Serif hero heading** — authority and trust, not tech-startup generic
2. **Pain-first structure** — show the problem before the solution (ClickFunnels principle)
3. **Comparison table** — visual proof of superiority vs alternatives
4. **WhatsApp floating button** — always accessible, low friction contact
5. **Solicitor-reviewed trust signal** — the biggest objection killer
6. **Bespoke language throughout** — "your exact situation" not "a template"
7. **Price anchoring** — always compare \u00A37 against the \u00A3150-500 solicitor alternative
8. **Cream/green palette matching the app** — continuity between marketing and product
9. **No stock photos** — product UI mockup and CSS visuals only
10. **Single-page funnel** — every section leads to the next, every section has a CTA
