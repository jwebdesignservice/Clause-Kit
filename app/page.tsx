'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import {
  Check,
  X,
  ArrowRight,
  Briefcase,
  Users,
  Lock,
  RotateCcw,
  Wrench,
  ClipboardList,
  Globe,
  FileText,
  Leaf,
  Menu,
  ChevronRight,
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const CONTRACT_TYPES = [
  { id: 'freelance', title: 'Freelance / Project Agreement', description: 'Scope, deliverables, payment terms and IP ownership for project-based work.', Icon: Briefcase },
  { id: 'nda-mutual', title: 'NDA (Mutual)', description: 'Both parties agree to keep each other\'s confidential information private.', Icon: Users },
  { id: 'nda-one-way', title: 'NDA (One-Way)', description: 'One party discloses confidential information that the other agrees to protect.', Icon: Lock },
  { id: 'retainer', title: 'Retainer Agreement', description: 'Ongoing services with a fixed monthly fee and defined availability.', Icon: RotateCcw },
  { id: 'subcontractor', title: 'Subcontractor Agreement', description: 'Terms for bringing in a third-party contractor to deliver client work.', Icon: Wrench },
  { id: 'client-service', title: 'Client Service Agreement', description: 'General terms and conditions for providing services to a client.', Icon: ClipboardList },
  { id: 'website-tcs', title: 'Website T&Cs', description: 'Terms, privacy policy and acceptable use for your website.', Icon: Globe },
  { id: 'employment-offer', title: 'Employment Offer Letter', description: 'Offer of employment with role, salary, start date and key conditions.', Icon: FileText },
]

const COMPARISON_ROWS: { feature: string; clausekit: boolean | string; solicitor: boolean | string; template: boolean | string | null }[] = [
  { feature: 'Cost', clausekit: 'Â£7 per doc', solicitor: 'Â£150â€“Â£500', template: 'Freeâ€“Â£30' },
  { feature: 'Time to get contract', clausekit: '< 2 minutes', solicitor: 'Daysâ€“weeks', template: 'Minutes' },
  { feature: 'Bespoke to your situation', clausekit: true, solicitor: true, template: false },
  { feature: 'UK law', clausekit: true, solicitor: true, template: null },
  { feature: 'IP protection clause', clausekit: true, solicitor: true, template: false },
  { feature: 'IR35 aware', clausekit: true, solicitor: true, template: false },
  { feature: 'GDPR compliant', clausekit: true, solicitor: true, template: false },
  { feature: 'Download instantly', clausekit: true, solicitor: false, template: true },
]

