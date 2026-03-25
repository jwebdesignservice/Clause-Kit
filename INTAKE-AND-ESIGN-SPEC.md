# ClauseKit — Intake Wizard & E-Signing Specification
**Version 1.0 | 25 March 2026**

---

## Overview

This document specifies:
1. The per-contract-type intake wizard — what questions to ask, in what format, why
2. The user & client details capture flow
3. The e-signing system — how contracts are sent, signed, and returned
4. The technical implementation plan

---

## 1. The Problem with the Current Intake

The current intake is 4 generic fields (description, party1, party2, value). This is too loose.

A freelance agreement needs completely different information to an NDA. A retainer needs recurring billing terms. An employment offer needs statutory minimum holiday entitlement. Generic fields produce generic contracts.

**The fix:** A multi-step, contract-type-specific wizard with typed inputs (text, dropdowns, date pickers, toggles) so we can feed precise structured data to the AI prompt — producing genuinely bespoke output.

---

## 2. Universal Sections (All Contract Types)

Before the contract-specific questions, every flow collects:

### Section A: Your Details (the user / service provider)
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Full name or company name | Text | Yes | |
| Trading name (if different) | Text | No | |
| Registered address | Textarea | Yes | |
| Company number | Text | No | If Ltd company |
| Email address | Email | Yes | Used for sending signed copy |
| Phone number | Tel | No | |
| VAT registered? | Toggle Y/N | No | If yes: show VAT number field |
| VAT number | Text | Conditional | Only if VAT registered |

### Section B: Other Party Details (client / recipient)
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Full name or company name | Text | Yes | |
| Contact name (if company) | Text | No | |
| Registered address | Textarea | Yes | |
| Company number | Text | No | Optional |
| Email address | Email | Yes | Used to send contract for signing |

### Section C: Contract Meta
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Contract start date | Date picker | Yes | |
| Governing law | Dropdown | Yes | England & Wales / Scotland / Northern Ireland |
| Contract reference / name | Text | No | Auto-populated if blank, e.g. "Freelance Agreement — Acme Ltd — March 2026" |

---

## 3. Per-Contract-Type Intake Questions

---

### 3.1 Freelance / Project Agreement

**Purpose:** Protects a freelancer delivering a defined project to a client. Covers scope, payment, IP, revisions, termination, and IR35.

**Key UK law:** Late Payment of Commercial Debts (Interest) Act 1998, IR35 (Chapter 10 ITEPA 2003)

#### Questions

**Project Scope**
| Field | Type | Options / Notes |
|-------|------|-----------------|
| Project title | Text | e.g. "Website redesign for Acme Ltd" |
| Describe the project deliverables | Textarea | Plain English — what is being built/created/delivered? |
| Are deliverables digital, physical, or both? | Dropdown | Digital / Physical / Both |
| List specific deliverables | Repeatable text fields | e.g. "Homepage design", "5-page website" |

**Timeline**
| Field | Type | Notes |
|-------|------|-------|
| Project start date | Date | |
| Estimated completion date | Date | |
| Is there a fixed deadline? | Toggle Y/N | If yes: show "consequences of late delivery" field |
| Milestone dates (optional) | Repeatable date + description | |

**Payment**
| Field | Type | Options |
|-------|------|---------|
| Fee structure | Dropdown | Fixed fee / Hourly rate / Day rate / Milestone-based |
| Total amount (if fixed) | Currency (£) | |
| Hourly/day rate | Currency (£) | Conditional |
| Estimated hours/days | Number | Conditional |
| Deposit required? | Toggle Y/N | |
| Deposit percentage | Dropdown | 25% / 33% / 50% / Custom |
| Payment schedule | Dropdown | On completion / 50% upfront + 50% on completion / Milestone-based / Monthly |
| Invoice payment terms | Dropdown | 7 days / 14 days / 30 days |
| Late payment interest | Auto-set | Statutory 8% above BoE base rate (Late Payment Act) — inform user, no input needed |
| Currency | Dropdown | GBP / EUR / USD |

