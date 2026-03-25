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
  Lock,
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
  { icon: Briefcase, title: 'Employment Contracts', desc: 'Full-time, part-time, and contractor agreements tailored to UK law.' },
  { icon: Users, title: 'Freelance Agreements', desc: 'Protect your work and get paid on time with clear terms.' },
  { icon: Lock, title: 'NDAs', desc: 'Mutual and one-way non-disclosure agreements in minutes.' },
  { icon: RotateCcw, title: 'Service Agreements', desc: 'Define scope, deliverables, and payment terms cleanly.' },
  { icon: Wrench, title: 'Partnership Deeds', desc: 'Set out profit sharing, duties, and exit rights.' },
  { icon: ClipboardList, title: 'Terms of Service', desc: 'Website and SaaS T&Cs compliant with UK consumer law.' },
  { icon: Globe, title: 'Privacy Policies', desc: 'GDPR-ready privacy policies for any UK business.' },
  { icon: FileText, title: 'Letters of Intent', desc: 'Non-binding LOIs to kick off deals the right way.' },
]

const problems = [
  {
    icon: Clock,
    title: 'Solicitors charge \u00A3200\u2013\u00A3400 per hour',
    desc: 'A simple NDA can cost \u00A3300\u2013\u00A3800 when a solicitor drafts it. That\u2019s money small businesses simply don\u2019t have.',
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
  { step: '01', title: 'Choose your contract', desc: 'Pick from 8 contract types built for UK small businesses and freelancers.' },
  { step: '02', title: 'Answer plain-English questions', desc: 'No legal jargon. Our smart form asks only what it needs, in plain English.' },
  { step: '03', title: 'Download your contract', desc: 'Get a professionally drafted, UK-compliant contract in under 5 minutes.' },
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
              className="text-sm font-medium text-white px-4 py-2 rounded-lg transition-colors"
              style={{ backgroundColor: '#2D6A4F' }}
            >
              Launch App
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
            <Link href="/app" className="text-sm font-medium text-white px-4 py-2 rounded-lg text-center" style={{ backgroundColor: '#2D6A4F' }}>
              Launch App
            </Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
        <motion.div variants={stagger} initial="hidden" animate="visible">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-6" style={{ backgroundColor: '#D8F3DC', color: '#1B4332' }}>
            <Shield className="w-3.5 h-3.5" />
            UK-compliant contracts in minutes
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 max-w-4xl mx-auto" style={{ color: '#1B4332' }}>
            Stop paying <span style={{ color: '#2D6A4F' }}>\u00A3300/hr</span> for contracts<br className="hidden sm:block" /> that take 5 minutes to generate
          </motion.h1>
          <motion.p variants={fadeUp} className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            ClauseKit creates professionally drafted, UK-compliant contracts in minutes \u2014 not days. For freelancers and small businesses who need legal protection without the legal bill.
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
            No signup required to start \u2014 pay only when you download
          </motion.p>
        </motion.div>
      </section>

      {/* Problem Section */}
      <Section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1B4332' }}>
              The contract problem for small businesses
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Getting proper legal documents shouldn\u2019t require a second mortgage.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {problems.map((p) => (
              <motion.div key={p.title} variants={fadeUp} className="bg-[#FAFAF8] rounded-2xl p-8 border border-gray-100">
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

      {/* How it works */}
      <Section id="how-it-works" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1B4332' }}>How ClauseKit works</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Three steps from zero to signed-ready contract.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <motion.div key={s.step} variants={fadeUp} className="text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white" style={{ backgroundColor: '#2D6A4F' }}>
                  {s.step}
                </div>
                <h3 className="font-semibold text-xl mb-3" style={{ color: '#1B4332' }}>{s.title}</h3>
                <p className="text-gray-500 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Comparison Table */}
      <Section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1B4332' }}>How we compare</h2>
            <p className="text-gray-500 text-lg">ClauseKit vs the alternatives</p>
          </motion.div>
          <motion.div variants={fadeUp} className="overflow-x-auto rounded-2xl border border-gray-100">
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
                  ['Costs under \u00A320', true, false, true],
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

      {/* Contract Types */}
      <Section id="contracts" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1B4332' }}>8 contract types, all UK-ready</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Every contract ClauseKit generates is tailored to your answers and compliant with current UK law.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contractTypes.map((c) => (
              <motion.div
                key={c.title}
                variants={fadeUp}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#52B788] hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors group-hover:bg-[#D8F3DC]" style={{ backgroundColor: '#D8F3DC' }}>
                  <c.icon className="w-5 h-5" style={{ color: '#2D6A4F' }} />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: '#1B4332' }}>{c.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Pricing */}
      <Section id="pricing" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1B4332' }}>Simple, honest pricing</h2>
            <p className="text-gray-500 text-lg">No subscriptions required. Pay per document or go unlimited.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Pay per doc */}
            <motion.div variants={fadeUp} className="rounded-2xl border border-gray-100 p-8 bg-[#FAFAF8]">
              <p className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">Pay as you go</p>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-5xl font-bold" style={{ color: '#1B4332' }}>\u00A37</span>
                <span className="text-gray-500 mb-2">/ document</span>
              </div>
              <p className="text-gray-500 mb-8">Generate one contract at a time. Perfect if you only need a contract occasionally.</p>
              <ul className="space-y-3 mb-8">
                {['Full UK-compliant contract', 'Instant PDF download', 'Tailored to your answers', 'No subscription'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#2D6A4F' }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/app" className="block text-center font-semibold py-3 rounded-xl border-2 transition-colors hover:bg-[#D8F3DC]" style={{ borderColor: '#2D6A4F', color: '#2D6A4F' }}>
                Generate a contract
              </Link>
            </motion.div>

            {/* Unlimited */}
            <motion.div variants={fadeUp} className="rounded-2xl p-8 text-white relative overflow-hidden" style={{ backgroundColor: '#2D6A4F' }}>
              <div className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: '#52B788' }}>
                BEST VALUE
              </div>
              <p className="text-sm font-medium mb-3 uppercase tracking-wide" style={{ color: '#D8F3DC' }}>Unlimited</p>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-5xl font-bold">\u00A319</span>
                <span className="mb-2" style={{ color: '#D8F3DC' }}>/ month</span>
              </div>
              <p className="mb-8" style={{ color: '#D8F3DC' }}>Unlimited contracts for busy freelancers and growing teams.</p>
              <ul className="space-y-3 mb-8">
                {['Unlimited contracts', 'All 8 contract types', 'Priority generation', 'Cancel any time'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#52B788' }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/app" className="block text-center font-semibold py-3 rounded-xl transition-opacity hover:opacity-90" style={{ backgroundColor: '#52B788', color: '#1B4332' }}>
                Start unlimited plan
              </Link>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* Final CTA */}
      <section className="py-24" style={{ backgroundColor: '#2D6A4F' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Your first contract is 5 minutes away
            </motion.h2>
            <motion.p variants={fadeUp} className="text-xl mb-10" style={{ color: '#D8F3DC' }}>
              Join hundreds of UK freelancers and small businesses who protect themselves with ClauseKit \u2014 without the solicitor\u2019s bill.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                href="/app"
                className="inline-flex items-center gap-2 font-semibold px-10 py-4 rounded-xl text-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#52B788', color: '#1B4332' }}
              >
                Generate your first contract \u2014 \u00A37
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
            <motion.p variants={fadeUp} className="mt-6 text-sm" style={{ color: '#52B788' }}>
              No account needed \u2014 answer questions, download, done.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1B4332] py-12">
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
