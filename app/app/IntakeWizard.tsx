/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Plus, X as XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface IntakeData {
  // Your details
  yourName: string
  yourEmail: string
  yourAddress: string
  yourCompanyNumber: string
  yourVatNumber: string
  // Their details
  theirName: string
  theirEmail: string
  theirAddress: string
  theirContactName: string
  // Contract meta
  contractStartDate: string
  governingLaw: string
  // Contract-specific — all optional, populated based on type
  [key: string]: string | string[]
}

interface WizardProps {
  contractTypeId: string
  contractTypeTitle: string
  onComplete: (data: IntakeData) => void
  onBack: () => void
}

// ── Shared input styles ────────────────────────────────────────────────────────

const inputClass = "w-full border px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
const inputStyle = { borderColor: '#E5E5E2', backgroundColor: '#FAFAF8', color: '#1A1A1A' }
const labelClass = "block text-sm font-semibold mb-1.5"
const labelStyle = { color: '#1B4332' }
const optionalTag = <span className="text-xs font-normal ml-1" style={{ color: '#9CA3AF' }}>(optional)</span>

// ── Field components ───────────────────────────────────────────────────────────

function Field({ label, optional, hint, children }: { label: string; optional?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass} style={labelStyle}>
        {label}{optional && optionalTag}
        {!optional && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{hint}</p>}
    </div>
  )
}