**Revisions & Scope**
| Field | Type | Notes |
|-------|------|-------|
| Number of revisions included | Dropdown | 1 / 2 / 3 / Unlimited / None |
| What happens after revisions are used? | Dropdown | Additional cost at day rate / Additional cost at fixed rate / Negotiated |
| Additional revision rate (if applicable) | Currency | |
| Change request process | Dropdown | Written approval required / Email approval / Verbal OK |

**Intellectual Property**
| Field | Type | Options |
|-------|------|---------|
| When does IP transfer to client? | Dropdown | On full payment / On project completion / Never (licence only) |
| Does freelancer retain right to show work in portfolio? | Toggle Y/N | |
| Are there any third-party assets / stock included? | Toggle Y/N | If yes: add disclosure note |

**Termination**
| Field | Type | Options |
|-------|------|---------|
| Notice period to terminate | Dropdown | 7 days / 14 days / 30 days / No notice (fixed term only) |
| Who can terminate? | Dropdown | Either party / Client only / Freelancer only |
| What happens to work in progress on termination? | Dropdown | Client pays for work done to date / Freelancer keeps deposit / Full fee still due |

**Confidentiality**
| Field | Type | Notes |
|-------|------|-------|
| Does client share confidential information? | Toggle Y/N | If yes: adds NDA-lite clause |
| Duration of confidentiality | Dropdown | 1 year / 2 years / Indefinite |

**IR35 / Tax Status** (auto-included — just inform user)
- Clause automatically added confirming self-employed status
- User sees a notice: "ClauseKit automatically includes an IR35 awareness clause."

---

### 3.2 NDA — Mutual

**Purpose:** Both parties agree to protect each other's confidential information when exploring a potential business relationship or collaboration.

**Key UK law:** Common law of confidence, trade secrets (Trade Secrets (Enforcement etc) Regulations 2018)

#### Questions

**Nature of Disclosure**
| Field | Type | Options |
|-------|------|---------|
| Purpose of the NDA | Dropdown | Exploring a business partnership / Discussing a potential project / Due diligence / Employment pre-offer / Licensing / Other |
| Describe what confidential information will be shared | Textarea | e.g. "Business plans, client lists, proprietary software" |
| Does this include technical / trade secrets? | Toggle Y/N | |
| Does this include financial information? | Toggle Y/N | |
| Does this include personal data? | Toggle Y/N | If yes: GDPR note added automatically |

**Duration & Geography**
| Field | Type | Options |
|-------|------|---------|
| How long should the NDA last? | Dropdown | 1 year / 2 years / 3 years / 5 years / Indefinite |
| Geographic scope | Dropdown | United Kingdom / Worldwide / Specific countries (text field) |

**Exceptions** (auto-included, user informed)
- Standard exceptions automatically included: publicly available info, independently developed, legally compelled disclosure

**Remedies**
| Field | Type | Options |
|-------|------|---------|
| Specify remedies for breach? | Toggle Y/N | If yes: injunctive relief clause added |
| Agreed damages for breach | Currency | Optional — leave blank for general damages |

---

### 3.3 NDA — One-Way

Same as Mutual NDA above, except:
- Only one party is the "Disclosing Party"
- Questions identify clearly who is disclosing and who is receiving
- Additional field: "What is the receiving party permitted to do with the information?" — Dropdown: Evaluate only / Use in delivery of specific project / Cannot share with third parties

---

### 3.4 Retainer Agreement

**Purpose:** Locks in an ongoing service relationship with a recurring monthly fee.

**Key UK law:** Same as Freelance — Late Payment Act, IR35

#### Questions

**Services**
| Field | Type | Notes |
|-------|------|-------|
| Describe the ongoing services | Textarea | e.g. "Social media management, 20 posts/month across 3 platforms" |
| Hours included per month | Number | e.g. 20 |
| What happens if hours are unused? | Dropdown | Roll over to next month / Lost / Credited |
| What happens if hours are exceeded? | Dropdown | Charged at day rate / Capped at retainer scope / Agreed in advance |
| Overflow hourly/day rate | Currency | |

