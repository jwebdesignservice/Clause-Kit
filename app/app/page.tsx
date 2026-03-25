'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Plus,
  FileText,
  Grid3X3,
  CreditCard,
  HelpCircle,
  Leaf,
  Briefcase,
  Users,
  Lock,
  RotateCcw,
  Wrench,
  ClipboardList,
  Globe,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Eye,
  Download,
  ExternalLink,
} from 'lucide-react'

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type Tab = 'new-contract' | 'my-contracts' | 'contract-types' | 'pricing' | 'help'
type Step = 1 | 2 | 3 | 4

interface ContractType {
  id: string
  title: string
  description: string
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
}

interface FormData {
  description: string
  party1: string
  party2: string
  value: string
  governingLaw: string
}

// â”€â”€ Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const CONTRACT_TYPES: ContractType[] = [
  { id: 'freelance', title: 'Freelance / Project Agreement', description: 'Scope, deliverables, payment terms and IP ownership.', Icon: Briefcase },
  { id: 'nda-mutual', title: 'NDA (Mutual)', description: 'Both parties protect each other\'s confidential information.', Icon: Users },
  { id: 'nda-one-way', title: 'NDA (One-Way)', description: 'One party discloses; the other agrees to protect it.', Icon: Lock },
  { id: 'retainer', title: 'Retainer Agreement', description: 'Ongoing services with a fixed monthly fee.', Icon: RotateCcw },
  { id: 'subcontractor', title: 'Subcontractor Agreement', description: 'Third-party contractor terms for client work.', Icon: Wrench },
  { id: 'client-service', title: 'Client Service Agreement', description: 'General terms for providing services to clients.', Icon: ClipboardList },
  { id: 'website-tcs', title: 'Website T&Cs', description: 'Terms, privacy policy and acceptable use.', Icon: Globe },
  { id: 'employment-offer', title: 'Employment Offer Letter', description: 'Offer of employment with role, salary and conditions.', Icon: FileText },
]

const SIDEBAR_TABS: { id: Tab; label: string; Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }[] = [
  { id: 'new-contract', label: 'New Contract', Icon: Plus },
  { id: 'my-contracts', label: 'My Contracts', Icon: FileText },
  { id: 'contract-types', label: 'Contract Types', Icon: Grid3X3 },
  { id: 'pricing', label: 'Pricing', Icon: CreditCard },
  { id: 'help', label: 'Help', Icon: HelpCircle },
]

const LOADING_MESSAGES = [
  'Drafting your contract\u2026',
  'Applying UK legal clauses\u2026',
  'Almost ready\u2026',
]

