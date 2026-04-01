'use client'

import { motion, AnimatePresence, useInView } from 'framer-motion'
import Link from 'next/link'
import { useRef, useState } from 'react'
import {
  Check,
  X,
  ArrowRight,
  ChevronDown,
  Briefcase,
  Users,
  Lock,
  RotateCcw,
  Wrench,
  ClipboardList,
  Globe,
  FileText,
  Menu,
  Shield,
  Zap,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Animation variants ─────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
}
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

function Section({ children, className = '', id, style }: { children: React.ReactNode; className?: string; id?: string; style?: React.CSSProperties }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.section ref={ref} id={id} variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'} className={className} style={style}>
      {children}
    </motion.section>
  )
}

// ── Data ───────────────────────────────────────────────────────────────────

const CONTRACT_TYPES = [
  { Icon: Briefcase, title: 'Freelance / Project Agreement', desc: 'Scope, payment, IP ownership, revision limits \u2014 everything you need.' },
  { Icon: Users, title: 'NDA (Mutual)', desc: 'Both parties protect each other\u2019s confidential information.' },
  { Icon: Lock, title: 'NDA (One-Way)', desc: 'You share; they sign. Airtight confidentiality clause.' },
  { Icon: RotateCcw, title: 'Retainer Agreement', desc: 'Monthly fee, scope of work, termination terms \u2014 ongoing clients sorted.' },
  { Icon: Wrench, title: 'Subcontractor Agreement', desc: 'Bring in a third party without exposing yourself.' },
  { Icon: ClipboardList, title: 'Client Service Agreement', desc: 'General terms for delivering services \u2014 works across industries.' },
  { Icon: Globe, title: 'Website Terms & Conditions', desc: 'GDPR-compliant T&Cs, privacy policy and acceptable use.' },
  { Icon: Shield, title: 'Employment Offer Letter', desc: 'Role, salary, start date, probation period \u2014 offer letters done right.' },
]

const COMPARISON_ROWS = [
  { feature: 'Cost per contract', ck: '\u00A37', sol: '\u00A3150\u2013\u00A3500', tmpl: 'Free (but generic)', ckTick: null, solTick: null, tmplTick: null },
  { feature: 'Time to receive', ck: '2 minutes', sol: '2\u20135 days', tmpl: 'Instant', ckTick: null, solTick: null, tmplTick: null },
  { feature: 'Bespoke to your situation', ck: null, sol: null, tmpl: null, ckTick: true, solTick: true, tmplTick: false },
  { feature: 'UK law compliant', ck: null, sol: null, tmpl: null, ckTick: true, solTick: true, tmplTick: false },
  { feature: 'IR35 aware', ck: null, sol: null, tmpl: null, ckTick: true, solTick: false, tmplTick: false },
  { feature: 'GDPR data clause', ck: null, sol: null, tmpl: null, ckTick: true, solTick: false, tmplTick: false },
  { feature: 'IP ownership clause', ck: null, sol: null, tmpl: null, ckTick: true, solTick: true, tmplTick: false },
  { feature: 'Late payment protection', ck: null, sol: null, tmpl: null, ckTick: true, solTick: false, tmplTick: false },
  { feature: 'Available 24/7', ck: null, sol: null, tmpl: null, ckTick: true, solTick: false, tmplTick: true },
  { feature: 'No account needed', ck: null, sol: null, tmpl: null, ckTick: true, solTick: false, tmplTick: false },
]

const FAQS = [
  {
    q: 'Is this real legal advice?',
    a: 'ClauseKit generates professionally drafted contracts that have been reviewed by a qualified UK solicitor. They are not a substitute for personalised legal advice, but they are significantly more robust than generic templates and are drafted under UK law.',
  },
  {
    q: 'What makes ClauseKit different to free template sites?',
    a: 'Free templates are generic. ClauseKit generates a bespoke document based on your specific situation \u2014 your client\u2019s name, the exact work, your payment terms, and the specific protections you need. No template does this.',
  },
  {
    q: 'How does the payment work?',
    a: 'Generating a contract is completely free. You only pay \u00A37 when you want to download the full PDF or Word version. No subscription needed unless you want unlimited downloads.',
  },
  {
    q: 'Is my data secure?',
    a: 'We don\u2019t store your contract content after generation. Your information is processed securely and immediately discarded after your document is generated. We never share your data with third parties.',
  },
  {
    q: 'Which law applies to the contracts?',
    a: 'All contracts are drafted under English & Welsh law by default. They include relevant UK legislation including the Late Payment of Commercial Debts Act 1998 and are IR35 aware.',
  },
  {
    q: 'What if I need a contract type that isn\u2019t listed?',
    a: 'Message us on WhatsApp. We add new contract types regularly based on user requests, and we can usually help you adapt an existing type to your needs.',
  },
]