**Payment**
| Field | Type | Notes |
|-------|------|-------|
| Monthly retainer fee | Currency | |
| Payment due date each month | Dropdown | 1st of month / Last working day / On invoice |
| Invoice payment terms | Dropdown | 7 days / 14 days / 30 days |
| First payment date | Date | |

**Term & Termination**
| Field | Type | Options |
|-------|------|---------|
| Minimum commitment period | Dropdown | None / 1 month / 3 months / 6 months / 12 months |
| Notice period after minimum | Dropdown | 1 month / 2 months / 3 months |
| Auto-renewal? | Toggle Y/N | |

**Reviews**
| Field | Type | Options |
|-------|------|---------|
| Can fee be reviewed? | Toggle Y/N | |
| Review period | Dropdown | Annually / Every 6 months |
| Notice required for fee increase | Dropdown | 30 days / 60 days / 90 days |

---

### 3.5 Subcontractor Agreement

**Purpose:** Freelancer engages a third party (subcontractor) to help deliver work to their end client. The main contractor remains liable to the end client.

**Key UK law:** IR35, Supply of Goods and Services Act 1982

#### Questions

**Project Details**
| Field | Type | Notes |
|-------|------|-------|
| Describe the subcontracted work | Textarea | What specific part of the main project is being subcontracted? |
| Deliverables from subcontractor | Repeatable text | |
| Deadline for subcontracted work | Date | Must be before your client deadline |

**Payment**
| Field | Type | Options |
|-------|------|---------|
| Fee structure | Dropdown | Fixed / Day rate / Milestone |
| Total amount or rate | Currency | |
| Payment terms after delivery | Dropdown | 7 days / 14 days / 30 days after client accepts work |

**Liability & Quality**
| Field | Type | Options |
|-------|------|---------|
| Does subcontractor warrant work will meet a standard? | Toggle Y/N | |
| Consequences if work is defective | Dropdown | Must fix at own cost / Fee reduction / Liable for losses |
| Does subcontractor carry professional indemnity insurance? | Toggle Y/N | If yes: minimum amount field |

**Confidentiality & IP**
| Field | Type | Notes |
|-------|------|-------|
| Must subcontractor sign NDA? | Toggle Y/N | If yes: NDA clause auto-embedded |
| IP in work flows up to main contractor | Auto-set | Clause always included |
| Can subcontractor show work in portfolio? | Toggle Y/N | |

---

### 3.6 Client Service Agreement

**Purpose:** General terms for ongoing or project-based service delivery across industries.

More flexible than Freelance Agreement — suitable for agencies, consultants, coaches, tradespeople.

#### Questions (combines elements of Freelance + Retainer)

**Services**
| Field | Type | Notes |
|-------|------|-------|
| Type of service | Dropdown | Consulting / Agency services / Coaching / Training / IT services / Trades / Professional services / Other |
| Describe the services | Textarea | |
| Is this project-based or ongoing? | Dropdown | One-off project / Ongoing / Combination |

**Liability**
| Field | Type | Options |
|-------|------|---------|
| Limit liability? | Toggle Y/N | Recommended yes for agencies |
| Liability cap | Dropdown | Value of contract / 2x contract value / £10,000 / £50,000 / Custom |
| Exclude consequential loss? | Toggle Y/N | e.g. client's lost profits due to delay |

**Dispute Resolution**
| Field | Type | Options |
|-------|------|---------|
| Preferred dispute resolution | Dropdown | Negotiation first / Mediation / Arbitration / Straight to court |
| Mediation body preference | Text | Optional, e.g. "CEDR" |

(+ Payment, Timeline, IP from Freelance questions above, all included)

---

### 3.7 Website Terms & Conditions

**Purpose:** Legal terms governing use of a website or SaaS product.