// â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function AppDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('new-contract')
  const [step, setStep] = useState<Step>(1)
  const [selectedType, setSelectedType] = useState<ContractType | null>(null)
  const [formData, setFormData] = useState<FormData>({
    description: '',
    party1: '',
    party2: '',
    value: '',
    governingLaw: 'England & Wales',
  })
  const [loadingMsg, setLoadingMsg] = useState(0)
  const [contractId, setContractId] = useState<string | null>(null)
  const [contractContent, setContractContent] = useState<string | null>(null)
  const [contractTitle, setContractTitle] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Cycle loading messages
  useEffect(() => {
    if (step !== 3) return
    const interval = setInterval(() => {
      setLoadingMsg((v) => (v < LOADING_MESSAGES.length - 1 ? v + 1 : v))
    }, 1800)
    return () => clearInterval(interval)
  }, [step])

  const handleSelectType = (type: ContractType) => {
    setSelectedType(type)
    setStep(2)
  }

  const handleGenerate = async () => {
    if (!selectedType) return
    setError(null)
    setLoadingMsg(0)
    setStep(3)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractType: selectedType.id,
          customDescription: formData.description,
          fields: {
            party1Name: formData.party1,
            party2Name: formData.party2,
            value: formData.value,
            governingLaw: formData.governingLaw,
          },
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Generation failed')
      }
      const data = await res.json()
      setContractId(data.id)
      setContractContent(data.content)
      setContractTitle(data.title)
      setStep(4)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
      setStep(2)
    }
  }

  const handleReset = () => {
    setStep(1)
    setSelectedType(null)
    setFormData({ description: '', party1: '', party2: '', value: '', governingLaw: 'England & Wales' })
    setContractId(null)
    setContractContent(null)
    setContractTitle(null)
    setError(null)
    setLoadingMsg(0)
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#FAFAF8' }}>

      {/* â”€â”€ SIDEBAR â”€â”€ */}
      <aside
        className={cn(
          'flex-shrink-0 flex flex-col border-r h-full transition-all',
          'w-[240px]',
          // Mobile: absolute overlay
          'max-md:fixed max-md:top-0 max-md:left-0 max-md:z-40 max-md:shadow-xl',
          sidebarOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full',
        )}
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
      >
        {/* Logo */}
        <div className="px-4 h-14 flex items-center border-b flex-shrink-0" style={{ borderColor: '#E5E7EB' }}>
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#2D6A4F' }}
            >
              <Leaf className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm" style={{ color: '#1B4332' }}>ClauseKit</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {SIDEBAR_TABS.map((tab) => {
            const Icon = tab.Icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setSidebarOpen(false)
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-left',
                  isActive ? 'rounded-lg mx-2 w-[calc(100%-16px)]' : 'hover:opacity-70',
                )}
                style={
                  isActive
                    ? { backgroundColor: '#D8F3DC', color: '#1B4332' }
                    : { color: '#6B7280' }
                }
              >
                <Icon
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: isActive ? '#2D6A4F' : '#9CA3AF' }}
                />
                {tab.label}
              </button>
            )
          })}
        </nav>

        {/* Upgrade nudge */}
        <div
          className="m-3 p-3 rounded-xl border text-xs"
          style={{ backgroundColor: '#D8F3DC', borderColor: '#52B78833', color: '#1B4332' }}
        >
          <p className="font-semibold mb-0.5">Unlimited access</p>
          <p style={{ color: '#52B788' }}>Â£19/mo â€” all types, unlimited downloads</p>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* â”€â”€ MAIN â”€â”€ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar (mobile) */}
        <div
          className="md:hidden flex items-center gap-3 px-4 h-14 border-b flex-shrink-0"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg"
            aria-label="Open menu"
          >
            <div className="w-5 h-0.5 mb-1" style={{ backgroundColor: '#1B4332' }} />
            <div className="w-5 h-0.5 mb-1" style={{ backgroundColor: '#1B4332' }} />
            <div className="w-5 h-0.5" style={{ backgroundColor: '#1B4332' }} />
          </button>
          <span className="font-semibold text-sm" style={{ color: '#1B4332' }}>
            {SIDEBAR_TABS.find((t) => t.id === activeTab)?.label}
          </span>
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">

            {/* â”€â”€ NEW CONTRACT â”€â”€ */}
            {activeTab === 'new-contract' && (
              <motion.div
                key="new-contract"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                {/* Step 1: Choose type */}
                {step === 1 && (
                  <div>
                    <div className="mb-6">
                      <h1 className="text-xl font-bold mb-1" style={{ color: '#1B4332' }}>
                        What type of contract do you need?
                      </h1>
                      <p className="text-sm" style={{ color: '#6B7280' }}>
                        Choose a contract type to get started.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {CONTRACT_TYPES.map((type) => {
                        const Icon = type.Icon
                        return (
                          <motion.button
                            key={type.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelectType(type)}
                            className="flex flex-col items-start p-4 rounded-xl border text-left transition-all hover:shadow-md hover:border-[#52B788] cursor-pointer"
                            style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
                          >
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                              style={{ backgroundColor: '#D8F3DC' }}
                            >
                              <Icon className="w-4.5 h-4.5" style={{ color: '#2D6A4F' }} />
                            </div>
                            <span className="text-sm font-semibold mb-1 leading-snug" style={{ color: '#1B4332' }}>
                              {type.title}
                            </span>
                            <span className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>
                              {type.description}
                            </span>
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Step 2: Describe */}
                {step === 2 && selectedType && (
                  <div className="max-w-2xl">
                    <button
                      onClick={() => setStep(1)}
                      className="flex items-center gap-1.5 text-sm mb-6 transition-opacity hover:opacity-70"
                      style={{ color: '#6B7280' }}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>

                    <div className="mb-6">
                      <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                        style={{ backgroundColor: '#D8F3DC', color: '#1B4332' }}
                      >
                        <selectedType.Icon className="w-3.5 h-3.5" style={{ color: '#2D6A4F' }} />
                        {selectedType.title}
                      </div>
                      <h1 className="text-xl font-bold mb-1" style={{ color: '#1B4332' }}>
                        Tell us about your contract
                      </h1>
                      <p className="text-sm" style={{ color: '#6B7280' }}>
                        Describe your situation in plain English â€” no legal knowledge needed.
                      </p>
                    </div>

                    {error && (
                      <div
                        className="mb-4 px-4 py-3 rounded-xl text-sm border"
                        style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA', color: '#991B1B' }}
                      >
                        {error}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1A1A' }}>
                          Describe your situation
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                          rows={5}
                          className="w-full rounded-xl border px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2"
                          style={{
                            borderColor: '#E5E7EB',
                            backgroundColor: '#FFFFFF',
                            color: '#1A1A1A',
                          }}
                          placeholder="I am a web designer based in London. My client is a restaurant group. The project is a new website, fixed fee of Â£4,500, 6 weeks timeline. I need protection against scope creep and want IP to transfer only on full payment."
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1A1A' }}>
                            Your name / company
                          </label>
                          <input
                            type="text"
                            value={formData.party1}
                            onChange={(e) => setFormData((f) => ({ ...f, party1: e.target.value }))}
                            className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                            style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
                            placeholder="e.g. Jane Smith / Acme Ltd"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1A1A' }}>
                            Client / other party
                          </label>
                          <input
                            type="text"
                            value={formData.party2}
                            onChange={(e) => setFormData((f) => ({ ...f, party2: e.target.value }))}
                            className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                            style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
                            placeholder="e.g. Restaurant Group Ltd"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1A1A' }}>
                            Value / Amount (optional)
                          </label>
                          <input
                            type="text"
                            value={formData.value}
                            onChange={(e) => setFormData((f) => ({ ...f, value: e.target.value }))}
                            className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                            style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
                            placeholder="e.g. Â£4,500 fixed fee"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1A1A' }}>
                            Governing law
                          </label>
                          <select
                            value={formData.governingLaw}
                            onChange={(e) => setFormData((f) => ({ ...f, governingLaw: e.target.value }))}
                            className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                            style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', color: '#1A1A1A' }}
                          >
                            <option>England &amp; Wales</option>
                            <option>Scotland</option>
                            <option>Northern Ireland</option>
                          </select>
                        </div>
                      </div>

                      <button
                        onClick={handleGenerate}
                        disabled={!formData.description.trim()}
                        className="w-full py-3.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#2D6A4F' }}
                      >
                        Generate Contract
                      </button>

                      <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>
                        Free to generate Â· Pay Â£7 to download
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 3: Loading */}
                {step === 3 && (
                  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                      className="mb-6"
                    >
                      <Loader2 className="w-10 h-10" style={{ color: '#2D6A4F' }} />
                    </motion.div>

                    <AnimatePresence mode="wait">
                      <motion.p
                        key={loadingMsg}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                        className="text-base font-semibold"
                        style={{ color: '#1B4332' }}
                      >
                        {LOADING_MESSAGES[loadingMsg]}
                      </motion.p>
                    </AnimatePresence>

                    <p className="text-sm mt-2" style={{ color: '#6B7280' }}>
                      GPT-4o is generating your bespoke UK contract&hellip;
                    </p>

                    <div className="mt-6 w-64 rounded-full overflow-hidden h-1.5" style={{ backgroundColor: '#E5E7EB' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: '#52B788' }}
                        initial={{ width: '5%' }}
                        animate={{ width: '90%' }}
                        transition={{ duration: 5, ease: 'easeInOut' }}
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: Preview */}
                {step === 4 && contractContent && (
                  <div className="max-w-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h1 className="text-xl font-bold" style={{ color: '#1B4332' }}>
                          {contractTitle ?? 'Your Contract'}
                        </h1>
                        <p className="text-sm" style={{ color: '#6B7280' }}>
                          Generated Â· UK law Â· {selectedType?.title}
                        </p>
                      </div>
                      <button
                        onClick={handleReset}
                        className="text-xs font-medium px-3 py-1.5 rounded-full border transition-opacity hover:opacity-70"
                        style={{ borderColor: '#E5E7EB', color: '#6B7280' }}
                      >
                        Start over
                      </button>
                    </div>

                    {/* Document preview */}
                    <div
                      className="rounded-2xl border overflow-hidden relative"
                      style={{ borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}
                    >
                      {/* Visible portion */}
                      <div className="p-6 pb-0">
                        <pre
                          className="text-xs leading-relaxed font-mono whitespace-pre-wrap"
                          style={{ color: '#1A1A1A' }}
                        >
                          {contractContent.slice(0, 600)}
                        </pre>
                      </div>

                      {/* Blurred remainder */}
                      <div className="relative">
                        <div
                          className="px-6 pt-2 pb-6"
                          style={{ filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none' }}
                        >
                          <pre
                            className="text-xs leading-relaxed font-mono whitespace-pre-wrap"
                            style={{ color: '#1A1A1A' }}
                          >
                            {contractContent.slice(600, 1400)}
                          </pre>
                        </div>

                        {/* Paywall overlay */}
                        <div
                          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
                          style={{
                            background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.85) 25%, rgba(255,255,255,0.97) 60%)',
                          }}
                        >
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                            style={{ backgroundColor: '#D8F3DC' }}
                          >
                            <Eye className="w-5 h-5" style={{ color: '#2D6A4F' }} />
                          </div>
                          <h3 className="text-base font-bold mb-1" style={{ color: '#1B4332' }}>
                            Your contract is ready
                          </h3>
                          <p className="text-sm mb-5 max-w-xs" style={{ color: '#6B7280' }}>
                            Unlock the full contract to download as PDF and Word â€” ready to sign and send.
                          </p>
                          <a
                            href={`/preview/${contractId}`}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90 mb-2"
                            style={{ backgroundColor: '#2D6A4F' }}
                          >
                            <Download className="w-4 h-4" />
                            Â£7 â€” Unlock full contract (PDF + Word)
                          </a>
                          <p className="text-xs" style={{ color: '#9CA3AF' }}>
                            Secure payment via Stripe Â· Instant download
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* View full preview link */}
                    <div className="mt-4 text-center">
                      <a
                        href={`/preview/${contractId}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
                        style={{ color: '#2D6A4F' }}
                      >
                        View full preview page
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* â”€â”€ MY CONTRACTS â”€â”€ */}
            {activeTab === 'my-contracts' && (
              <motion.div
                key="my-contracts"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-xl font-bold mb-6" style={{ color: '#1B4332' }}>My Contracts</h1>
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: '#D8F3DC' }}
                  >
                    <FileText className="w-7 h-7" style={{ color: '#2D6A4F' }} />
                  </div>
                  <h2 className="text-base font-semibold mb-2" style={{ color: '#1B4332' }}>No contracts yet</h2>
                  <p className="text-sm mb-5 max-w-xs" style={{ color: '#6B7280' }}>
                    Contracts you generate will appear here. Start with a new contract.
                  </p>
                  <button
                    onClick={() => setActiveTab('new-contract')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#2D6A4F' }}
                  >
                    <Plus className="w-4 h-4" />
                    New Contract
                  </button>
                </div>
              </motion.div>
            )}

            {/* â”€â”€ CONTRACT TYPES â”€â”€ */}
            {activeTab === 'contract-types' && (
              <motion.div
                key="contract-types"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-xl font-bold mb-2" style={{ color: '#1B4332' }}>Contract Types</h1>
                <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
                  Browse all available contract types. Click any to start generating.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {CONTRACT_TYPES.map((type) => {
                    const Icon = type.Icon
                    return (
                      <button
                        key={type.id}
                        onClick={() => {
                          setActiveTab('new-contract')
                          handleSelectType(type)
                        }}
                        className="flex flex-col items-start p-4 rounded-xl border text-left transition-all hover:shadow-md hover:border-[#52B788]"
                        style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                          style={{ backgroundColor: '#D8F3DC' }}
                        >
                          <Icon className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                        </div>
                        <span className="text-sm font-semibold mb-1 leading-snug" style={{ color: '#1B4332' }}>
                          {type.title}
                        </span>
                        <span className="text-xs leading-relaxed mb-2" style={{ color: '#6B7280' }}>
                          {type.description}
                        </span>
                        <span className="text-xs font-semibold flex items-center gap-1 mt-auto" style={{ color: '#2D6A4F' }}>
                          Generate <ArrowRight className="w-3 h-3" />
                        </span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* â”€â”€ PRICING â”€â”€ */}
            {activeTab === 'pricing' && (
              <motion.div
                key="pricing"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="max-w-xl"
              >
                <h1 className="text-xl font-bold mb-2" style={{ color: '#1B4332' }}>Pricing</h1>
                <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
                  Generate for free. Pay only when you download.
                </p>

                <div className="space-y-4">
                  {/* Pay per doc */}
                  <div
                    className="rounded-2xl border p-6"
                    style={{ backgroundColor: '#FAFAF8', borderColor: '#E5E7EB' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-sm font-semibold" style={{ color: '#6B7280' }}>Pay per document</div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold" style={{ color: '#1B4332' }}>Â£7</span>
                          <span className="text-sm" style={{ color: '#6B7280' }}>per contract</span>
                        </div>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-5">
                      {['Generate any contract type', 'PDF + Word download', 'UK-law compliant'].map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4" style={{ color: '#52B788' }} />
                          <span style={{ color: '#1A1A1A' }}>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setActiveTab('new-contract')}
                      className="w-full py-2.5 rounded-full text-sm font-semibold border transition-opacity hover:opacity-80"
                      style={{ borderColor: '#2D6A4F', color: '#2D6A4F' }}
                    >
                      Start generating
                    </button>
                  </div>

                  {/* Unlimited */}
                  <div
                    className="rounded-2xl border-2 p-6 relative"
                    style={{ backgroundColor: '#FFFFFF', borderColor: '#2D6A4F' }}
                  >
                    <div
                      className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: '#2D6A4F' }}
                    >
                      Best value
                    </div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-sm font-semibold" style={{ color: '#6B7280' }}>Unlimited</div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold" style={{ color: '#1B4332' }}>Â£19</span>
                          <span className="text-sm" style={{ color: '#6B7280' }}>/month</span>
                        </div>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-5">
                      {['All 8 contract types', 'Unlimited PDF + Word downloads', 'UK-law compliant', 'Cancel anytime'].map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4" style={{ color: '#52B788' }} />
                          <span style={{ color: '#1A1A1A' }}>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setActiveTab('new-contract')}
                      className="w-full py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: '#2D6A4F' }}
                    >
                      Get unlimited access
                    </button>
                  </div>

                  <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>
                    A solicitor charges Â£150â€“Â£500 for the same document.
                  </p>
                </div>
              </motion.div>
            )}

            {/* â”€â”€ HELP â”€â”€ */}
            {activeTab === 'help' && (
              <motion.div
                key="help"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="max-w-xl"
              >
                <h1 className="text-xl font-bold mb-2" style={{ color: '#1B4332' }}>Help</h1>
                <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
                  Frequently asked questions about ClauseKit.
                </p>

                <div className="space-y-3">
                  {[
                    {
                      q: 'Are ClauseKit contracts legally binding?',
                      a: 'Yes, contracts generated by ClauseKit are legally binding when properly executed by both parties. They are drafted to comply with UK law. For high-value or complex matters, we recommend review by a qualified solicitor.',
                    },
                    {
                      q: 'What happens after I generate a contract?',
                      a: 'You\'ll see a preview of your contract. To download the full PDF and Word versions, you pay a one-time Â£7 fee via Stripe. Your contract is then available to download instantly.',
                    },
                    {
                      q: 'Can I edit the contract after downloading?',
                      a: 'Yes â€” the Word (.docx) version is fully editable so you can make any adjustments before sending.',
                    },
                    {
                      q: 'Is my data secure?',
                      a: 'We do not store your personal data beyond what\'s needed to generate your contract. Payments are processed securely by Stripe.',
                    },
                    {
                      q: 'What if I need a contract type not listed?',
                      a: 'Use the "Freelance / Project Agreement" or "Client Service Agreement" types â€” they cover most situations. Describe your exact needs in the description field and ClauseKit will tailor the contract accordingly.',
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="rounded-xl border p-4"
                      style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
                    >
                      <h3 className="text-sm font-semibold mb-1.5" style={{ color: '#1B4332' }}>{item.q}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{item.a}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <Link
                    href="/"
                    className="text-sm font-medium transition-opacity hover:opacity-70"
                    style={{ color: '#2D6A4F' }}
                  >
                    â† Back to homepage
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

