'use client'

import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { useRef, useState } from 'react'
import {
  Check,
  X,
  ArrowRight,
  Briefcase,
  Users,
  RotateCcw,
  Wrench,
  ClipboardList,
  Globe,
  FileText,
  Menu,
  ChevronRight,
  Zap,
  Shield,
  Clock,
  Star,
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.section
      ref={ref}
      id={id}
      variants={stagger}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.section>
  )
}

const contractTypes = [
  { icon: Briefcase, title: 'Freelance Agreement', desc: 'Protect your work and get paid on time with clear terms.' },
  { icon: Users, title: 'NDA', desc: 'Mutual and one-way non-disclosure agreements in minutes.' },
  { icon: RotateCcw, title: 'Retainer Agreement', desc: 'Lock in recurring clients with clear ongoing terms.' },
  { icon: Wrench, title: 'Subcontractor Agreement', desc: 'Bring in help safely — define scope, IP, and payment.' },
  { icon: ClipboardList, title: 'Client Service Agreement', desc: 'Define deliverables, timelines, and payment cleanly.' },
  { icon: Globe, title: 'Website T&Cs', desc: 'GDPR-ready terms compliant with UK consumer law.' },
  { icon: FileText, title: 'Late Payment Letter', desc: 'Formally chase overdue invoices with legal weight.' },
  { icon: Shield, title: 'Employment Offer Letter', desc: 'Compliant UK offer letters for new hires.' },
]

const problems = [
  {
    icon: Clock,
    title: 'Solicitors charge £200–£400/hr',
    desc: 'A simple NDA can cost £300–£800 when a solicitor drafts it. That\'s money small businesses simply don\'t have.',
  },
  {
    icon: FileText,
    title: 'Free templates are risky',
    desc: 'Generic templates from the internet are often out of date, wrong for UK law, or missing critical clauses that protect you.',
  },
  {
    icon: Zap,
    title: 'You need it now, not next week',
    desc: 'Waiting days for a solicitor to respond means missed deals, delayed hires, and lost revenue. Speed matters.',
  },
]