**Key UK law:** Consumer Rights Act 2015, UK GDPR / Data Protection Act 2018, Electronic Commerce Regulations 2002

#### Questions

**Website Details**
| Field | Type | Notes |
|-------|------|-------|
| Website URL | URL | |
| Type of website | Dropdown | Informational / E-commerce / SaaS / Marketplace / Community / Blog / Other |
| Does the site collect personal data? | Toggle Y/N | Always yes in practice — pre-select yes |
| Does the site use cookies? | Toggle Y/N | |
| Does the site sell products or services? | Toggle Y/N | |
| Does the site allow user-generated content? | Toggle Y/N | |
| Is the site aimed at consumers (B2C)? | Toggle Y/N | Affects Consumer Rights Act clauses |

**Content & Liability**
| Field | Type | Options |
|-------|------|---------|
| Do you provide professional advice? | Dropdown | No / Yes — legal / Yes — financial / Yes — medical / Other |
| Disclaimers needed for advice? | Auto | If advice selected: disclaimer clause added |
| Limit liability for site downtime? | Toggle Y/N | |

**Data & Privacy**
| Field | Type | Notes |
|-------|------|-------|
| Data controller name | Text | Auto-filled from Section A |
| Data Protection Officer (if applicable) | Toggle Y/N | |
| DPO email | Email | Conditional |
| Cookie types used | Multi-select | Essential / Analytics / Marketing / Functional |
| Third-party data processors (e.g. Stripe, Google Analytics) | Repeatable text | |

---

### 3.8 Late Payment Letter

**Purpose:** Formal legal letter demanding payment of an overdue invoice, invoking the Late Payment of Commercial Debts (Interest) Act 1998.

**Key UK law:** Late Payment of Commercial Debts (Interest) Act 1998 — statutory interest at 8% above BoE base rate, £40–£100 fixed compensation per invoice

#### Questions

| Field | Type | Notes |
|-------|------|-------|
| Invoice number(s) | Repeatable text | |
| Invoice date(s) | Repeatable date | |
| Invoice amount(s) | Repeatable currency | |
| Original payment due date | Date | |
| Days overdue | Auto-calculated | |
| Statutory interest amount | Auto-calculated | 8% above BoE base rate from due date |
| Fixed compensation (auto) | Auto-set | £40 for invoices <£1,000 / £70 for £1k–£10k / £100 for >£10k |
| Has debtor acknowledged the invoice? | Toggle Y/N | |
| Have you previously chased? | Toggle Y/N | If yes: date of last chase |
| Final deadline for payment | Date | Recommended 7–14 days |
| Threat of legal action? | Toggle Y/N | Small claims (up to £10k) / County Court / Solicitors |

---

### 3.9 Employment Offer Letter

**Purpose:** Formal offer of employment. Not a full employment contract — but satisfies the requirement for a written statement of particulars (Employment Rights Act 1996, s.1).

**Key UK law:** Employment Rights Act 1996, Working Time Regulations 1998, Equality Act 2010, National Minimum Wage Act 1998

#### Questions

**Role Details**
| Field | Type | Notes |
|-------|------|-------|
| Job title | Text | |
| Department / team | Text | Optional |
| Reporting to (line manager title) | Text | |
| Place of work | Text | e.g. "123 High Street, London" or "Remote" |
| Is role hybrid/remote? | Dropdown | Office only / Hybrid / Fully remote |
| Start date | Date | |

**Pay & Benefits**
| Field | Type | Notes |
|-------|------|-------|
| Employment type | Dropdown | Full-time / Part-time / Fixed-term |
| Salary | Currency per year | |
| Pay frequency | Dropdown | Monthly / Weekly / Fortnightly |
| Is salary above NMW? | Auto-check | Warn if below current NMW (£11.44/hr from April 2024) |
| Bonus scheme? | Toggle Y/N | If yes: description field |
| Commission structure? | Toggle Y/N | If yes: description field |
| Benefits included | Multi-select | Pension / Private healthcare / Life assurance / Car allowance / Season ticket loan / Gym / None |
| Pension contribution (employer) | Percentage | Min 3% under auto-enrolment |