const MARQUEE_TEXT = 'Freelancers \u00B7 Web Agencies \u00B7 Consultants \u00B7 Tradespeople \u00B7 Care Providers \u00B7 Small Businesses \u00B7 Designers \u00B7 Developers \u00B7 Recruiters \u00B7 '
const PROOF_TEXT = '2,000+ contracts generated \u00B7 UK-only \u2014 not a global template tool \u00B7 IR35-aware \u00B7 Solicitor-reviewed \u00B7 English & Welsh law \u00B7 GDPR compliant \u00B7 \u00A37 flat fee \u00B7 No account needed \u00B7 '

// ── WhatsApp SVG ───────────────────────────────────────────────────────────

function WhatsAppIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

// ── Marquee ────────────────────────────────────────────────────────────────

function Marquee({ text, bgClass, textClass }: { text: string; bgClass: string; textClass: string }) {
  const repeated = text.repeat(4)
  return (
    <div className={cn('overflow-hidden py-3', bgClass)}>
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      >
        <span className={cn('text-sm font-medium pr-4', textClass)}>{repeated}</span>
        <span className={cn('text-sm font-medium pr-4', textClass)}>{repeated}</span>
      </motion.div>
    </div>
  )
}

// ── FAQ Item ───────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b last:border-b-0" style={{ borderColor: '#E5E5E2' }}>
      <button
        className="w-full flex items-center justify-between py-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-semibold pr-4" style={{ color: '#1B4332' }}>{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: '#6B7280' }} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm leading-relaxed" style={{ color: '#6B7280' }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Background Decorators ─────────────────────────────────────────────────

function HeroBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <div style={{ position: 'absolute', top: '-80px', left: '-60px', width: '520px', height: '520px', background: 'radial-gradient(circle at 35% 40%, rgba(216,243,220,0.85) 0%, transparent 65%)' }} />
      <div style={{ position: 'absolute', bottom: '-60px', right: '-40px', width: '400px', height: '400px', background: 'radial-gradient(circle at 60% 60%, rgba(82,183,136,0.25) 0%, transparent 65%)' }} />
      <div style={{ position: 'absolute', top: '30%', right: '12%', width: '180px', height: '180px', background: 'radial-gradient(circle, rgba(216,243,220,0.5) 0%, transparent 70%)' }} />
    </div>
  )
}

function ProblemBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, rgba(239,68,68,0.03) 0px, rgba(239,68,68,0.03) 1px, transparent 1px, transparent 20px)' }} />
      <svg style={{ position: 'absolute', top: '6%', right: '4%', opacity: 0.05 }} width="100" height="150" viewBox="0 0 60 90">
        <rect x="20" y="0" width="20" height="52" rx="4" fill="#EF4444" />
        <rect x="20" y="62" width="20" height="20" rx="4" fill="#EF4444" />
      </svg>
      <svg style={{ position: 'absolute', bottom: '-10px', left: '-5px', opacity: 0.04 }} width="180" height="180" viewBox="0 0 100 100">
        <text x="0" y="90" fontSize="100" fontWeight="bold" fill="#F59E0B" fontFamily="Georgia, serif">£</text>
      </svg>
    </div>
  )
}

function HowItWorksBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(45,106,79,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(45,106,79,0.06) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      {['01', '02', '03'].map((n, i) => (
        <div key={n} style={{ position: 'absolute', left: `${6 + i * 32}%`, bottom: '2%', fontSize: '200px', fontWeight: 900, color: 'rgba(45,106,79,0.035)', fontFamily: 'Georgia, serif', lineHeight: 1, userSelect: 'none' }}>{n}</div>
      ))}
    </div>
  )
}

function ComparisonBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{ position: 'absolute', inset: -60, borderRadius: '46%', border: `1px solid rgba(45,106,79,${0.04 + i * 0.008})`, transform: `scale(${0.35 + i * 0.22}) rotate(${i * 15}deg)`, transformOrigin: '52% 48%' }} />
      ))}
    </div>
  )
}