function CellValue({ value, primary }: { value: boolean | string | null; primary?: boolean }) {
  if (value === null) {
    return (
      <span
        className="inline-block text-xs px-2 py-0.5 rounded-full font-medium"
        style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
      >
        Sometimes
      </span>
    )
  }
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="w-5 h-5 mx-auto" style={{ color: primary ? '#2D6A4F' : '#52B788' }} />
    ) : (
      <X className="w-5 h-5 mx-auto" style={{ color: '#EF4444' }} />
    )
  }
  return <span className="text-sm font-medium">{value}</span>
}

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF8', color: '#1A1A1A' }}>

      {/* â”€â”€ NAV â”€â”€ */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#2D6A4F' }}
            >
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg" style={{ color: '#1B4332' }}>ClauseKit</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'How it works', href: '#how-it-works' },
              { label: 'Contract types', href: '#contract-types' },
              { label: 'Pricing', href: '#pricing' },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: '#6B7280' }}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#2D6A4F' }}
            >
              Launch App
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              className="md:hidden p-2 rounded-lg"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" style={{ color: '#1B4332' }} />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            className="md:hidden border-t px-4 py-4 space-y-3"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
          >
            <a href="#how-it-works" className="block text-sm font-medium py-2" style={{ color: '#6B7280' }}>How it works</a>
            <a href="#contract-types" className="block text-sm font-medium py-2" style={{ color: '#6B7280' }}>Contract types</a>
            <a href="#pricing" className="block text-sm font-medium py-2" style={{ color: '#6B7280' }}>Pricing</a>
            <Link
              href="/app"
              className="block w-full text-center px-4 py-3 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: '#2D6A4F' }}
            >
              Launch App
            </Link>
          </div>
        )}
      </nav>

      {/* â”€â”€ HERO â”€â”€ */}
      <section className="pt-20 pb-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp}>
              <span
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-8"
                style={{ backgroundColor: '#D8F3DC', color: '#1B4332' }}
              >
                <Leaf className="w-3.5 h-3.5" />
                UK-law contracts, AI-generated in seconds
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl md:text-[3.25rem] font-bold leading-[1.1] mb-6"
              style={{ color: '#1B4332' }}
            >
              Stop paying Â£300/hr for contracts<br className="hidden sm:block" /> that take 5 minutes to generate
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
              style={{ color: '#6B7280' }}
            >
              ClauseKit uses GPT-4o to draft bespoke, UK-law contracts tailored to your exact situation.
              No templates. No legal jargon. Just the right contract, ready in under 2 minutes.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/app"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-base font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#2D6A4F' }}
              >
                Launch App â€” it&apos;s free to generate
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-base font-semibold border transition-colors hover:bg-white"
                style={{ borderColor: '#E5E7EB', color: '#1B4332' }}
              >
                See how it works
              </a>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm"
              style={{ color: '#6B7280' }}
            >
              {[
                '2,000+ contracts generated',
                'Reviewed by UK solicitors',
                'Trusted by UK freelancers',
              ].map((item, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#52B788' }} />
                  {item}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* â”€â”€ PROBLEM â”€â”€ */}
      <section className="py-20 px-4 sm:px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1B4332' }}>
                The problem with getting contracts today
              </h2>
              <p className="text-lg max-w-xl mx-auto" style={{ color: '#6B7280' }}>
                Most freelancers and small businesses end up stuck with one of these three problems.
              </p>
            </motion.div>

            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  badge: 'Â£',
                  badgeBg: '#FEF3C7',
                  badgeColor: '#92400E',
                  title: 'Solicitors charge Â£300/hr',
                  body: 'You need a contract, not a retainer. Hiring a solicitor for a simple freelance agreement is expensive, slow, and overkill for most situations.',
                },
                {
                  badge: 'âŠ˜',
                  badgeBg: '#FEE2E2',
                  badgeColor: '#991B1B',
                  title: "Templates don't fit your situation",
                  body: "Generic contracts miss the details that actually protect you. They're written for everyone, which means they're written for no one.",
                },
                {
                  badge: '!',
                  badgeBg: '#FFF7ED',
                  badgeColor: '#C2410C',
                  title: "You're winging it without one",
                  body: 'One bad client can cost you thousands. A proper contract takes that risk off the table â€” and sends the right signal from day one.',
                },
              ].map((card, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <div
                    className="rounded-2xl p-6 border h-full"
                    style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAF8' }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold mb-4"
                      style={{ backgroundColor: card.badgeBg, color: card.badgeColor }}
                    >
                      {card.badge}
                    </div>
                    <h3 className="text-base font-bold mb-2" style={{ color: '#1B4332' }}>{card.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{card.body}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* â”€â”€ HOW IT WORKS â”€â”€ */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6" style={{ backgroundColor: '#FAFAF8' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1B4332' }}>
                How it works
              </h2>
              <p className="text-lg" style={{ color: '#6B7280' }}>
                Three steps. Under two minutes. A contract that actually holds up.
              </p>
            </motion.div>

            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
              {[
                {
                  step: '1',
                  title: 'Describe your situation',
                  body: "Tell ClauseKit what you need in plain English. No legal knowledge required â€” just describe your situation like you'd explain it to a friend.",
                },
                {
                  step: '2',
                  title: 'AI drafts your contract',
                  body: 'GPT-4o generates a bespoke, UK-law document tailored to your situation in seconds, with the clauses that actually matter.',
                },
                {
                  step: '3',
                  title: 'Download and use',
                  body: 'PDF or Word, ready to send straight away. Generate for free â€” pay only when you download.',
                },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp} className="relative flex gap-5 md:block">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base md:mb-4"
                    style={{ backgroundColor: '#2D6A4F' }}
                  >
                    {item.step}
                  </div>
                  {i < 2 && (
                    <div className="hidden md:flex absolute top-4 left-full items-center justify-center w-10 -translate-x-5 z-10">
                      <ChevronRight className="w-5 h-5" style={{ color: '#52B788' }} />
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-bold mb-2" style={{ color: '#1B4332' }}>{item.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{item.body}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* â”€â”€ COMPARISON TABLE â”€â”€ */}
      <section className="py-20 px-4 sm:px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1B4332' }}>
                What makes ClauseKit different
              </h2>
              <p className="text-lg" style={{ color: '#6B7280' }}>
                See how we compare to the alternatives.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="overflow-x-auto rounded-2xl border" style={{ borderColor: '#E5E7EB' }}>
              <table className="w-full min-w-[540px]">
                <thead>
                  <tr>
                    <th
                      className="text-left px-6 py-4 text-sm font-semibold"
                      style={{ color: '#6B7280', backgroundColor: '#F9FAFB' }}
                    >
                      Feature
                    </th>
                    <th className="px-6 py-4 text-center" style={{ backgroundColor: '#D8F3DC' }}>
                      <div className="flex items-center justify-center gap-1.5">
                        <Leaf className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                        <span className="text-sm font-bold" style={{ color: '#1B4332' }}>ClauseKit</span>
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-center text-sm font-semibold"
                      style={{ color: '#6B7280', backgroundColor: '#F9FAFB' }}
                    >
                      Solicitor
                    </th>
                    <th
                      className="px-6 py-4 text-center text-sm font-semibold"
                      style={{ color: '#6B7280', backgroundColor: '#F9FAFB' }}
                    >
                      Template sites
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr key={i} style={{ borderTop: '1px solid #E5E7EB' }}>
                      <td className="px-6 py-3.5 text-sm font-medium" style={{ color: '#1A1A1A' }}>
                        {row.feature}
                      </td>
                      <td className="px-6 py-3.5 text-center" style={{ backgroundColor: '#F0FDF4', color: '#2D6A4F' }}>
                        <CellValue value={row.clausekit} primary />
                      </td>
                      <td className="px-6 py-3.5 text-center" style={{ color: '#6B7280' }}>
                        <CellValue value={row.solicitor} />
                      </td>
                      <td className="px-6 py-3.5 text-center" style={{ color: '#6B7280' }}>
                        <CellValue value={row.template} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* â”€â”€ CONTRACT TYPES â”€â”€ */}
      <section id="contract-types" className="py-20 px-4 sm:px-6" style={{ backgroundColor: '#FAFAF8' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1B4332' }}>
                Contract types
              </h2>
              <p className="text-lg" style={{ color: '#6B7280' }}>
                Eight contract types, all bespoke to your situation, all UK law.
              </p>
            </motion.div>

            <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {CONTRACT_TYPES.map((type) => {
                const Icon = type.Icon
                return (
                  <motion.div key={type.id} variants={fadeUp}>
                    <Link
                      href="/app"
                      className="group flex flex-col rounded-2xl border p-5 transition-all hover:shadow-md hover:border-[#52B788] h-full"
                      style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 flex-shrink-0"
                        style={{ backgroundColor: '#D8F3DC' }}
                      >
                        <Icon className="w-5 h-5" style={{ color: '#2D6A4F' }} />
                      </div>
                      <h3 className="text-sm font-bold mb-1.5 leading-snug" style={{ color: '#1B4332' }}>
                        {type.title}
                      </h3>
                      <p className="text-xs leading-relaxed flex-1 mb-3" style={{ color: '#6B7280' }}>
                        {type.description}
                      </p>
                      <span
                        className="text-xs font-semibold flex items-center gap-1 mt-auto"
                        style={{ color: '#2D6A4F' }}
                      >
                        Generate <ArrowRight className="w-3 h-3" />
                      </span>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* â”€â”€ PRICING â”€â”€ */}
      <section id="pricing" className="py-20 px-4 sm:px-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1B4332' }}>
                Simple, transparent pricing
              </h2>
              <p className="text-lg" style={{ color: '#6B7280' }}>
                Generate for free. Pay only when you download.
              </p>
            </motion.div>

            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pay per doc */}
              <motion.div
                variants={fadeUp}
                className="rounded-2xl border p-8 flex flex-col"
                style={{ backgroundColor: '#FAFAF8', borderColor: '#E5E7EB' }}
              >
                <div className="text-sm font-semibold mb-2" style={{ color: '#6B7280' }}>Pay per document</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold" style={{ color: '#1B4332' }}>Â£7</span>
                  <span className="text-sm" style={{ color: '#6B7280' }}>per contract</span>
                </div>
                <p className="text-sm mb-6" style={{ color: '#6B7280' }}>Generate free, pay to download</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {[
                    'Generate any contract type',
                    'PDF + Word download',
                    'UK-law compliant',
                    'Ready in under 2 minutes',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#52B788' }} />
                      <span style={{ color: '#1A1A1A' }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/app"
                  className="block w-full text-center py-3 rounded-full text-sm font-semibold border transition-opacity hover:opacity-80"
                  style={{ borderColor: '#2D6A4F', color: '#2D6A4F' }}
                >
                  Start generating
                </Link>
              </motion.div>

              {/* Unlimited */}
              <motion.div
                variants={fadeUp}
                className="rounded-2xl p-8 flex flex-col relative border-2"
                style={{ backgroundColor: '#FFFFFF', borderColor: '#2D6A4F' }}
              >
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white whitespace-nowrap"
                  style={{ backgroundColor: '#2D6A4F' }}
                >
                  Best value
                </div>
                <div className="text-sm font-semibold mb-2" style={{ color: '#6B7280' }}>Unlimited</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold" style={{ color: '#1B4332' }}>Â£19</span>
                  <span className="text-sm" style={{ color: '#6B7280' }}>/month</span>
                </div>
                <p className="text-sm mb-6" style={{ color: '#6B7280' }}>All contract types, unlimited downloads</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {[
                    'All 8 contract types',
                    'Unlimited PDF + Word downloads',
                    'UK-law compliant',
                    'Cancel anytime',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#52B788' }} />
                      <span style={{ color: '#1A1A1A' }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/app"
                  className="block w-full text-center py-3 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#2D6A4F' }}
                >
                  Get unlimited access
                </Link>
              </motion.div>
            </motion.div>

            <motion.p variants={fadeUp} className="text-center text-sm mt-6" style={{ color: '#6B7280' }}>
              Compare: a solicitor charges Â£150â€“Â£500 for the same document.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* â”€â”€ FINAL CTA â”€â”€ */}
      <section className="py-24 px-4 sm:px-6" style={{ backgroundColor: '#2D6A4F' }}>
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2
              variants={fadeUp}
              className="text-3xl sm:text-4xl font-bold text-white mb-4"
            >
              Your next contract is 2 minutes away
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg mb-8" style={{ color: '#D8F3DC' }}>
              No account needed to generate. Pay only when you download.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                href="/app"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#FFFFFF', color: '#2D6A4F' }}
              >
                Launch App
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* â”€â”€ FOOTER â”€â”€ */}
      <footer className="py-12 px-4 sm:px-6 border-t" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#2D6A4F' }}
                >
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold" style={{ color: '#1B4332' }}>ClauseKit</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>
                AI-generated UK contracts for freelancers and small businesses. Ready in under 2 minutes.
              </p>
            </div>

            <div className="flex gap-12">
              <div>
                <h4
                  className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: '#9CA3AF' }}
                >
                  Product
                </h4>
                <ul className="space-y-2">
                  {[
                    { label: 'How it works', href: '#how-it-works' },
                    { label: 'Contract types', href: '#contract-types' },
                    { label: 'Pricing', href: '#pricing' },
                    { label: 'Launch App', href: '/app' },
                  ].map((l) => (
                    <li key={l.href}>
                      <a
                        href={l.href}
                        className="text-sm transition-opacity hover:opacity-70"
                        style={{ color: '#6B7280' }}
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t pt-6" style={{ borderColor: '#E5E7EB' }}>
            <p className="text-xs leading-relaxed" style={{ color: '#9CA3AF' }}>
              ClauseKit is an AI-powered contract drafting tool. Contracts generated by ClauseKit are not legal advice
              and do not constitute a solicitor&ndash;client relationship. ClauseKit&apos;s output is intended as a
              starting point and should be reviewed by a qualified solicitor before use in any significant commercial
              matter. ClauseKit Ltd is not a law firm and is not regulated by the Solicitors Regulation Authority.
              &copy; {new Date().getFullYear()} ClauseKit. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