**Hours & Holiday**
| Field | Type | Notes |
|-------|------|-------|
| Hours per week | Number | |
| Core hours | Text | e.g. "9am–5pm Mon–Fri" |
| Holiday entitlement (days) | Number | Statutory minimum 28 days inc bank holidays (Working Time Regs 1998) — warn if below |
| Holiday year runs | Dropdown | January–December / April–March / Rolling anniversary |
| Can holiday be carried over? | Toggle Y/N | Max 4 weeks under WTR |

**Probation & Notice**
| Field | Type | Notes |
|-------|------|-------|
| Probation period | Dropdown | None / 1 month / 3 months / 6 months |
| Notice during probation | Dropdown | 1 week / 2 weeks / As per contract |
| Notice after probation | Dropdown | 1 month / 3 months / By negotiation |
| Enhanced notice vs statutory minimum | Toggle Y/N | Statutory is 1 week per year of service |

**Other**
| Field | Type | Notes |
|-------|------|-------|
| Subject to satisfactory references? | Toggle Y/N | |
| Subject to right to work check? | Auto-yes | Always required — clause included |
| Subject to DBS check? | Toggle Y/N | |
| Restrictive covenants? | Toggle Y/N | If yes: non-compete radius + duration fields |
| Non-compete duration | Dropdown | 3 months / 6 months / 12 months |
| Non-solicitation of clients? | Toggle Y/N | |
| Non-solicitation of staff? | Toggle Y/N | |

---

## 4. Wizard UX Flow

### Step Structure

```
STEP 1: Choose contract type (existing card grid)
STEP 2: Your details (Section A)
STEP 3: Their details (Section B)
STEP 4: Contract meta (Section C — dates, governing law)
STEP 5+: Contract-specific questions (grouped into logical sub-sections with progress indicator)
FINAL STEP: Review & Generate
```

### Progress Indicator
- Show step X of Y at the top
- Section headers with brief explanation of why this section matters
- Optional fields clearly marked "(optional)"
- Inline help text on complex fields (e.g. IR35 tooltip)
- "Save and continue later" — save to localStorage

### Input Types
- **Text** — single line
- **Textarea** — multi-line plain English
- **Currency** — £ prefix, number only, formatted on blur
- **Date picker** — calendar UI, dd/mm/yyyy format
- **Dropdown / Select** — pre-defined options (as specified above)
- **Toggle / Switch** — yes/no binary choices
- **Multi-select** — checkboxes for multiple options (e.g. benefits)
- **Repeatable fields** — add/remove rows (invoices, deliverables, milestones)
- **Auto-calculated** — read-only, computed from other inputs (e.g. statutory interest)

---

## 5. E-Signing System

### 5.1 The Flow

```
User generates contract
    ↓
User pays £7 (Stripe checkout)
    ↓
User receives email with:
  - PDF preview (watermarked "DRAFT" until signed)
  - Link to ClauseKit signing page
    ↓
User reviews and signs on ClauseKit (draw/type signature)
    ↓
ClauseKit emails OTHER PARTY with:
  - "You have a document to sign from [User Name]"
  - Link to their signing page
    ↓
Other party opens link, reviews, signs
    ↓
Both parties receive FINAL signed PDF via email
  - PDF has both signatures embedded
  - Audit trail page at end: name, IP, timestamp, email, signature
    ↓
Both PDFs stored for 90 days with secure download link
```

### 5.2 Signing Page Features

- **Document viewer** — full contract rendered on screen, scrollable
- **Signature block at bottom** — draw (canvas), type (styled font), or upload image
- **Required reading confirmation** — "I have read and agree to this contract" checkbox
- **Date auto-populated** — current date at signing
- **Print name confirmation** — typed name under signature
- **Email confirmation** — email address verified before signing