const steps = [
  { step: '01', title: 'Choose your contract', desc: 'Pick from 8 contract types built for UK freelancers and small businesses.' },
  { step: '02', title: 'Answer plain-English questions', desc: 'No legal jargon. Our smart form asks only what it needs, in plain English.' },
  { step: '03', title: 'Download your contract', desc: 'Get a professionally drafted, UK-compliant contract in under 5 minutes.' },
]

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Freelance Designer, London',
    quote: 'Saved me £400 on my first NDA alone. Took 4 minutes. I\'ve used it every project since.',
  },
  {
    name: 'Tom K.',
    role: 'Web Agency Owner, Manchester',
    quote: 'Our standard client contract used to take a week to get from our solicitor. Now it\'s done before the sales call ends.',
  },
  {
    name: 'Priya R.',
    role: 'Consultant, Birmingham',
    quote: 'The questions are genuinely plain English. It feels like talking to a knowledgeable friend, not filling in a legal form.',
  },
]

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-gray-900">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#FAFAF8]/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#2D6A4F' }}>
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg" style={{ color: '#1B4332' }}>ClauseKit</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">How it works</Link>
            <Link href="#contracts" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Contracts</Link>
            <Link href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
            <Link
              href="/app"
              className="text-sm font-semibold text-white px-5 py-2.5 rounded-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#2D6A4F' }}
            >
              Launch App →
            </Link>
          </div>
          <button
            className="md:hidden p-2 rounded-lg text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-[#FAFAF8] px-4 pb-4 pt-2 flex flex-col gap-3">
            <Link href="#how-it-works" className="text-sm text-gray-600 py-1">How it works</Link>
            <Link href="#contracts" className="text-sm text-gray-600 py-1">Contracts</Link>
            <Link href="#pricing" className="text-sm text-gray-600 py-1">Pricing</Link>
            <Link href="/app" className="text-sm font-semibold text-white px-4 py-2 rounded-lg text-center" style={{ backgroundColor: '#2D6A4F' }}>
              Launch App →
            </Link>
          </div>
        )}
      </nav>

      {/* ── FUNNEL STEP 1: Hero — grab attention, state the value ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
        <motion.div variants={stagger} initial="hidden" animate="visible">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-6" style={{ backgroundColor: '#D8F3DC', color: '#1B4332' }}>
            <Shield className="w-3.5 h-3.5" />
            UK-compliant contracts in minutes
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 max-w-4xl mx-auto"
            style={{ color: '#1B4332' }}
          >
            Legal contracts,{' '}
            <em className="italic font-display" style={{ color: '#2D6A4F' }}>without</em>
            <br className="hidden sm:block" /> the legal bill
          </motion.h1>
          <motion.p variants={fadeUp} className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            ClauseKit generates professionally drafted, UK-compliant contracts in under 5 minutes. Built for freelancers and small businesses — not law firms.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#2D6A4F' }}
            >
              Generate your first contract
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 font-medium px-8 py-4 rounded-xl text-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              See how it works
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <motion.p variants={fadeUp} className="mt-6 text-sm text-gray-400">
            No signup required · Pay only when you download · From £7 per contract
          </motion.p>
        </motion.div>
      </section>

      {/* ── FUNNEL STEP 2: Trust strip — social proof above the fold ── */}
      <div className="border-y border-gray-100 bg-white py-5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4" style={{ color: '#2D6A4F' }} />
            Written for UK law
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4" style={{ color: '#2D6A4F' }} />
            PDF &amp; Word download
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4" style={{ color: '#2D6A4F' }} />
            No subscription needed
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4" style={{ color: '#2D6A4F' }} />
            Ready in under 5 minutes
          </span>
          <span className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-current" style={{ color: '#F59E0B' }} />
            Trusted by 500+ freelancers
          </span>
        </div>
      </div>

      {/* ── FUNNEL STEP 3: Problem — make them feel the pain ── */}
      <Section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1B4332' }}>
              Getting legal protection{' '}
              <em className="italic font-display" style={{ color: '#2D6A4F' }}>shouldn&rsquo;t</em>{' '}
              cost a fortune
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              UK freelancers and small businesses are left choosing between expensive solicitors and risky free templates.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {problems.map((p) => (
              <motion.div key={p.title} variants={fadeUp} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: '#D8F3DC' }}>
                  <p.icon className="w-6 h-6" style={{ color: '#2D6A4F' }} />
                </div>
                <h3 className="font-semibold text-lg mb-3" style={{ color: '#1B4332' }}>{p.title}</h3>
                <p className="text-gray-500 leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── FUNNEL STEP 4: Solution — how it works ── */}
      <Section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1B4332' }}>How ClauseKit works</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Three steps. Zero jargon. Signed-ready contract.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-10">
            {steps.map((s, i) => (
              <motion.div key={s.step} variants={fadeUp} className="text-center relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px" style={{ backgroundColor: '#D8F3DC' }} />
                )}
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white font-display" style={{ backgroundColor: '#2D6A4F' }}>
                  {s.step}
                </div>
                <h3 className="font-semibold text-xl mb-3" style={{ color: '#1B4332' }}>{s.title}</h3>
                <p className="text-gray-500 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
          {/* Mid-funnel CTA */}
          <motion.div variants={fadeUp} className="text-center mt-14">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#2D6A4F' }}
            >
              Try it now — from £7
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </Section>

      {/* ── FUNNEL STEP 5: Contract types — product depth ── */}
      <Section id="contracts" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1B4332' }}>
              8 contract types, <em className="italic font-display" style={{ color: '#2D6A4F' }}>all UK-ready</em>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Every contract ClauseKit generates is tailored to your answers and compliant with current UK law.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contractTypes.map((c) => (
              <motion.div
                key={c.title}
                variants={fadeUp}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#52B788] hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#D8F3DC' }}>
                  <c.icon className="w-5 h-5" style={{ color: '#2D6A4F' }} />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: '#1B4332' }}>{c.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── FUNNEL STEP 6: Comparison — remove objections ── */}
      <Section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1B4332' }}>How we compare</h2>
            <p className="text-gray-500 text-lg">ClauseKit vs the alternatives</p>
          </motion.div>
          <motion.div variants={fadeUp} className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: '#2D6A4F' }}>
                  <th className="text-left px-6 py-4 text-white font-semibold">Feature</th>
                  <th className="px-6 py-4 text-white font-semibold">ClauseKit</th>
                  <th className="px-6 py-4 text-white font-semibold">Solicitor</th>
                  <th className="px-6 py-4 text-white font-semibold">Free Templates</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['UK-compliant drafting', true, true, false],
                  ['Ready in under 5 minutes', true, false, true],
                  ['Costs under £20', true, false, true],
                  ['Plain-English questions', true, false, false],
                  ['Tailored to your situation', true, true, false],
                  ['Up-to-date with UK law', true, true, false],
                  ['Solicitor review available', false, true, false],
                ].map(([feature, ck, sol, tmpl], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-[#FAFAF8]' : 'bg-white'}>
                    <td className="px-6 py-4 font-medium text-gray-700">{feature as string}</td>
                    <td className="px-6 py-4 text-center">
                      {ck ? <Check className="w-5 h-5 inline" style={{ color: '#2D6A4F' }} /> : <X className="w-5 h-5 inline text-gray-300" />}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {sol ? <Check className="w-5 h-5 inline" style={{ color: '#2D6A4F' }} /> : <X className="w-5 h-5 inline text-gray-300" />}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {tmpl ? <Check className="w-5 h-5 inline" style={{ color: '#2D6A4F' }} /> : <X className="w-5 h-5 inline text-gray-300" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </Section>

      {/* ── FUNNEL STEP 7: Social proof — testimonials ── */}
      <Section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1B4332' }}>
              What UK freelancers say
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <motion.div key={t.name} variants={fadeUp} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" style={{ color: '#F59E0B' }} />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 italic">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#1B4332' }}>{t.name}</p>
                  <p className="text-gray-400 text-sm">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── FUNNEL STEP 8: Pricing — convert ── */}
      <Section id="pricing" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1B4332' }}>Simple, honest pricing</h2>
            <p className="text-gray-500 text-lg">No subscriptions required. Pay per document or go unlimited.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Pay per doc */}
            <motion.div variants={fadeUp} className="rounded-2xl border border-gray-200 p-8 bg-[#FAFAF8]">
              <p className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-widest">Pay as you go</p>
              <div className="flex items-end gap-1 mb-2">
                <span className="font-display text-6xl font-bold" style={{ color: '#1B4332' }}>£7</span>
                <span className="text-gray-500 mb-2 text-lg">/ document</span>
              </div>
              <p className="text-gray-500 mb-8">Generate one contract at a time. Perfect if you only need a contract occasionally.</p>
              <ul className="space-y-3 mb-8">
                {['Full UK-compliant contract', 'Instant PDF & Word download', 'Tailored to your answers', 'No subscription'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#2D6A4F' }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/app"
                className="block text-center font-semibold py-3.5 rounded-xl border-2 transition-colors hover:bg-[#D8F3DC]"
                style={{ borderColor: '#2D6A4F', color: '#2D6A4F' }}
              >
                Generate a contract
              </Link>
            </motion.div>

            {/* Unlimited */}
            <motion.div variants={fadeUp} className="rounded-2xl p-8 text-white relative overflow-hidden shadow-lg" style={{ backgroundColor: '#2D6A4F' }}>
              <div className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: '#52B788', color: '#1B4332' }}>
                BEST VALUE
              </div>
              <p className="text-sm font-semibold mb-3 uppercase tracking-widest" style={{ color: '#D8F3DC' }}>Unlimited</p>
              <div className="flex items-end gap-1 mb-2">
                <span className="font-display text-6xl font-bold">£19</span>
                <span className="mb-2 text-lg" style={{ color: '#D8F3DC' }}>/ month</span>
              </div>
              <p className="mb-8" style={{ color: '#D8F3DC' }}>Unlimited contracts for busy freelancers and growing teams.</p>
              <ul className="space-y-3 mb-8">
                {['Unlimited contracts', 'All 8 contract types', 'PDF & Word download', 'Cancel any time'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#52B788' }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/app"
                className="block text-center font-semibold py-3.5 rounded-xl transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#52B788', color: '#1B4332' }}
              >
                Start unlimited plan
              </Link>
            </motion.div>
          </div>
          <motion.p variants={fadeUp} className="text-center text-sm text-gray-400 mt-6">
            Secure payment via Stripe · No account required to get started
          </motion.p>
        </div>
      </Section>

      {/* ── FUNNEL STEP 9: Final CTA — last push ── */}
      <section className="py-24" style={{ backgroundColor: '#1B4332' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
            <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: '#52B788' }}>
              Get started in 5 minutes
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Your first contract is{' '}
              <em className="italic font-display" style={{ color: '#52B788' }}>5 minutes away</em>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-xl mb-10 max-w-2xl mx-auto" style={{ color: '#D8F3DC' }}>
              Join hundreds of UK freelancers and small businesses who protect themselves with ClauseKit — without the solicitor&rsquo;s bill.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 font-semibold px-10 py-4 rounded-xl text-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#52B788', color: '#1B4332' }}
              >
                Generate your first contract — £7
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#pricing"
                className="inline-flex items-center gap-2 font-medium px-8 py-4 rounded-xl text-lg border border-[#2D6A4F] transition-colors hover:border-[#52B788]"
                style={{ color: '#D8F3DC' }}
              >
                View pricing
              </Link>
            </motion.div>
            <motion.p variants={fadeUp} className="mt-6 text-sm" style={{ color: '#52B788' }}>
              No account needed · Answer questions, download, done
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#0F2B1E' }} className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#2D6A4F' }}>
                <FileText className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white">ClauseKit</span>
            </div>
            <div className="flex items-center gap-8 text-sm" style={{ color: '#52B788' }}>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/app" className="hover:text-white transition-colors">App</Link>
            </div>
            <p className="text-sm" style={{ color: '#52B788' }}>
              &copy; {new Date().getFullYear()} ClauseKit. Not a law firm.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