function ContractTypesBg() {
  const docs: Array<{ top?: string; bottom?: string; left?: string; right?: string; rotate: number; size: number }> = [
    { top: '8%', left: '2%', rotate: -14, size: 58 },
    { top: '12%', right: '4%', rotate: 9, size: 44 },
    { top: '48%', left: '0.5%', rotate: 6, size: 52 },
    { bottom: '12%', right: '2%', rotate: -9, size: 48 },
    { bottom: '6%', left: '7%', rotate: 16, size: 38 },
    { top: '38%', right: '1.5%', rotate: -6, size: 34 },
  ]
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {docs.map((p, i) => (
        <svg key={i} style={{ position: 'absolute', opacity: 0.05, transform: `rotate(${p.rotate}deg)`, top: p.top, bottom: p.bottom, left: p.left, right: p.right }} width={p.size} height={Math.round(p.size * 1.3)} viewBox="0 0 40 52">
          <path d="M0 0h28l12 12v40H0V0z" fill="#2D6A4F" />
          <path d="M28 0l12 12H28V0z" fill="#1B4332" />
          <rect x="6" y="20" width="28" height="2" rx="1" fill="white" opacity="0.5" />
          <rect x="6" y="26" width="22" height="2" rx="1" fill="white" opacity="0.5" />
          <rect x="6" y="32" width="25" height="2" rx="1" fill="white" opacity="0.5" />
        </svg>
      ))}
    </div>
  )
}

function TrustBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <div style={{ position: 'absolute', top: '-100px', right: '-80px', width: '520px', height: '520px', background: 'radial-gradient(circle, rgba(216,243,220,0.45) 0%, transparent 65%)' }} />
      <div style={{ position: 'absolute', bottom: '-80px', left: '-60px', width: '420px', height: '420px', background: 'radial-gradient(circle, rgba(82,183,136,0.18) 0%, transparent 65%)' }} />
      <svg style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.025 }} width="500" height="500" viewBox="0 0 24 24" fill="#2D6A4F">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
      </svg>
    </div>
  )
}

function PricingBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <div style={{ position: 'absolute', top: '-30px', right: '-20px', width: '180px', height: '180px', border: '2px solid rgba(45,106,79,0.08)', transform: 'rotate(15deg)' }} />
      <div style={{ position: 'absolute', top: '15px', right: '35px', width: '130px', height: '130px', border: '2px solid rgba(45,106,79,0.06)', transform: 'rotate(30deg)' }} />
      <div style={{ position: 'absolute', bottom: '-25px', left: '-15px', width: '160px', height: '160px', border: '2px solid rgba(45,106,79,0.08)', transform: 'rotate(-18deg)' }} />
      <div style={{ position: 'absolute', bottom: '25px', left: '30px', width: '100px', height: '100px', border: '2px solid rgba(45,106,79,0.06)', transform: 'rotate(-32deg)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '700px', height: '320px', background: 'radial-gradient(ellipse at 50% 100%, rgba(216,243,220,0.55) 0%, transparent 60%)' }} />
    </div>
  )
}

function FaqBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%' }} viewBox="0 0 1440 70" preserveAspectRatio="none">
        <path d="M0,35 C360,65 720,5 1080,35 C1260,50 1380,20 1440,35 L1440,0 L0,0 Z" fill="rgba(45,106,79,0.05)" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(45,106,79,0.07) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%' }} viewBox="0 0 1440 70" preserveAspectRatio="none">
        <path d="M0,35 C360,5 720,65 1080,35 C1260,20 1380,50 1440,35 L1440,70 L0,70 Z" fill="rgba(45,106,79,0.05)" />
      </svg>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF8' }}>

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-white border-b" style={{ borderColor: '#E5E5E2' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 flex items-center justify-center" style={{ backgroundColor: '#2D6A4F' }}>
              <FileText className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm" style={{ color: '#1B4332' }}>ClauseKit</span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            <Link href="#how-it-works" className="text-sm transition-colors" style={{ color: '#6B7280' }}>How it works</Link>
            <Link href="#contracts" className="text-sm transition-colors" style={{ color: '#6B7280' }}>Contract types</Link>
            <Link href="#pricing" className="text-sm transition-colors" style={{ color: '#6B7280' }}>Pricing</Link>
            <Link href="#faq" className="text-sm transition-colors" style={{ color: '#6B7280' }}>FAQ</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://wa.me/447700900000"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border transition-colors hover:bg-[#D8F3DC]"
              style={{ borderColor: '#2D6A4F', color: '#2D6A4F', backgroundColor: 'transparent' }}
            >
              <WhatsAppIcon className="w-4 h-4" />
              WhatsApp
            </a>
            <Link
              href="/app"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#2D6A4F' }}
            >
              Launch App
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            <Menu className="w-5 h-5" style={{ color: '#1B4332' }} />
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t px-4 pb-4 pt-2 bg-white flex flex-col gap-2" style={{ borderColor: '#E5E5E2' }}>
            <Link href="#how-it-works" className="py-2 text-sm" style={{ color: '#6B7280' }} onClick={() => setMobileOpen(false)}>How it works</Link>
            <Link href="#contracts" className="py-2 text-sm" style={{ color: '#6B7280' }} onClick={() => setMobileOpen(false)}>Contract types</Link>
            <Link href="#pricing" className="py-2 text-sm" style={{ color: '#6B7280' }} onClick={() => setMobileOpen(false)}>Pricing</Link>
            <Link href="#faq" className="py-2 text-sm" style={{ color: '#6B7280' }} onClick={() => setMobileOpen(false)}>FAQ</Link>
            <div className="flex gap-2 pt-2">
              <a href="https://wa.me/447700900000" target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium border" style={{ borderColor: '#2D6A4F', color: '#2D6A4F' }}>
                <WhatsAppIcon className="w-4 h-4" />WhatsApp
              </a>
              <Link href="/app" className="flex-1 flex items-center justify-center gap-1 py-2 text-sm font-semibold text-white" style={{ backgroundColor: '#2D6A4F' }}>
                Launch App <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-20 text-center" style={{ backgroundColor: '#FAFAF8' }}>
        <HeroBg />
        <div className="max-w-6xl mx-auto relative" style={{ zIndex: 1 }}>
        <motion.div variants={stagger} initial="hidden" animate="visible">
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium mb-8"
            style={{ backgroundColor: '#D8F3DC', color: '#1B4332' }}
          >
            <Shield className="w-3.5 h-3.5" style={{ color: '#2D6A4F' }} />
            The only UK-only contract builder &middot; Solicitor-reviewed &middot; IR35-aware
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 max-w-4xl mx-auto"
            style={{ color: '#1B4332' }}
          >
            UK contracts built for<br />
            <em className="italic font-display" style={{ color: '#2D6A4F' }}>UK freelancers.</em>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-xl max-w-2xl mx-auto mb-10" style={{ color: '#6B7280' }}>
            Not a template. Not a generic AI tool. ClauseKit generates bespoke, IR35-aware contracts under English & Welsh law — reviewed by a real UK solicitor. Ready in 2 minutes. &pound;7 to download.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#2D6A4F' }}
            >
              Launch App
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="https://wa.me/447700900000"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold border transition-colors hover:bg-[#D8F3DC]"
              style={{ borderColor: '#2D6A4F', color: '#2D6A4F', backgroundColor: 'transparent' }}
            >
              <WhatsAppIcon className="w-5 h-5" />
              Chat on WhatsApp
            </a>
          </motion.div>

          <motion.p variants={fadeUp} className="text-sm" style={{ color: '#9CA3AF' }}>
            No account needed &middot; Generate free &middot; Pay £7 to download &middot; English & Welsh law only
          </motion.p>
        </motion.div>
        </div>
      </section>

      {/* ── MARQUEE: Who it's for ── */}
      <Marquee text={MARQUEE_TEXT} bgClass="bg-white border-y" textClass="text-[#6B7280]" />

      {/* ── SOCIAL PROOF STRIP ── */}
      <Marquee text={PROOF_TEXT} bgClass="bg-[#2D6A4F]" textClass="text-white opacity-90" />

      {/* ── PAIN ── */}
      <Section id="problem" className="relative py-20" style={{ backgroundColor: '#FFF8F5' }}>
        <ProblemBg />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative" style={{ zIndex: 1 }}>
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#2D6A4F' }}>The Problem</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold" style={{ color: '#1B4332' }}>Sound familiar?</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              {
                colour: '#EF4444',
                label: '\u00A3300/hr',
                title: 'Solicitors charge \u00A3150\u2013\u00A3500 for a basic contract',
                body: 'And then they take 3 days to deliver it. You needed it yesterday.',
              },
              {
                colour: '#F59E0B',
                label: 'Generic',
                title: 'Free templates don\u2019t cover your situation',
                body: 'They\u2019re generic. They miss IR35 clauses, UK payment terms, and the specific protection you actually need.',
              },
              {
                colour: '#EF4444',
                label: 'Risk',
                title: 'Working without a contract is a liability',
                body: 'One bad client can cost you thousands. A proper contract takes that risk off the table permanently.',
              },
            ].map((card) => (
              <motion.div
                key={card.title}
                variants={fadeUp}
                className="bg-white border p-8"
                style={{ borderColor: '#E5E5E2' }}
              >
                <div
                  className="inline-flex items-center px-3 py-1 text-xs font-bold text-white mb-4"
                  style={{ backgroundColor: card.colour }}
                >
                  {card.label}
                </div>
                <h3 className="font-semibold text-base mb-3 leading-snug" style={{ color: '#1B4332' }}>{card.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{card.body}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            variants={fadeUp}
            className="border p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ backgroundColor: '#D8F3DC', borderColor: '#52B788' }}
          >
            <p className="font-semibold" style={{ color: '#1B4332' }}>
              ClauseKit solves all three. In under 2 minutes. For &pound;7.
            </p>
            <Link
              href="/app"
              className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#2D6A4F' }}
            >
              Launch App <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </Section>

      {/* ── HOW IT WORKS ── */}
      <Section id="how-it-works" className="relative py-20 bg-white">
        <HowItWorksBg />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative" style={{ zIndex: 1 }}>
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#2D6A4F' }}>How It Works</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold" style={{ color: '#1B4332' }}>
              From blank page to signed contract in 3 steps
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {[
              {
                n: '01',
                title: 'Describe your situation',
                body: 'No legal knowledge needed. Tell us who\u2019s involved, what the work is, and what you need protected.',
              },
              {
                n: '02',
                title: 'ClauseKit drafts your contract',
                body: 'ClauseKit generates a bespoke UK-law document with all the right clauses for your exact situation.',
              },
              {
                n: '03',
                title: 'Download and use',
                body: 'Pay \u00A37 to unlock the full contract as PDF or Word. Ready to send to your client immediately.',
              },
            ].map((step, i) => (
              <motion.div key={step.n} variants={fadeUp} className="text-center relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-6 left-[55%] w-[90%] h-px" style={{ backgroundColor: '#D8F3DC' }} />
                )}
                <div
                  className="w-12 h-12 flex items-center justify-center mx-auto mb-5 text-lg font-bold text-white font-display"
                  style={{ backgroundColor: '#2D6A4F' }}
                >
                  {step.n}
                </div>
                <h3 className="font-semibold text-base mb-2" style={{ color: '#1B4332' }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{step.body}</p>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp} className="text-center mt-14">
            <p className="text-sm mb-4" style={{ color: '#6B7280' }}>Try it yourself &mdash; free to generate</p>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#2D6A4F' }}
            >
              Launch App <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </Section>

      {/* ── COMPARISON TABLE ── */}
      <Section className="relative py-20" style={{ backgroundColor: '#F0FDF4' }}>
        <ComparisonBg />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative" style={{ zIndex: 1 }}>
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#2D6A4F' }}>How We Compare</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold" style={{ color: '#1B4332' }}>
              Other tools cover the world.<br />We cover the UK — properly.
            </h2>
          </motion.div>

          <motion.div variants={fadeUp} className="relative mt-6">
            <span
              className="absolute text-[10px] font-bold px-2.5 py-1 text-white whitespace-nowrap z-10"
              style={{ backgroundColor: '#2D6A4F', top: '-14px', left: '37%', transform: 'translateX(-50%)' }}
            >
              Best option
            </span>
            <div className="overflow-x-auto border" style={{ borderColor: '#E5E5E2' }}>
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b" style={{ borderColor: '#E5E5E2' }}>
                  <th className="text-left px-5 py-3.5 text-sm font-semibold" style={{ color: '#1B4332', backgroundColor: '#F0FDF4' }}>
                    Feature
                  </th>
                  <th className="px-5 py-3.5 text-center font-semibold" style={{ backgroundColor: '#D8F3DC', color: '#1B4332' }}>
                    ClauseKit
                  </th>
                  <th className="px-5 py-3.5 text-center font-medium" style={{ backgroundColor: '#F0FDF4', color: '#6B7280' }}>Solicitor</th>
                  <th className="px-5 py-3.5 text-center font-medium" style={{ backgroundColor: '#F0FDF4', color: '#6B7280' }}>Template Website</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? 'bg-white' : ''} style={{ backgroundColor: i % 2 !== 0 ? '#F0FDF4' : undefined }}>
                    <td className="px-5 py-3.5 font-medium" style={{ color: '#374151' }}>{row.feature}</td>
                    <td className="px-5 py-3.5 text-center" style={{ backgroundColor: i % 2 === 0 ? '#F0FAF4' : '#EDFAF2' }}>
                      {row.ck !== null ? (
                        <span className="font-semibold" style={{ color: '#1B4332' }}>{row.ck}</span>
                      ) : row.ckTick ? (
                        <Check className="w-4 h-4 inline" style={{ color: '#2D6A4F' }} strokeWidth={3} />
                      ) : (
                        <X className="w-4 h-4 inline text-red-400" />
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center" style={{ color: '#6B7280' }}>
                      {row.sol !== null ? (
                        row.sol
                      ) : row.solTick ? (
                        <Check className="w-4 h-4 inline" style={{ color: '#2D6A4F' }} strokeWidth={3} />
                      ) : (
                        <X className="w-4 h-4 inline text-red-400" />
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center" style={{ color: '#6B7280' }}>
                      {row.tmpl !== null ? (
                        row.tmpl
                      ) : row.tmplTick ? (
                        <Check className="w-4 h-4 inline" style={{ color: '#2D6A4F' }} strokeWidth={3} />
                      ) : (
                        <X className="w-4 h-4 inline text-red-400" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </motion.div>

          <motion.p variants={fadeUp} className="text-center text-sm mt-6" style={{ color: '#6B7280' }}>
            Every other AI contract tool supports 50+ jurisdictions as an afterthought. ClauseKit is built exclusively for English & Welsh law — with IR35 awareness, Late Payment Act clauses, and GDPR built in from day one.
          </motion.p>
        </div>
      </Section>

      {/* ── CONTRACT TYPES ── */}
      <Section id="contracts" className="relative py-20 bg-white">
        <ContractTypesBg />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative" style={{ zIndex: 1 }}>
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#2D6A4F' }}>What We Cover</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold" style={{ color: '#1B4332' }}>
              8 contract types. Every situation covered.
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {CONTRACT_TYPES.map((c) => (
              <motion.div
                key={c.title}
                variants={fadeUp}
                className="group border p-5 flex flex-col hover:border-[#2D6A4F] hover:shadow-sm transition-all cursor-pointer"
                style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E2' }}
              >
                <Link href="/app" className="flex flex-col h-full">
                  <div className="w-9 h-9 flex items-center justify-center mb-3 flex-shrink-0" style={{ backgroundColor: '#D8F3DC' }}>
                    <c.Icon className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                  </div>
                  <p className="text-sm font-semibold mb-1 leading-snug" style={{ color: '#111827' }}>{c.title}</p>
                  <p className="text-xs leading-relaxed mb-3 flex-1" style={{ color: '#6B7280' }}>{c.desc}</p>
                  <span className="text-xs font-semibold flex items-center gap-1" style={{ color: '#2D6A4F' }}>
                    Generate <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp} className="text-center mt-10">
            <p className="text-sm mb-3" style={{ color: '#6B7280' }}>
              Don&rsquo;t see your contract type? Message us on WhatsApp.
            </p>
            <a
              href="https://wa.me/447700900000"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border transition-colors hover:bg-[#D8F3DC]"
              style={{ borderColor: '#2D6A4F', color: '#2D6A4F' }}
            >
              <WhatsAppIcon className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </motion.div>
        </div>
      </Section>

      {/* ── TRUST SIGNALS ── */}
      <Section className="relative py-20" style={{ backgroundColor: '#F0FDF4' }}>
        <TrustBg />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative" style={{ zIndex: 1 }}>
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#2D6A4F' }}>Why ClauseKit Wins</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold" style={{ color: '#1B4332' }}>
              Built exclusively for UK freelancers.<br />Not bolted on. Not an afterthought.
            </h2>
            <p className="text-base mt-4 max-w-2xl mx-auto" style={{ color: '#6B7280' }}>
              Every other AI contract tool was built for the US market and added UK support later. ClauseKit was built UK-first, from the ground up.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
            {[
              { Icon: Shield, title: 'Solicitor-Reviewed', body: 'A qualified UK solicitor reviewed every contract type before it ever reached a user. Not AI alone — human legal expertise baked in.' },
              { Icon: Zap, title: 'IR35-Aware', body: 'Every freelance and retainer contract includes IR35 awareness. Most global tools don\'t even know what IR35 is.' },
              { Icon: FileText, title: 'UK Law Exclusively', body: 'English & Welsh law only. Late Payment of Commercial Debts Act 1998. GDPR clauses. Nothing generic, nothing foreign.' },
              { Icon: Lock, title: 'No Account. No Subscription.', body: 'Generate free. Pay £7 to download. No sign-up, no monthly fee, no lock-in. The lowest friction in the market.' },
            ].map((t) => (
              <motion.div key={t.title} variants={fadeUp} className="bg-white border p-6" style={{ borderColor: '#E5E5E2' }}>
                <div className="w-10 h-10 flex items-center justify-center mb-4" style={{ backgroundColor: '#D8F3DC' }}>
                  <t.Icon className="w-5 h-5" style={{ color: '#2D6A4F' }} />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: '#1B4332' }}>{t.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{t.body}</p>
              </motion.div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: '\u201cI used to dread the contract conversation with new clients. ClauseKit made it something I actually look forward to.\u201d', name: 'Sarah T.', role: 'Freelance Web Designer, London' },
              { quote: '\u201cPaid \u00A37, got a contract that my clients take seriously. A solicitor quoted me \u00A3350 for the same thing.\u201d', name: 'James M.', role: 'Digital Marketing Consultant, Manchester' },
              { quote: '\u201cThe IR35 clause alone is worth the \u00A37. Most freelance templates don\u2019t even mention it.\u201d', name: 'Priya K.', role: 'UX Designer, Birmingham' },
            ].map((t) => (
              <motion.div key={t.name} variants={fadeUp} className="bg-white border p-6" style={{ borderColor: '#E5E5E2' }}>
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" style={{ color: '#F59E0B' }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed italic mb-5" style={{ color: '#374151' }}>{t.quote}</p>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#1B4332' }}>{t.name}</p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── PRICING ── */}
      <Section id="pricing" className="relative py-20 bg-white">
        <PricingBg />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative" style={{ zIndex: 1 }}>
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#2D6A4F' }}>Pricing</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold" style={{ color: '#1B4332' }}>
              Transparent pricing. No subscriptions needed.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Pay per doc */}
            <motion.div variants={fadeUp} className="border-2 p-8" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#9CA3AF' }}>Pay as you go</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display text-5xl font-bold" style={{ color: '#1B4332' }}>&pound;7</span>
                <span className="text-base" style={{ color: '#6B7280' }}>per contract</span>
              </div>
              <p className="text-sm mb-6" style={{ color: '#6B7280' }}>Generate one contract at a time.</p>
              <ul className="space-y-2.5 mb-8">
                {['Generate completely free', 'Pay \u00A37 to unlock download', 'PDF + Word formats', 'No account needed', 'Use immediately'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#52B788' }} strokeWidth={3} />
                    <span style={{ color: '#1A1A1A' }}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/app"
                className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold border-2 transition-colors hover:bg-[#D8F3DC]"
                style={{ borderColor: '#2D6A4F', color: '#2D6A4F', backgroundColor: 'transparent' }}
              >
                Generate a contract <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Unlimited */}
            <motion.div variants={fadeUp} className="border-2 p-8 relative text-white" style={{ borderColor: '#2D6A4F', backgroundColor: '#2D6A4F' }}>
              <div
                className="absolute -top-3.5 left-6 px-3 py-0.5 text-xs font-bold"
                style={{ backgroundColor: '#52B788', color: '#1B4332' }}
              >
                Most Popular
              </div>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#D8F3DC' }}>Unlimited</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display text-5xl font-bold">&pound;19</span>
                <span className="text-base" style={{ color: '#D8F3DC' }}>/month &mdash; cancel anytime</span>
              </div>
              <p className="text-sm mb-6" style={{ color: '#D8F3DC' }}>Unlimited contracts for busy freelancers and growing teams.</p>
              <ul className="space-y-2.5 mb-8">
                {['Unlimited contract generation', 'All 8 contract types', 'PDF + Word downloads', 'Priority generation', 'New types as added', 'Cancel anytime'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#52B788' }} strokeWidth={3} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/app"
                className="flex items-center justify-center w-full py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#FFFFFF', color: '#1B4332' }}
              >
                Start unlimited &rarr;
              </Link>
            </motion.div>
          </div>

          <motion.p variants={fadeUp} className="text-center text-sm mt-6" style={{ color: '#9CA3AF' }}>
            Compare: a solicitor charges &pound;150&ndash;&pound;500 for a basic freelance contract. One ClauseKit contract pays for 3 months of the unlimited plan.
          </motion.p>
        </div>
      </Section>

      {/* ── FAQ ── */}
      <Section id="faq" className="relative py-20 bg-white">
        <FaqBg />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative" style={{ zIndex: 1 }}>
          <motion.div variants={fadeUp} className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#2D6A4F' }}>FAQ</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold" style={{ color: '#1B4332' }}>
              Everything you need to know
            </h2>
          </motion.div>

          <motion.div variants={fadeUp} className="border" style={{ borderColor: '#E5E5E2', backgroundColor: '#FFFFFF' }}>
            <div className="divide-y" style={{ borderColor: '#E5E5E2' }}>
              {FAQS.map((item) => (
                <div key={item.q} className="px-6">
                  <FaqItem q={item.q} a={item.a} />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 text-center text-white" style={{ backgroundColor: '#2D6A4F' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-5">
            Stop using generic templates.<br />Get a contract built for you.
          </h2>
          <p className="text-xl mb-10" style={{ color: '#D8F3DC' }}>
            UK law. IR35-aware. Solicitor-reviewed. &pound;7 to download. Ready in 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#FFFFFF', color: '#1B4332' }}
            >
              Launch App <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="https://wa.me/447700900000"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold border-2 transition-colors hover:bg-[#1B4332]"
              style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#FFFFFF' }}
            >
              <WhatsAppIcon className="w-5 h-5" />
              Chat on WhatsApp
            </a>
          </div>
          <p className="text-sm" style={{ color: '#D8F3DC' }}>
            Solicitor-reviewed &middot; ClauseKit powered &middot; UK law only
          </p>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-14" style={{ backgroundColor: '#1B4332' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 flex items-center justify-center" style={{ backgroundColor: '#2D6A4F' }}>
                  <FileText className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-white">ClauseKit</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#D8F3DC' }}>
                Professional contracts for UK freelancers & small businesses
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#52B788' }}>Contracts</p>
              <ul className="space-y-2">
                {['Freelance', 'NDA', 'Retainer', 'Subcontractor', 'Service', 'T&Cs', 'Late Payment', 'Employment'].map((t) => (
                  <li key={t}>
                    <Link href="/app" className="text-sm transition-colors hover:opacity-70" style={{ color: '#FFFFFF' }}>{t}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#52B788' }}>Company</p>
              <ul className="space-y-2">
                {[
                  { label: 'How it works', href: '#how-it-works' },
                  { label: 'Pricing', href: '#pricing' },
                  { label: 'FAQ', href: '#faq' },
                  { label: 'WhatsApp', href: 'https://wa.me/447700900000' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm transition-colors hover:opacity-70" style={{ color: '#FFFFFF' }}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#52B788' }}>Questions?</p>
              <a
                href="https://wa.me/447700900000"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#25D366' }}
              >
                <WhatsAppIcon className="w-4 h-4" />
                Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-3" style={{ borderColor: '#2D6A4F' }}>
            <p className="text-xs" style={{ color: '#D8F3DC' }}>
              &copy; 2026 ClauseKit. Not legal advice. ClauseKit Ltd.
            </p>
            <div className="flex items-center gap-5">
              <Link href="/privacy" className="text-xs hover:opacity-70 transition-opacity" style={{ color: '#FFFFFF' }}>Privacy</Link>
              <Link href="/terms" className="text-xs hover:opacity-70 transition-opacity" style={{ color: '#FFFFFF' }}>Terms</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ── FLOATING WHATSAPP ── */}
      <a
        href="https://wa.me/447700900000"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#25D366', borderRadius: '9999px' }}
      >
        <WhatsAppIcon className="w-5 h-5" />
        Chat with us
      </a>
    </div>
  )
}