### 5.3 Audit Trail (appended to signed PDF)

Each signed contract includes a final page:

```
EXECUTION CERTIFICATE

Document: [Title]
Reference: [Auto-generated ID]

Party 1: [Name]
  Signed: [Date + Time GMT]
  IP Address: [IP]
  Email: [email]
  Signature: [embedded image]

Party 2: [Name]
  Signed: [Date + Time GMT]
  IP Address: [IP]
  Email: [email]
  Signature: [embedded image]

This document was executed electronically in accordance with
the Electronic Communications Act 2000 and The Law Commission's
guidance on electronic execution of documents (2019).
```

### 5.4 Legal Validity of E-Signatures in the UK

Electronic signatures are legally valid in the UK under:
- **Electronic Communications Act 2000, s.7** — electronic signatures are admissible
- **The Law Commission — Electronic Execution of Documents (2019)** — confirms e-signatures are valid for most contracts
- **eIDAS Regulation (retained in UK law)** — simple electronic signatures valid for commercial contracts

**NOT valid for:** deeds requiring wet ink (e.g. property transfers, LPAs). ClauseKit should add a disclaimer for these cases.

### 5.5 Technical Implementation Options

#### Option A: Build in-house (recommended for MVP)
- Signature capture: `react-signature-canvas` (npm) for draw mode
- Typed signature: styled font rendering to canvas
- PDF embedding: `pdf-lib` (already installed) — embed signature image into PDF
- Email delivery: **Resend** (resend.com) — simple API, 3,000 emails/month free
- Secure signing links: JWT tokens with 7-day expiry, stored in contract store
- Storage: extend the file-based contract store to include signing status + signatures

**Cost:** £0 additional (Resend free tier covers MVP volume)

#### Option B: Use a third-party e-sign provider
- **DocuSeal** (open source, self-hostable) — best option if volume grows
- **Docusign** — expensive, overkill for MVP
- **Adobe Sign** — same issue

**Recommendation: Option A for MVP.** Option B when monthly contract volume exceeds ~500/month.

---

## 6. Email Flow (Resend)

### Emails to send

| Trigger | Recipient | Subject | Content |
|---------|-----------|---------|---------|
| Payment confirmed | User | "Your contract is ready to sign" | PDF preview link + sign button |
| User signs | Other party | "[Name] has sent you a contract to sign" | Contract summary + sign link |
| Other party signs | User | "Contract fully executed — download your signed copy" | Final PDF download |
| Other party signs | Other party | "Your signed copy of [contract name]" | Final PDF download |
| 48h reminder | Other party (if unsigned) | "Reminder: you have a contract waiting to sign" | |
| 7-day expiry warning | User | "Signing link expiring soon" | Remind to chase |