function Input({ name, value, onChange, placeholder, type = 'text' }: {
  name: string; value: string; onChange: (k: string, v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
      placeholder={placeholder}
      className={inputClass}
      style={inputStyle}
    />
  )
}

function Textarea({ name, value, onChange, placeholder, rows = 4 }: {
  name: string; value: string; onChange: (k: string, v: string) => void; placeholder?: string; rows?: number
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={cn(inputClass, 'resize-none')}
      style={inputStyle}
    />
  )
}

function Select({ name, value, onChange, options }: {
  name: string; value: string; onChange: (k: string, v: string) => void; options: string[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
      className={inputClass}
      style={inputStyle}
    >
      <option value="">Select...</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function Toggle({ name, value, onChange, label }: {
  name: string; value: string; onChange: (k: string, v: string) => void; label: string
}) {
  const on = value === 'yes'
  return (
    <div className="flex items-center justify-between p-3 border" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
      <span className="text-sm" style={{ color: '#374151' }}>{label}</span>
      <button
        type="button"
        onClick={() => onChange(name, on ? 'no' : 'yes')}
        className="relative w-10 h-5 transition-colors flex-shrink-0"
        style={{ backgroundColor: on ? '#2D6A4F' : '#D1D5DB', borderRadius: 9999 }}
      >
        <span
          className="absolute top-0.5 w-4 h-4 bg-white transition-transform"
          style={{ borderRadius: 9999, transform: on ? 'translateX(20px)' : 'translateX(2px)' }}
        />
      </button>
    </div>
  )
}

function MultiSelect({ name, value, onChange, options }: {
  name: string; value: string[]; onChange: (k: string, v: string[]) => void; options: string[]
}) {
  const toggle = (opt: string) => {
    const cur = value ?? []
    onChange(name, cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt])
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const sel = (value ?? []).includes(opt)
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className="px-3 py-1.5 text-xs font-medium border transition-colors"
            style={sel
              ? { backgroundColor: '#D8F3DC', borderColor: '#2D6A4F', color: '#1B4332' }
              : { backgroundColor: '#FAFAF8', borderColor: '#E5E5E2', color: '#6B7280' }
            }
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function RepeatableField({ name, values, onChange, placeholder }: {
  name: string; values: string[]; onChange: (k: string, v: string[]) => void; placeholder?: string
}) {
  const update = (i: number, v: string) => {
    const next = [...values]
    next[i] = v
    onChange(name, next)
  }
  const add = () => onChange(name, [...values, ''])
  const remove = (i: number) => onChange(name, values.filter((_, idx) => idx !== i))
  return (
    <div className="space-y-2">
      {values.map((v, i) => (
        <div key={i} className="flex gap-2">
          <input
            type="text"
            value={v}
            onChange={(e) => update(i, e.target.value)}
            placeholder={placeholder}
            className={cn(inputClass, 'flex-1')}
            style={inputStyle}
          />
          {values.length > 1 && (
            <button type="button" onClick={() => remove(i)} className="px-2 border hover:bg-red-50" style={{ borderColor: '#E5E5E2' }}>
              <XIcon className="w-3.5 h-3.5 text-red-400" />
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1.5 text-xs font-semibold hover:opacity-70" style={{ color: '#2D6A4F' }}>
        <Plus className="w-3 h-3" /> Add another
      </button>
    </div>
  )
}

// ── Contract-specific question sets ───────────────────────────────────────────

function FreelanceQuestions({ data, set, setArr }: { data: IntakeData; set: (k: string, v: string) => void; setArr: (k: string, v: string[]) => void }) {
  return (
    <div className="space-y-5">
      <SectionHeading title="Project Details" />
      <Field label="Project title" hint="e.g. Website redesign for Acme Ltd">
        <Input name="projectTitle" value={data.projectTitle as string ?? ''} onChange={set} placeholder="e.g. Brand identity project" />
      </Field>
      <Field label="Describe the deliverables" hint="What exactly are you delivering? Be specific.">
        <Textarea name="deliverables" value={data.deliverables as string ?? ''} onChange={set} placeholder="e.g. Logo design (3 concepts + revisions), brand guidelines document, social media kit" rows={3} />
      </Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Project start date">
          <Input name="projectStartDate" value={data.projectStartDate as string ?? ''} onChange={set} type="date" />
        </Field>
        <Field label="Estimated completion date">
          <Input name="projectEndDate" value={data.projectEndDate as string ?? ''} onChange={set} type="date" />
        </Field>
      </div>

      <SectionHeading title="Payment" />
      <Field label="Fee structure">
        <Select name="feeStructure" value={data.feeStructure as string ?? ''} onChange={set} options={['Fixed fee', 'Hourly rate', 'Day rate', 'Milestone-based']} />
      </Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Total fee or rate (£)" hint="e.g. 4500 or 450/day">
          <Input name="feeAmount" value={data.feeAmount as string ?? ''} onChange={set} placeholder="e.g. 4500" />
        </Field>
        <Field label="Invoice payment terms">
          <Select name="paymentTerms" value={data.paymentTerms as string ?? ''} onChange={set} options={['7 days', '14 days', '30 days', '60 days']} />
        </Field>
      </div>
      <Field label="Payment schedule">
        <Select name="paymentSchedule" value={data.paymentSchedule as string ?? ''} onChange={set} options={['Full payment on completion', '50% upfront, 50% on completion', '33% upfront, 33% mid-project, 33% on completion', 'Monthly invoicing', 'Milestone-based payments']} />
      </Field>
      <Toggle name="depositRequired" value={data.depositRequired as string ?? 'no'} onChange={set} label="Deposit required?" />
      {data.depositRequired === 'yes' && (
        <Field label="Deposit percentage" optional>
          <Select name="depositPercentage" value={data.depositPercentage as string ?? ''} onChange={set} options={['25%', '33%', '50%']} />
        </Field>
      )}

      <SectionHeading title="Revisions & Scope" />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Revisions included">
          <Select name="revisionsIncluded" value={data.revisionsIncluded as string ?? ''} onChange={set} options={['1 round', '2 rounds', '3 rounds', 'Unlimited', 'No revisions included']} />
        </Field>
        <Field label="Additional revision rate" optional hint="If revisions are used up">
          <Input name="additionalRevisionRate" value={data.additionalRevisionRate as string ?? ''} onChange={set} placeholder="e.g. £150/hr" />
        </Field>
      </div>

      <SectionHeading title="Intellectual Property" />
      <Field label="When does IP transfer to the client?">
        <Select name="ipTransfer" value={data.ipTransfer as string ?? ''} onChange={set} options={['On full payment received', 'On project completion', 'Licence only — IP stays with freelancer']} />
      </Field>
      <Toggle name="portfolioRight" value={data.portfolioRight as string ?? 'yes'} onChange={set} label="Freelancer may show work in portfolio?" />

      <SectionHeading title="Termination & Confidentiality" />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Notice period to terminate">
          <Select name="noticePeriod" value={data.noticePeriod as string ?? ''} onChange={set} options={['7 days', '14 days', '30 days', 'No notice — fixed term only']} />
        </Field>
        <Field label="Work in progress on termination">
          <Select name="terminationWIP" value={data.terminationWIP as string ?? ''} onChange={set} options={['Client pays for work done to date', 'Freelancer keeps deposit', 'Full fee remains due']} />
        </Field>
      </div>
      <Toggle name="confidentialityRequired" value={data.confidentialityRequired as string ?? 'no'} onChange={set} label="Client will share confidential information?" />
      {data.confidentialityRequired === 'yes' && (
        <Field label="Confidentiality duration" optional>
          <Select name="confidentialityDuration" value={data.confidentialityDuration as string ?? ''} onChange={set} options={['1 year', '2 years', '3 years', 'Indefinite']} />
        </Field>
      )}
    </div>
  )
}

function NdaMutualQuestions({ data, set }: { data: IntakeData; set: (k: string, v: string) => void }) {
  return (
    <div className="space-y-5">
      <SectionHeading title="Purpose & Information" />
      <Field label="Purpose of this NDA">
        <Select name="ndaPurpose" value={data.ndaPurpose as string ?? ''} onChange={set} options={['Exploring a business partnership', 'Discussing a potential project', 'Due diligence / acquisition', 'Pre-employment discussions', 'Licensing negotiations', 'Supplier relationship', 'Other']} />
      </Field>
      <Field label="Describe the confidential information to be shared" hint="Be specific — this defines what is protected.">
        <Textarea name="confidentialInfo" value={data.confidentialInfo as string ?? ''} onChange={set} placeholder="e.g. Business plans, client lists, financial forecasts, proprietary software architecture" rows={3} />
      </Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Toggle name="includesTechnical" value={data.includesTechnical as string ?? 'no'} onChange={set} label="Includes technical / trade secrets?" />
        <Toggle name="includesFinancial" value={data.includesFinancial as string ?? 'no'} onChange={set} label="Includes financial information?" />
        <Toggle name="includesPersonalData" value={data.includesPersonalData as string ?? 'no'} onChange={set} label="Includes personal data (GDPR applies)?" />
      </div>

      <SectionHeading title="Duration & Scope" />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="How long should this NDA last?">
          <Select name="ndaDuration" value={data.ndaDuration as string ?? ''} onChange={set} options={['1 year', '2 years', '3 years', '5 years', 'Indefinite']} />
        </Field>
        <Field label="Geographic scope">
          <Select name="ndaScope" value={data.ndaScope as string ?? ''} onChange={set} options={['United Kingdom', 'United Kingdom & EU', 'Worldwide']} />
        </Field>
      </div>

      <SectionHeading title="Remedies" />
      <Toggle name="injunctiveRelief" value={data.injunctiveRelief as string ?? 'yes'} onChange={set} label="Include injunctive relief clause for breach?" />
    </div>
  )
}

function NdaOneWayQuestions({ data, set }: { data: IntakeData; set: (k: string, v: string) => void }) {
  return (
    <div className="space-y-5">
      <SectionHeading title="Disclosing Party" />
      <Field label="Who is disclosing the confidential information?">
        <Select name="disclosingParty" value={data.disclosingParty as string ?? ''} onChange={set} options={['You (the user — Party 1)', 'The other party (Party 2)']} />
      </Field>
      <Field label="What is the receiving party permitted to do with the information?">
        <Select name="permittedUse" value={data.permittedUse as string ?? ''} onChange={set} options={['Evaluate only — no further use', 'Use in delivery of a specific project', 'Internal business purposes only', 'Cannot share with any third parties']} />
      </Field>

      <SectionHeading title="Purpose & Information" />
      <Field label="Purpose of this NDA">
        <Select name="ndaPurpose" value={data.ndaPurpose as string ?? ''} onChange={set} options={['Exploring a business partnership', 'Discussing a potential project', 'Due diligence / acquisition', 'Pre-employment discussions', 'Licensing negotiations', 'Other']} />
      </Field>
      <Field label="Describe the confidential information being protected">
        <Textarea name="confidentialInfo" value={data.confidentialInfo as string ?? ''} onChange={set} placeholder="e.g. Proprietary software code, client database, business methodology" rows={3} />
      </Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="How long should this NDA last?">
          <Select name="ndaDuration" value={data.ndaDuration as string ?? ''} onChange={set} options={['1 year', '2 years', '3 years', '5 years', 'Indefinite']} />
        </Field>
        <Field label="Geographic scope">
          <Select name="ndaScope" value={data.ndaScope as string ?? ''} onChange={set} options={['United Kingdom', 'United Kingdom & EU', 'Worldwide']} />
        </Field>
      </div>
    </div>
  )
}

function RetainerQuestions({ data, set }: { data: IntakeData; set: (k: string, v: string) => void }) {
  return (
    <div className="space-y-5">
      <SectionHeading title="Services" />
      <Field label="Describe the ongoing services" hint="What will you be doing each month?">
        <Textarea name="retainerServices" value={data.retainerServices as string ?? ''} onChange={set} placeholder="e.g. Social media management — 20 posts/month across Instagram, LinkedIn and Twitter. Monthly analytics report." rows={3} />
      </Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Hours included per month">
          <Input name="retainerHours" value={data.retainerHours as string ?? ''} onChange={set} placeholder="e.g. 20" />
        </Field>
        <Field label="What happens to unused hours?">
          <Select name="unusedHours" value={data.unusedHours as string ?? ''} onChange={set} options={['Lost — does not roll over', 'Roll over to next month (max 1 month)', 'Credited as discount']} />
        </Field>
      </div>
      <Field label="Overflow hours rate (if hours exceeded)" optional>
        <Input name="overflowRate" value={data.overflowRate as string ?? ''} onChange={set} placeholder="e.g. £150/hr" />
      </Field>

      <SectionHeading title="Payment" />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Monthly retainer fee (£)">
          <Input name="retainerFee" value={data.retainerFee as string ?? ''} onChange={set} placeholder="e.g. 2000" />
        </Field>
        <Field label="Payment due date each month">
          <Select name="retainerPaymentDate" value={data.retainerPaymentDate as string ?? ''} onChange={set} options={['1st of the month', 'Last working day of month', 'On invoice']} />
        </Field>
      </div>
      <Field label="Invoice payment terms">
        <Select name="paymentTerms" value={data.paymentTerms as string ?? ''} onChange={set} options={['7 days', '14 days', '30 days']} />
      </Field>

      <SectionHeading title="Term & Termination" />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Minimum commitment period">
          <Select name="minimumTerm" value={data.minimumTerm as string ?? ''} onChange={set} options={['No minimum', '1 month', '3 months', '6 months', '12 months']} />
        </Field>
        <Field label="Notice period after minimum term">
          <Select name="retainerNotice" value={data.retainerNotice as string ?? ''} onChange={set} options={['1 month', '2 months', '3 months']} />
        </Field>
      </div>
      <Toggle name="retainerAutoRenew" value={data.retainerAutoRenew as string ?? 'yes'} onChange={set} label="Auto-renew monthly after minimum term?" />
    </div>
  )
}

function SubcontractorQuestions({ data, set }: { data: IntakeData; set: (k: string, v: string) => void }) {
  return (
    <div className="space-y-5">
      <SectionHeading title="Work Description" />
      <Field label="Describe the subcontracted work" hint="What specific part of your project is the subcontractor handling?">
        <Textarea name="subcontractWork" value={data.subcontractWork as string ?? ''} onChange={set} placeholder="e.g. Backend API development for the e-commerce platform. Subcontractor will build the payment integration and order management system." rows={3} />
      </Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Deadline for subcontracted work">
          <Input name="subcontractDeadline" value={data.subcontractDeadline as string ?? ''} onChange={set} type="date" />
        </Field>
        <Field label="Fee structure">
          <Select name="feeStructure" value={data.feeStructure as string ?? ''} onChange={set} options={['Fixed fee', 'Day rate', 'Milestone-based']} />
        </Field>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Total fee or rate (£)">
          <Input name="feeAmount" value={data.feeAmount as string ?? ''} onChange={set} placeholder="e.g. 3000" />
        </Field>
        <Field label="Payment terms after delivery">
          <Select name="paymentTerms" value={data.paymentTerms as string ?? ''} onChange={set} options={['7 days after client accepts work', '14 days after delivery', '30 days after delivery']} />
        </Field>
      </div>

      <SectionHeading title="Quality & Liability" />
      <Toggle name="qualityWarranty" value={data.qualityWarranty as string ?? 'yes'} onChange={set} label="Subcontractor warrants work meets professional standard?" />
      <Field label="If work is defective, subcontractor must:">
        <Select name="defectRemedy" value={data.defectRemedy as string ?? ''} onChange={set} options={['Fix at their own cost within 14 days', 'Provide a fee reduction', 'Be liable for losses caused']} />
      </Field>
      <Toggle name="piInsurance" value={data.piInsurance as string ?? 'no'} onChange={set} label="Subcontractor holds professional indemnity insurance?" />

      <SectionHeading title="Confidentiality & IP" />
      <Toggle name="subcontractNDA" value={data.subcontractNDA as string ?? 'yes'} onChange={set} label="Include confidentiality clause in this agreement?" />
      <Toggle name="subcontractPortfolio" value={data.subcontractPortfolio as string ?? 'no'} onChange={set} label="Subcontractor may show work in portfolio?" />
    </div>
  )
}

function ClientServiceQuestions({ data, set }: { data: IntakeData; set: (k: string, v: string) => void }) {
  return (
    <div className="space-y-5">
      <SectionHeading title="Services" />
      <Field label="Type of service">
        <Select name="serviceType" value={data.serviceType as string ?? ''} onChange={set} options={['Consulting / Advisory', 'Agency services', 'Coaching / Mentoring', 'Training / Workshops', 'IT services', 'Marketing services', 'Financial services', 'Design services', 'Trades / Construction', 'Professional services', 'Other']} />
      </Field>
      <Field label="Describe the services" hint="What are you providing and what does the client get?">
        <Textarea name="serviceDescription" value={data.serviceDescription as string ?? ''} onChange={set} placeholder="e.g. Monthly digital marketing strategy, including SEO audit, content calendar and 2 x strategy calls per month." rows={3} />
      </Field>
      <Field label="Project or ongoing?">
        <Select name="serviceNature" value={data.serviceNature as string ?? ''} onChange={set} options={['One-off project', 'Ongoing relationship', 'Fixed-term contract', 'Combination of project + ongoing support']} />
      </Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Fee structure">
          <Select name="feeStructure" value={data.feeStructure as string ?? ''} onChange={set} options={['Fixed fee', 'Hourly rate', 'Day rate', 'Monthly retainer', 'Milestone-based']} />
        </Field>
        <Field label="Fee amount (£)">
          <Input name="feeAmount" value={data.feeAmount as string ?? ''} onChange={set} placeholder="e.g. 5000" />
        </Field>
      </div>
      <Field label="Invoice payment terms">
        <Select name="paymentTerms" value={data.paymentTerms as string ?? ''} onChange={set} options={['7 days', '14 days', '30 days', '60 days']} />
      </Field>

      <SectionHeading title="Liability" />
      <Toggle name="liabilityCap" value={data.liabilityCap as string ?? 'yes'} onChange={set} label="Limit your liability?" />
      {data.liabilityCap === 'yes' && (
        <Field label="Liability cap amount" hint="Typical: value of contract or 2x contract value">
          <Select name="liabilityCapAmount" value={data.liabilityCapAmount as string ?? ''} onChange={set} options={['Value of the contract', '2x value of the contract', '£10,000', '£25,000', '£50,000', '£100,000']} />
        </Field>
      )}
      <Toggle name="excludeConsequential" value={data.excludeConsequential as string ?? 'yes'} onChange={set} label="Exclude liability for client's consequential losses (lost profits, etc)?" />

      <SectionHeading title="Termination" />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Notice period to terminate">
          <Select name="noticePeriod" value={data.noticePeriod as string ?? ''} onChange={set} options={['7 days', '14 days', '30 days', '60 days']} />
        </Field>
        <Field label="Work in progress on early termination">
          <Select name="terminationWIP" value={data.terminationWIP as string ?? ''} onChange={set} options={['Client pays for work done to date', 'Full fee remains due', 'Pro-rata refund of any prepayment']} />
        </Field>
      </div>
    </div>
  )
}

function WebsiteTcsQuestions({ data, set, setArr }: { data: IntakeData; set: (k: string, v: string) => void; setArr: (k: string, v: string[]) => void }) {
  return (
    <div className="space-y-5">
      <SectionHeading title="Your Website" />
      <Field label="Website URL">
        <Input name="websiteUrl" value={data.websiteUrl as string ?? ''} onChange={set} placeholder="e.g. https://www.yoursite.co.uk" />
      </Field>
      <Field label="Type of website">
        <Select name="websiteType" value={data.websiteType as string ?? ''} onChange={set} options={['Informational / brochure site', 'E-commerce / online shop', 'SaaS / web app', 'Marketplace', 'Blog / content site', 'Community / forum', 'Portfolio', 'Other']} />
      </Field>
      <div className="space-y-2">
        <Toggle name="sellsProducts" value={data.sellsProducts as string ?? 'no'} onChange={set} label="Site sells products or services to consumers?" />
        <Toggle name="userContent" value={data.userContent as string ?? 'no'} onChange={set} label="Users can post content (comments, reviews, uploads)?" />
        <Toggle name="requiresAccount" value={data.requiresAccount as string ?? 'no'} onChange={set} label="Users need to create an account?" />
        <Toggle name="providesAdvice" value={data.providesAdvice as string ?? 'no'} onChange={set} label="Site provides professional advice (legal, financial, medical)?" />
      </div>

      <SectionHeading title="Data & Cookies" />
      <Field label="Types of cookies used" hint="Select all that apply">
        <MultiSelect
          name="cookieTypes"
          value={data.cookieTypes as string[] ?? []}
          onChange={setArr}
          options={['Essential (required for site to work)', 'Analytics (e.g. Google Analytics)', 'Marketing / advertising', 'Functional / preferences', 'Third-party embeds (e.g. YouTube, maps)']}
        />
      </Field>
      <Field label="Third-party data processors" optional hint="Services that process user data on your behalf">
        <RepeatableField
          name="dataProcessors"
          values={data.dataProcessors as string[] ?? ['']}
          onChange={setArr}
          placeholder="e.g. Stripe, Google Analytics, Mailchimp"
        />
      </Field>
    </div>
  )
}

function LatePaymentQuestions({ data, set }: { data: IntakeData; set: (k: string, v: string) => void }) {
  return (
    <div className="space-y-5">
      <SectionHeading title="Invoice Details" />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Invoice number">
          <Input name="invoiceNumber" value={data.invoiceNumber as string ?? ''} onChange={set} placeholder="e.g. INV-0042" />
        </Field>
        <Field label="Invoice date">
          <Input name="invoiceDate" value={data.invoiceDate as string ?? ''} onChange={set} type="date" />
        </Field>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Invoice amount (£)" hint="Excluding VAT">
          <Input name="invoiceAmount" value={data.invoiceAmount as string ?? ''} onChange={set} placeholder="e.g. 2500" />
        </Field>
        <Field label="Original payment due date">
          <Input name="invoiceDueDate" value={data.invoiceDueDate as string ?? ''} onChange={set} type="date" />
        </Field>
      </div>
      <Field label="What goods or services were these for?">
        <Input name="invoiceDescription" value={data.invoiceDescription as string ?? ''} onChange={set} placeholder="e.g. Website design and development — completed June 2026" />
      </Field>

      <SectionHeading title="Chasing History" />
      <Toggle name="previouslyChased" value={data.previouslyChased as string ?? 'no'} onChange={set} label="Have you previously chased this invoice?" />
      {data.previouslyChased === 'yes' && (
        <Field label="Date of last chase" optional>
          <Input name="lastChaseDate" value={data.lastChaseDate as string ?? ''} onChange={set} type="date" />
        </Field>
      )}
      <Toggle name="invoiceAcknowledged" value={data.invoiceAcknowledged as string ?? 'no'} onChange={set} label="Has the debtor acknowledged the invoice?" />

      <SectionHeading title="Demands" />
      <Field label="Final payment deadline" hint="Recommended: 7–14 days from today">
        <Input name="finalDeadline" value={data.finalDeadline as string ?? ''} onChange={set} type="date" />
      </Field>
      <Field label="Intended next step if unpaid">
        <Select name="legalThreat" value={data.legalThreat as string ?? ''} onChange={set} options={['Small claims court (up to £10,000)', 'County Court judgment (CCJ)', 'Pass to debt collection agency', 'Instruct solicitors', 'Not specified']} />
      </Field>

      <div className="p-4 border text-sm" style={{ borderColor: '#D8F3DC', backgroundColor: '#EDFAF2', color: '#1B4332' }}>
        <strong>Auto-applied:</strong> Statutory interest at 8% above Bank of England base rate will be calculated from the due date, plus fixed compensation of £40–£100 under the Late Payment of Commercial Debts (Interest) Act 1998.
      </div>
    </div>
  )
}

function EmploymentOfferQuestions({ data, set, setArr }: { data: IntakeData; set: (k: string, v: string) => void; setArr: (k: string, v: string[]) => void }) {
  return (
    <div className="space-y-5">
      <SectionHeading title="Role" />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Job title">
          <Input name="jobTitle" value={data.jobTitle as string ?? ''} onChange={set} placeholder="e.g. Senior Software Engineer" />
        </Field>
        <Field label="Department / team" optional>
          <Input name="department" value={data.department as string ?? ''} onChange={set} placeholder="e.g. Engineering" />
        </Field>
      </div>
      <Field label="Reporting to (job title)" optional>
        <Input name="reportingTo" value={data.reportingTo as string ?? ''} onChange={set} placeholder="e.g. Head of Engineering" />
      </Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Place of work">
          <Input name="placeOfWork" value={data.placeOfWork as string ?? ''} onChange={set} placeholder="e.g. 123 High Street, London EC1A 1BB" />
        </Field>
        <Field label="Working arrangement">
          <Select name="workingArrangement" value={data.workingArrangement as string ?? ''} onChange={set} options={['Office-based (5 days)', 'Hybrid (specify days in description)', 'Fully remote', 'Field-based / travelling role']} />
        </Field>
      </div>
      <Field label="Employment type">
        <Select name="employmentType" value={data.employmentType as string ?? ''} onChange={set} options={['Full-time permanent', 'Part-time permanent', 'Fixed-term contract', 'Zero-hours contract']} />
      </Field>
      <Field label="Start date">
        <Input name="startDate" value={data.startDate as string ?? ''} onChange={set} type="date" />
      </Field>

      <SectionHeading title="Pay & Hours" />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Annual salary (£)" hint="Minimum £11.44/hr from Apr 2024">
          <Input name="annualSalary" value={data.annualSalary as string ?? ''} onChange={set} placeholder="e.g. 45000" />
        </Field>
        <Field label="Pay frequency">
          <Select name="payFrequency" value={data.payFrequency as string ?? ''} onChange={set} options={['Monthly', 'Fortnightly', 'Weekly']} />
        </Field>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Hours per week">
          <Input name="hoursPerWeek" value={data.hoursPerWeek as string ?? ''} onChange={set} placeholder="e.g. 37.5" />
        </Field>
        <Field label="Core hours" optional>
          <Input name="coreHours" value={data.coreHours as string ?? ''} onChange={set} placeholder="e.g. 9am–5pm Mon–Fri" />
        </Field>
      </div>

      <SectionHeading title="Holiday" />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Holiday entitlement (days per year)" hint="Statutory minimum 28 days inc bank holidays">
          <Input name="holidayDays" value={data.holidayDays as string ?? ''} onChange={set} placeholder="e.g. 28" />
        </Field>
        <Field label="Holiday year runs">
          <Select name="holidayYear" value={data.holidayYear as string ?? ''} onChange={set} options={['1 January – 31 December', '1 April – 31 March', 'Rolling anniversary of start date']} />
        </Field>
      </div>

      <SectionHeading title="Probation & Notice" />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Probation period">
          <Select name="probationPeriod" value={data.probationPeriod as string ?? ''} onChange={set} options={['No probation', '1 month', '3 months', '6 months']} />
        </Field>
        <Field label="Notice period after probation">
          <Select name="noticePeriod" value={data.noticePeriod as string ?? ''} onChange={set} options={['1 month', '2 months', '3 months', '6 months', '1 week per year of service (statutory)']} />
        </Field>
      </div>

      <SectionHeading title="Benefits" />
      <Field label="Benefits included" optional>
        <MultiSelect
          name="benefits"
          value={data.benefits as string[] ?? []}
          onChange={setArr}
          options={['Company pension (employer contribution)', 'Private healthcare', 'Life assurance', 'Car allowance', 'Season ticket loan', 'Gym membership', 'Flexible working', 'None']}
        />
      </Field>
      <Toggle name="bonusScheme" value={data.bonusScheme as string ?? 'no'} onChange={set} label="Bonus or commission scheme?" />
      {data.bonusScheme === 'yes' && (
        <Field label="Describe the bonus/commission" optional>
          <Textarea name="bonusDescription" value={data.bonusDescription as string ?? ''} onChange={set} placeholder="e.g. Discretionary annual bonus up to 10% of salary based on company and individual performance." rows={2} />
        </Field>
      )}

      <SectionHeading title="Restrictions" />
      <Toggle name="nonCompete" value={data.nonCompete as string ?? 'no'} onChange={set} label="Include non-compete restriction after leaving?" />
      {data.nonCompete === 'yes' && (
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Non-compete duration">
            <Select name="nonCompeteDuration" value={data.nonCompeteDuration as string ?? ''} onChange={set} options={['3 months', '6 months', '12 months']} />
          </Field>
          <Field label="Geographic scope of restriction" optional>
            <Input name="nonCompeteScope" value={data.nonCompeteScope as string ?? ''} onChange={set} placeholder="e.g. 10 miles radius / UK / Worldwide" />
          </Field>
        </div>
      )}
      <Toggle name="nonSolicitation" value={data.nonSolicitation as string ?? 'no'} onChange={set} label="Include non-solicitation of clients clause?" />
    </div>
  )
}

// ── Section heading helper ─────────────────────────────────────────────────────

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="border-b pb-2 mt-2" style={{ borderColor: '#E5E5E2' }}>
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#2D6A4F' }}>{title}</p>
    </div>
  )
}

// ── Step labels ────────────────────────────────────────────────────────────────

const STEPS = ['Your details', 'Their details', 'Contract details', 'Review']

// ── Main wizard ────────────────────────────────────────────────────────────────

export default function IntakeWizard({ contractTypeId, contractTypeTitle, onComplete, onBack }: WizardProps) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<IntakeData>({
    yourName: '', yourEmail: '', yourAddress: '', yourCompanyNumber: '', yourVatNumber: '',
    theirName: '', theirEmail: '', theirAddress: '', theirContactName: '',
    contractStartDate: '', governingLaw: 'England & Wales',
  })

  const set = (k: string, v: string) => setData((d) => ({ ...d, [k]: v }))
  const setArr = (k: string, v: string[]) => setData((d) => ({ ...d, [k]: v }))

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const prev = () => { if (step === 0) onBack(); else setStep((s) => s - 1) }

  // ── Step validation (basic required fields) ──
  const canProceed = () => {
    if (step === 0) return !!data.yourName && !!data.yourEmail
    if (step === 1) return !!data.theirName && !!data.theirEmail
    return true
  }

  const contractQuestions = () => {
    switch (contractTypeId) {
      case 'freelance': return <FreelanceQuestions data={data} set={set} setArr={setArr} />
      case 'nda-mutual': return <NdaMutualQuestions data={data} set={set} />
      case 'nda-one-way': return <NdaOneWayQuestions data={data} set={set} />
      case 'retainer': return <RetainerQuestions data={data} set={set} />
      case 'subcontractor': return <SubcontractorQuestions data={data} set={set} />
      case 'client-service': return <ClientServiceQuestions data={data} set={set} />
      case 'website-tcs': return <WebsiteTcsQuestions data={data} set={set} setArr={setArr} />
      case 'late-payment': return <LatePaymentQuestions data={data} set={set} />
      case 'employment-offer': return <EmploymentOfferQuestions data={data} set={set} setArr={setArr} />
      default: return null
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Back + badge */}
      <button onClick={prev} className="flex items-center gap-1.5 text-sm mb-5 hover:opacity-70 transition-opacity" style={{ color: '#6B7280' }}>
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold mb-4" style={{ backgroundColor: '#D8F3DC', color: '#1B4332' }}>
        {contractTypeTitle}
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2 mb-7">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className="w-5 h-5 flex items-center justify-center text-xs font-bold"
                style={i <= step
                  ? { backgroundColor: '#2D6A4F', color: '#FFFFFF' }
                  : { backgroundColor: '#F3F4F6', color: '#9CA3AF' }
                }
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block" style={{ color: i <= step ? '#1B4332' : '#9CA3AF' }}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className="flex-1 h-px w-4" style={{ backgroundColor: i < step ? '#2D6A4F' : '#E5E5E2' }} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
        >
          {/* ── Step 0: Your Details ── */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="mb-5">
                <h2 className="font-display text-xl font-bold mb-1" style={{ color: '#1B4332' }}>Your details</h2>
                <p className="text-sm" style={{ color: '#6B7280' }}>These will appear as Party 1 in the contract.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full name or company name">
                  <Input name="yourName" value={data.yourName} onChange={set} placeholder="e.g. Jane Smith / Acme Ltd" />
                </Field>
                <Field label="Email address">
                  <Input name="yourEmail" value={data.yourEmail} onChange={set} placeholder="jane@acme.co.uk" type="email" />
                </Field>
              </div>
              <Field label="Business address">
                <Textarea name="yourAddress" value={data.yourAddress} onChange={set} placeholder="123 High Street&#10;London&#10;EC1A 1BB" rows={3} />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Company number" optional hint="If Ltd company">
                  <Input name="yourCompanyNumber" value={data.yourCompanyNumber} onChange={set} placeholder="e.g. 12345678" />
                </Field>
                <Field label="VAT number" optional>
                  <Input name="yourVatNumber" value={data.yourVatNumber} onChange={set} placeholder="e.g. GB123456789" />
                </Field>
              </div>
            </div>
          )}

          {/* ── Step 1: Their Details ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="mb-5">
                <h2 className="font-display text-xl font-bold mb-1" style={{ color: '#1B4332' }}>Their details</h2>
                <p className="text-sm" style={{ color: '#6B7280' }}>The client or other party — Party 2 in the contract.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full name or company name">
                  <Input name="theirName" value={data.theirName} onChange={set} placeholder="e.g. Restaurant Group Ltd" />
                </Field>
                <Field label="Contact name" optional hint="If company — who is signing?">
                  <Input name="theirContactName" value={data.theirContactName} onChange={set} placeholder="e.g. Tom Jones" />
                </Field>
              </div>
              <Field label="Email address" hint="Used to send them the contract">
                <Input name="theirEmail" value={data.theirEmail} onChange={set} placeholder="tom@restaurantgroup.co.uk" type="email" />
              </Field>
              <Field label="Business address">
                <Textarea name="theirAddress" value={data.theirAddress} onChange={set} placeholder="456 Business Park&#10;Manchester&#10;M1 1AA" rows={3} />
              </Field>
            </div>
          )}

          {/* ── Step 2: Contract Questions ── */}
          {step === 2 && (
            <div>
              <div className="mb-5">
                <h2 className="font-display text-xl font-bold mb-1" style={{ color: '#1B4332' }}>Contract details</h2>
                <p className="text-sm" style={{ color: '#6B7280' }}>These details will be used to draft your bespoke contract.</p>
              </div>
              <div className="space-y-4 mb-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Contract start date">
                    <Input name="contractStartDate" value={data.contractStartDate} onChange={set} type="date" />
                  </Field>
                  <Field label="Governing law">
                    <Select name="governingLaw" value={data.governingLaw} onChange={set} options={['England & Wales', 'Scotland', 'Northern Ireland']} />
                  </Field>
                </div>
              </div>
              {contractQuestions()}
            </div>
          )}

          {/* ── Step 3: Review ── */}
          {step === 3 && (
            <div>
              <div className="mb-5">
                <h2 className="font-display text-xl font-bold mb-1" style={{ color: '#1B4332' }}>Review &amp; generate</h2>
                <p className="text-sm" style={{ color: '#6B7280' }}>Check your details below, then generate your contract.</p>
              </div>

              <div className="space-y-3 mb-6">
                {/* Summary cards */}
                {[
                  {
                    title: 'Your details',
                    items: [
                      data.yourName,
                      data.yourEmail,
                      data.yourAddress,
                      data.yourCompanyNumber ? `Co. No: ${data.yourCompanyNumber}` : null,
                    ].filter(Boolean) as string[],
                  },
                  {
                    title: 'Their details',
                    items: [
                      data.theirName,
                      data.theirContactName ? `Contact: ${data.theirContactName}` : null,
                      data.theirEmail,
                      data.theirAddress,
                    ].filter(Boolean) as string[],
                  },
                  {
                    title: 'Contract',
                    items: [
                      `Type: ${contractTypeTitle}`,
                      data.contractStartDate ? `Start: ${new Date(data.contractStartDate).toLocaleDateString('en-GB')}` : null,
                      `Governing law: ${data.governingLaw}`,
                    ].filter(Boolean) as string[],
                  },
                ].map((section) => (
                  <div key={section.title} className="border p-4" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#9CA3AF' }}>{section.title}</p>
                    {section.items.map((item, i) => (
                      <p key={i} className="text-sm" style={{ color: '#374151' }}>{item}</p>
                    ))}
                  </div>
                ))}
              </div>

              <div className="p-4 border mb-5 text-xs" style={{ borderColor: '#D8F3DC', backgroundColor: '#EDFAF2', color: '#1B4332' }}>
                <strong>Free to generate.</strong> You&rsquo;ll see a preview of your contract immediately. Pay &pound;7 to unlock the full PDF &amp; Word download.
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-5 border-t" style={{ borderColor: '#E5E5E2' }}>
        <button onClick={prev} className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border hover:bg-[#FAFAF8] transition-colors" style={{ borderColor: '#E5E5E2', color: '#6B7280' }}>
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={next}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#2D6A4F' }}
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => onComplete(data)}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#2D6A4F' }}
          >
            Generate Contract <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}