### Email Templates
- Clean, minimal HTML email
- ClauseKit green branding (#2D6A4F header)
- Clear single CTA button per email
- Plain text fallback
- Footer: "Not legal advice. ClauseKit Ltd."

---

## 7. Database / Storage Requirements

Currently using file-based JSON store. For e-signing this needs to be extended.

### Contract Record (extended)
```typescript
interface ContractRecord {
  id: string
  contractType: string
  title: string
  content: string           // raw AI-generated text
  pdfUrl?: string           // path to generated PDF
  createdAt: string

  // Parties
  party1: {
    name: string
    email: string
    address: string
    company?: string
    companyNumber?: string
    vatNumber?: string
  }
  party2: {
    name: string
    email: string
    address: string
    company?: string
    companyNumber?: string
  }

  // Signing
  signingStatus: 'pending_payment' | 'pending_party1' | 'pending_party2' | 'complete'
  party1SigningToken?: string    // JWT, 7-day expiry
  party2SigningToken?: string    // JWT, 7-day expiry
  party1Signature?: {
    dataUrl: string             // base64 signature image
    signedAt: string
    ipAddress: string
    printedName: string
  }
  party2Signature?: {
    dataUrl: string
    signedAt: string
    ipAddress: string
    printedName: string
  }
  signedPdfUrl?: string         // final signed PDF path
  expiresAt: string             // 90 days from creation
}
```

### Storage Recommendation
- **MVP:** Vercel KV (Redis) — replaces file store, works on Vercel serverless
- **Scale:** PlanetScale (MySQL) or Supabase (Postgres)
- **Files:** Vercel Blob for PDF storage

---

## 8. Implementation Priority

### Phase 1 — Better Intake (Week 1)
- [ ] Replace 4-field form with per-type wizard
- [ ] Implement Section A (your details) + Section B (their details) as fixed first steps
- [ ] Build question sets for all 8 contract types
- [ ] Dropdown + toggle + date picker components
- [ ] Repeatable field component
- [ ] Pass structured data to `/api/generate` — update prompt builder to use structured fields

### Phase 2 — E-Signing (Week 2)
- [ ] Install: `react-signature-canvas`, `resend`, `jsonwebtoken`
- [ ] Migrate contract store to Vercel KV
- [ ] Build signing page (`/sign/[token]`)
- [ ] Signature capture component (draw + type modes)
- [ ] PDF signing — embed signatures with `pdf-lib`
- [ ] Audit trail page generation
- [ ] Email flow via Resend (6 email templates)
- [ ] Update Stripe webhook to trigger signing email on payment

### Phase 3 — Polish (Week 3)
- [ ] "Save and continue later" (localStorage persistence of intake progress)
- [ ] Contract preview before generating (summary of inputs)
- [ ] Signed contract dashboard — show status (pending sign / fully executed)
- [ ] 48h reminder emails
- [ ] Expiry handling

---

## 9. Key Dependencies to Install

```bash
npm install react-signature-canvas @types/react-signature-canvas
npm install resend
npm install jsonwebtoken @types/jsonwebtoken
npm install @vercel/kv
npm install date-fns  # for date calculations (statutory interest, reminders)
```

---

## 10. Environment Variables Needed

```env
# Already present
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=

# New
RESEND_API_KEY=          # from resend.com (free tier)
JWT_SECRET=              # random 32-char string
KV_REST_API_URL=         # from Vercel KV
KV_REST_API_TOKEN=       # from Vercel KV
```

---

## 11. What This Produces vs What Competitors Do

| Feature | ClauseKit (after this build) | DocuSign | HelloSign | Free templates |
|---------|------------------------------|----------|-----------|----------------|
| Bespoke AI drafting | ✓ | ✗ | ✗ | ✗ |
| UK-specific clauses | ✓ | ✗ | ✗ | Sometimes |
| Type-specific intake wizard | ✓ | ✗ | ✗ | ✗ |
| E-signing built in | ✓ | ✓ | ✓ | ✗ |
| Email delivery | ✓ | ✓ | ✓ | ✗ |
| Audit trail | ✓ | ✓ | ✓ | ✗ |
| Price | £7/doc | £30+/doc | £15+/doc | £0 (risky) |
| IR35 awareness | ✓ | ✗ | ✗ | ✗ |
| Late payment protection | ✓ | ✗ | ✗ | ✗ |

---

## 12. Open Questions for Operators

Before building Phase 2, confirm:

1. **WhatsApp number** — what's the real number? (placeholder is 447700900000)
2. **Business email domain** — what sender email for Resend? (e.g. contracts@clausekit.co.uk)
3. **Stripe mode** — currently using test keys. When go live?
4. **Solicitor review** — do you have a UK solicitor who has reviewed the prompts? If not, the "solicitor-reviewed" claim on the homepage needs caveating.
5. **Storage** — Vercel KV is £0 for low volume. Confirm Vercel team plan or hobby plan?
6. **90-day retention** — is this long enough? Legal recommendation is 7 years for some contract types.

---

*This document is the source of truth for ClauseKit intake and e-signing development. Update it as decisions are made.*
