'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Plus,
  FileText,
  Home,
  LayoutTemplate,
  CreditCard,
  HelpCircle,
  Briefcase,
  Users,
  Lock,
  RotateCcw,
  Wrench,
  ClipboardList,
  Globe,
  Shield,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Eye,
  Download,
  ExternalLink,
  Search,
  Settings,
  Menu,
  X,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

type Tab = 'home' | 'new-contract' | 'my-contracts' | 'templates' | 'pricing' | 'help'
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

interface SavedContract {
  id: string
  title: string
  typeId: string
  typeName: string
  party1: string
  party2: string
  status: 'generated' | 'downloaded'
  createdAt: string
}

// ── Data ───────────────────────────────────────────────────────────────────────

const CONTRACT_TYPES: ContractType[] = [
  { id: 'freelance', title: 'Freelance / Project Agreement', description: 'Scope, deliverables, payment terms and IP ownership.', Icon: Briefcase },
  { id: 'nda-mutual', title: 'NDA (Mutual)', description: 'Both parties protect each other\'s confidential information.', Icon: Users },
  { id: 'nda-one-way', title: 'NDA (One-Way)', description: 'One party discloses; the other agrees to protect it.', Icon: Lock },
  { id: 'retainer', title: 'Retainer Agreement', description: 'Ongoing services with a fixed monthly fee.', Icon: RotateCcw },
  { id: 'subcontractor', title: 'Subcontractor Agreement', description: 'Third-party contractor terms for client work.', Icon: Wrench },
  { id: 'client-service', title: 'Client Service Agreement', description: 'General terms for providing services to clients.', Icon: ClipboardList },
  { id: 'website-tcs', title: 'Website T&Cs', description: 'Terms, privacy policy and acceptable use for websites.', Icon: Globe },
  { id: 'employment-offer', title: 'Employment Offer Letter', description: 'Offer of employment with role, salary and conditions.', Icon: Shield },
]

const SIDEBAR_NAV: { id: Tab; label: string; Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }[] = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'new-contract', label: 'New Contract', Icon: Plus },
  { id: 'my-contracts', label: 'My Contracts', Icon: FileText },
  { id: 'templates', label: 'Templates', Icon: LayoutTemplate },
  { id: 'pricing', label: 'Pricing', Icon: CreditCard },
  { id: 'help', label: 'Help', Icon: HelpCircle },
]

const LOADING_MESSAGES = [
  'Drafting your contract\u2026',
  'Applying UK legal clauses\u2026',
  'Checking compliance\u2026',
  'Almost ready\u2026',
]

const LS_KEY = 'clausekit_contracts'

function loadSavedContracts(): SavedContract[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveSavedContracts(contracts: SavedContract[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(LS_KEY, JSON.stringify(contracts))
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AppDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('home')
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
  const [savedContracts, setSavedContracts] = useState<SavedContract[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setSavedContracts(loadSavedContracts())
  }, [])

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
    setActiveTab('new-contract')
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

      // Persist to localStorage
      const newContract: SavedContract = {
        id: data.id,
        title: data.title ?? selectedType.title,
        typeId: selectedType.id,
        typeName: selectedType.title,
        party1: formData.party1,
        party2: formData.party2,
        status: 'generated',
        createdAt: new Date().toISOString(),
      }
      const updated = [newContract, ...loadSavedContracts()]
      saveSavedContracts(updated)
      setSavedContracts(updated)
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

  const navigate = (tab: Tab) => {
    setActiveTab(tab)
    setSidebarOpen(false)
    if (tab === 'new-contract') handleReset()
  }

  // Stats for home tab
  const stats = {
    total: savedContracts.length,
    generated: savedContracts.filter((c) => c.status === 'generated').length,
    downloaded: savedContracts.filter((c) => c.status === 'downloaded').length,
  }

  const filteredContracts = savedContracts.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.typeName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-screen overflow-hidden bg-white">

      {/* ── SIDEBAR ── */}
      <aside
        className={cn(
          'flex-shrink-0 flex flex-col border-r h-full z-40',
          'w-[220px]',
          'max-md:fixed max-md:top-0 max-md:left-0 max-md:shadow-xl',
          sidebarOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full',
          'transition-transform duration-200',
        )}
        style={{ backgroundColor: '#F9F9F7', borderColor: '#E5E5E2' }}
      >
        {/* Logo */}
        <div className="px-5 h-12 flex items-center border-b flex-shrink-0" style={{ borderColor: '#E5E5E2' }}>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center" style={{ backgroundColor: '#2D6A4F' }}>
              <FileText className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight" style={{ color: '#1B4332' }}>ClauseKit</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {SIDEBAR_NAV.map((item) => {
            const Icon = item.Icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors text-left',
                  isActive ? 'border-l-2' : 'hover:bg-white border-l-2 border-l-transparent',
                )}
                style={
                  isActive
                    ? { backgroundColor: '#EDFAF2', color: '#1B4332', borderLeftColor: '#2D6A4F' }
                    : { color: '#6B7280' }
                }
              >
                <Icon
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: isActive ? '#2D6A4F' : '#9CA3AF' }}
                />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t py-2 flex-shrink-0" style={{ borderColor: '#E5E5E2' }}>
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors text-left hover:bg-white"
            style={{ color: '#6B7280' }}
          >
            <Settings className="w-4 h-4" style={{ color: '#9CA3AF' }} />
            Back to site
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/20" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <div
          className="flex items-center gap-3 px-4 h-12 border-b flex-shrink-0"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E2' }}
        >
          <button
            className="md:hidden p-1 text-gray-500"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Search */}
          <div className="flex-1 flex items-center gap-2 border px-3 py-1.5 max-w-lg" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
            <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#9CA3AF' }} />
            <input
              type="text"
              placeholder="Search contracts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-sm bg-transparent outline-none w-full placeholder-gray-400"
              style={{ color: '#1A1A1A' }}
            />
          </div>

          {/* Avatar */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => navigate('new-contract')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#2D6A4F' }}
            >
              <Plus className="w-3.5 h-3.5" />
              New Contract
            </button>
            <div
              className="w-7 h-7 flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: '#2D6A4F' }}
            >
              JW
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: '#FFFFFF' }}>
          <AnimatePresence mode="wait">

            {/* ── HOME ── */}
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h1 className="font-display text-2xl font-bold" style={{ color: '#1B4332' }}>
                    Welcome back, Jack
                  </h1>
                  <button
                    onClick={() => navigate('new-contract')}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#2D6A4F' }}
                  >
                    <Plus className="w-4 h-4" />
                    New Contract
                  </button>
                </div>

                {/* Stats strip */}
                <div className="grid grid-cols-3 gap-4 mb-8 border" style={{ borderColor: '#E5E5E2' }}>
                  {[
                    { label: 'Your contracts', value: stats.total },
                    { label: 'Generated', value: stats.generated },
                    { label: 'Downloaded', value: stats.downloaded },
                  ].map((s, i) => (
                    <div key={i} className="p-4 border-r last:border-r-0" style={{ borderColor: '#E5E5E2' }}>
                      <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>{s.label}</p>
                      <p className="text-xl font-bold" style={{ color: '#1B4332' }}>{s.value} {s.value === 1 ? 'doc' : 'docs'}</p>
                    </div>
                  ))}
                </div>

                {/* Recent or empty */}
                {savedContracts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center border" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
                    <div className="w-16 h-16 flex items-center justify-center mb-5" style={{ backgroundColor: '#D8F3DC' }}>
                      <FileText className="w-8 h-8" style={{ color: '#2D6A4F' }} />
                    </div>
                    <h2 className="font-display text-lg font-bold mb-2" style={{ color: '#1B4332' }}>
                      Start here — generate your first contract
                    </h2>
                    <p className="text-sm mb-6 max-w-xs" style={{ color: '#6B7280' }}>
                      Answer a few plain-English questions and get a UK-compliant contract in minutes.
                    </p>
                    <button
                      onClick={() => navigate('new-contract')}
                      className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: '#2D6A4F' }}
                    >
                      <Plus className="w-4 h-4" />
                      Create contract
                    </button>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-sm font-semibold mb-3" style={{ color: '#6B7280' }}>Recent contracts</h2>
                    <div className="border" style={{ borderColor: '#E5E5E2' }}>
                      {savedContracts.slice(0, 5).map((c, i) => (
                        <div
                          key={c.id}
                          className={cn('flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors', i !== 0 && 'border-t')}
                          style={{ borderColor: '#E5E5E2' }}
                        >
                          <FileText className="w-4 h-4 flex-shrink-0" style={{ color: '#9CA3AF' }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: '#1B4332' }}>{c.title}</p>
                            <p className="text-xs" style={{ color: '#9CA3AF' }}>{c.party1}{c.party2 ? ` · ${c.party2}` : ''}</p>
                          </div>
                          <span
                            className="text-xs font-semibold px-2 py-0.5 uppercase tracking-wide"
                            style={
                              c.status === 'downloaded'
                                ? { backgroundColor: '#D8F3DC', color: '#1B4332' }
                                : { backgroundColor: '#FEF3C7', color: '#92400E' }
                            }
                          >
                            {c.status}
                          </span>
                          <span className="text-xs flex-shrink-0" style={{ color: '#9CA3AF' }}>{formatDate(c.createdAt)}</span>
                        </div>
                      ))}
                    </div>
                    {savedContracts.length > 5 && (
                      <button
                        onClick={() => navigate('my-contracts')}
                        className="mt-3 text-sm font-medium transition-opacity hover:opacity-70"
                        style={{ color: '#2D6A4F' }}
                      >
                        View all {savedContracts.length} contracts →
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── NEW CONTRACT ── */}
            {activeTab === 'new-contract' && (
              <motion.div
                key="new-contract"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="p-8"
              >

                {/* Step 1: Choose type */}
                {step === 1 && (
                  <div>
                    <h1 className="font-display text-2xl font-bold mb-1" style={{ color: '#1B4332' }}>
                      New contract
                    </h1>
                    <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
                      Choose a contract type to get started.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {CONTRACT_TYPES.map((type) => {
                        const Icon = type.Icon
                        return (
                          <button
                            key={type.id}
                            onClick={() => handleSelectType(type)}
                            className="flex flex-col items-start p-4 border text-left transition-all hover:border-[#2D6A4F] hover:bg-[#FAFAF8] group"
                            style={{ borderColor: '#E5E5E2', backgroundColor: '#FFFFFF' }}
                          >
                            <div
                              className="w-9 h-9 flex items-center justify-center mb-3"
                              style={{ backgroundColor: '#D8F3DC' }}
                            >
                              <Icon className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                            </div>
                            <span className="text-sm font-semibold mb-1 leading-snug" style={{ color: '#1B4332' }}>
                              {type.title}
                            </span>
                            <span className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>
                              {type.description}
                            </span>
                          </button>
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
                        className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold mb-3"
                        style={{ backgroundColor: '#D8F3DC', color: '#1B4332' }}
                      >
                        <selectedType.Icon className="w-3.5 h-3.5" style={{ color: '#2D6A4F' }} />
                        {selectedType.title}
                      </div>
                      <h1 className="font-display text-2xl font-bold mb-1" style={{ color: '#1B4332' }}>
                        Tell us about your contract
                      </h1>
                      <p className="text-sm" style={{ color: '#6B7280' }}>
                        Describe your situation in plain English — no legal knowledge needed.
                      </p>
                    </div>

                    {error && (
                      <div
                        className="mb-4 px-4 py-3 text-sm border"
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
                          className="w-full border px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                          style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8', color: '#1A1A1A' }}
                          placeholder="I am a web designer based in London. My client is a restaurant group. The project is a new website, fixed fee of £4,500, 6 weeks timeline. I need protection against scope creep and want IP to transfer only on full payment."
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
                            className="w-full border px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                            style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8', color: '#1A1A1A' }}
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
                            className="w-full border px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                            style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8', color: '#1A1A1A' }}
                            placeholder="e.g. Restaurant Group Ltd"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1A1A' }}>
                            Contract value (optional)
                          </label>
                          <input
                            type="text"
                            value={formData.value}
                            onChange={(e) => setFormData((f) => ({ ...f, value: e.target.value }))}
                            className="w-full border px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                            style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8', color: '#1A1A1A' }}
                            placeholder="e.g. £4,500 fixed fee"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1A1A' }}>
                            Governing law
                          </label>
                          <select
                            value={formData.governingLaw}
                            onChange={(e) => setFormData((f) => ({ ...f, governingLaw: e.target.value }))}
                            className="w-full border px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                            style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8', color: '#1A1A1A' }}
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
                        className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#2D6A4F' }}
                      >
                        Generate Contract
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>
                        Free to generate · Pay £7 to download
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
                      <Loader2 className="w-8 h-8" style={{ color: '#2D6A4F' }} />
                    </motion.div>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={loadingMsg}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.25 }}
                        className="font-display text-lg font-bold mb-2"
                        style={{ color: '#1B4332' }}
                      >
                        {LOADING_MESSAGES[loadingMsg]}
                      </motion.p>
                    </AnimatePresence>
                    <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
                      GPT-4o is generating your bespoke UK contract&hellip;
                    </p>
                    <div className="w-56 overflow-hidden h-1" style={{ backgroundColor: '#E5E5E2' }}>
                      <motion.div
                        className="h-full"
                        style={{ backgroundColor: '#2D6A4F' }}
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
                        <h1 className="font-display text-2xl font-bold" style={{ color: '#1B4332' }}>
                          {contractTitle ?? 'Your Contract'}
                        </h1>
                        <p className="text-sm" style={{ color: '#6B7280' }}>
                          Generated · UK law · {selectedType?.title}
                        </p>
                      </div>
                      <button
                        onClick={handleReset}
                        className="text-xs font-medium px-3 py-1.5 border transition-opacity hover:opacity-70"
                        style={{ borderColor: '#E5E5E2', color: '#6B7280' }}
                      >
                        Start over
                      </button>
                    </div>

                    {/* Preview */}
                    <div
                      className="border overflow-hidden relative"
                      style={{ borderColor: '#E5E5E2', backgroundColor: '#FFFFFF' }}
                    >
                      <div className="p-6 pb-0">
                        <pre
                          className="text-xs leading-relaxed font-mono whitespace-pre-wrap"
                          style={{ color: '#1A1A1A' }}
                        >
                          {contractContent.slice(0, 600)}
                        </pre>
                      </div>

                      <div className="relative">
                        <div
                          className="px-6 pt-2 pb-6"
                          style={{ filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none' }}
                        >
                          <pre className="text-xs leading-relaxed font-mono whitespace-pre-wrap" style={{ color: '#1A1A1A' }}>
                            {contractContent.slice(600, 1400)}
                          </pre>
                        </div>

                        <div
                          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
                          style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.85) 25%, rgba(255,255,255,0.97) 60%)' }}
                        >
                          <div className="w-10 h-10 flex items-center justify-center mb-3" style={{ backgroundColor: '#D8F3DC' }}>
                            <Eye className="w-5 h-5" style={{ color: '#2D6A4F' }} />
                          </div>
                          <h3 className="font-display text-base font-bold mb-1" style={{ color: '#1B4332' }}>
                            Your contract is ready
                          </h3>
                          <p className="text-sm mb-5 max-w-xs" style={{ color: '#6B7280' }}>
                            Unlock the full contract — download as PDF and Word, ready to sign.
                          </p>
                          <a
                            href={`/preview/${contractId}`}
                            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 mb-2"
                            style={{ backgroundColor: '#2D6A4F' }}
                          >
                            <Download className="w-4 h-4" />
                            £7 — Unlock full contract (PDF + Word)
                          </a>
                          <p className="text-xs" style={{ color: '#9CA3AF' }}>Secure payment via Stripe · Instant download</p>
                        </div>
                      </div>
                    </div>

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

            {/* ── MY CONTRACTS ── */}
            {activeTab === 'my-contracts' && (
              <motion.div
                key="my-contracts"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h1 className="font-display text-2xl font-bold" style={{ color: '#1B4332' }}>My Contracts</h1>
                  <button
                    onClick={() => navigate('new-contract')}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#2D6A4F' }}
                  >
                    <Plus className="w-4 h-4" />
                    New Contract
                  </button>
                </div>

                {filteredContracts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center border" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
                    <div className="w-14 h-14 flex items-center justify-center mb-4" style={{ backgroundColor: '#D8F3DC' }}>
                      <FileText className="w-7 h-7" style={{ color: '#2D6A4F' }} />
                    </div>
                    <h2 className="font-display text-lg font-bold mb-2" style={{ color: '#1B4332' }}>
                      {searchQuery ? 'No contracts match your search' : 'No contracts yet'}
                    </h2>
                    <p className="text-sm mb-5 max-w-xs" style={{ color: '#6B7280' }}>
                      {searchQuery ? 'Try a different search term.' : 'Contracts you generate will appear here.'}
                    </p>
                    {!searchQuery && (
                      <button
                        onClick={() => navigate('new-contract')}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: '#2D6A4F' }}
                      >
                        <Plus className="w-4 h-4" />
                        Create your first contract
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="border" style={{ borderColor: '#E5E5E2' }}>
                    {/* Table header */}
                    <div className="flex items-center gap-4 px-4 py-2.5 border-b text-xs font-semibold uppercase tracking-wide" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8', color: '#9CA3AF' }}>
                      <div className="flex-1">Name</div>
                      <div className="w-28 text-center">Status</div>
                      <div className="w-28 text-right">Created</div>
                    </div>
                    {filteredContracts.map((c, i) => (
                      <div
                        key={c.id}
                        className={cn('flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 transition-colors group', i !== 0 && 'border-t')}
                        style={{ borderColor: '#E5E5E2' }}
                      >
                        <FileText className="w-4 h-4 flex-shrink-0" style={{ color: '#9CA3AF' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate mb-0.5" style={{ color: '#1B4332' }}>{c.title}</p>
                          <p className="text-xs truncate" style={{ color: '#9CA3AF' }}>
                            {c.typeName}{c.party1 ? ` · ${c.party1}` : ''}{c.party2 ? `, ${c.party2}` : ''}
                          </p>
                        </div>
                        <div className="w-28 text-center">
                          <span
                            className="text-xs font-bold px-2 py-0.5 uppercase tracking-wide"
                            style={
                              c.status === 'downloaded'
                                ? { backgroundColor: '#D8F3DC', color: '#1B4332' }
                                : { backgroundColor: '#FEF3C7', color: '#92400E' }
                            }
                          >
                            {c.status}
                          </span>
                        </div>
                        <div className="w-28 text-right text-xs flex-shrink-0" style={{ color: '#9CA3AF' }}>
                          {formatDate(c.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── TEMPLATES ── */}
            {activeTab === 'templates' && (
              <motion.div
                key="templates"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="p-8"
              >
                <div className="flex items-center justify-between mb-2">
                  <h1 className="font-display text-2xl font-bold" style={{ color: '#1B4332' }}>Contract templates</h1>
                </div>
                <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
                  8 UK-compliant contract templates. Click any to generate instantly.
                </p>

                {/* Table */}
                <div className="border" style={{ borderColor: '#E5E5E2' }}>
                  <div className="flex items-center gap-4 px-4 py-2.5 border-b text-xs font-semibold uppercase tracking-wide" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8', color: '#9CA3AF' }}>
                    <div className="flex-1">Template name</div>
                    <div className="w-48 hidden md:block">Description</div>
                    <div className="w-24 text-right">Action</div>
                  </div>
                  {CONTRACT_TYPES.map((type, i) => {
                    const Icon = type.Icon
                    return (
                      <div
                        key={type.id}
                        className={cn('flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 transition-colors group', i !== 0 && 'border-t')}
                        style={{ borderColor: '#E5E5E2' }}
                      >
                        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#D8F3DC' }}>
                          <Icon className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium" style={{ color: '#1B4332' }}>{type.title}</p>
                        </div>
                        <div className="w-48 hidden md:block">
                          <p className="text-xs truncate" style={{ color: '#6B7280' }}>{type.description}</p>
                        </div>
                        <div className="w-24 text-right">
                          <button
                            onClick={() => handleSelectType(type)}
                            className="text-xs font-semibold flex items-center gap-1 ml-auto transition-opacity hover:opacity-70"
                            style={{ color: '#2D6A4F' }}
                          >
                            Generate
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* ── PRICING ── */}
            {activeTab === 'pricing' && (
              <motion.div
                key="pricing"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="p-8 max-w-2xl"
              >
                <h1 className="font-display text-2xl font-bold mb-1" style={{ color: '#1B4332' }}>Pricing</h1>
                <p className="text-sm mb-6" style={{ color: '#6B7280' }}>Generate for free. Pay only when you download.</p>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Pay per doc */}
                  <div className="border p-6" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>Pay as you go</p>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="font-display text-4xl font-bold" style={{ color: '#1B4332' }}>£7</span>
                      <span className="text-sm" style={{ color: '#6B7280' }}>/ contract</span>
                    </div>
                    <p className="text-sm mb-5" style={{ color: '#6B7280' }}>Generate and download one contract at a time.</p>
                    <ul className="space-y-2 mb-5">
                      {['Full UK-compliant contract', 'PDF + Word download', 'Tailored to your answers', 'No subscription'].map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4" style={{ color: '#52B788' }} />
                          <span style={{ color: '#1A1A1A' }}>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => navigate('new-contract')}
                      className="w-full py-2.5 text-sm font-semibold border transition-opacity hover:opacity-80"
                      style={{ borderColor: '#2D6A4F', color: '#2D6A4F', backgroundColor: 'transparent' }}
                    >
                      Start generating
                    </button>
                  </div>

                  {/* Unlimited */}
                  <div className="border-2 p-6 relative" style={{ borderColor: '#2D6A4F', backgroundColor: '#FFFFFF' }}>
                    <div
                      className="absolute -top-3 left-5 px-2.5 py-0.5 text-xs font-bold text-white"
                      style={{ backgroundColor: '#2D6A4F' }}
                    >
                      Best value
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>Unlimited</p>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="font-display text-4xl font-bold" style={{ color: '#1B4332' }}>£19</span>
                      <span className="text-sm" style={{ color: '#6B7280' }}>/month</span>
                    </div>
                    <p className="text-sm mb-5" style={{ color: '#6B7280' }}>Unlimited contracts for busy freelancers and teams.</p>
                    <ul className="space-y-2 mb-5">
                      {['All 8 contract types', 'Unlimited downloads', 'PDF + Word', 'Cancel any time'].map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4" style={{ color: '#52B788' }} />
                          <span style={{ color: '#1A1A1A' }}>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      className="w-full py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: '#2D6A4F' }}
                    >
                      Get unlimited access
                    </button>
                  </div>
                </div>
                <p className="text-xs mt-4" style={{ color: '#9CA3AF' }}>
                  A solicitor charges £150–£500 for the same document. · Secure payments via Stripe.
                </p>
              </motion.div>
            )}

            {/* ── HELP ── */}
            {activeTab === 'help' && (
              <motion.div
                key="help"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="p-8 max-w-2xl"
              >
                <h1 className="font-display text-2xl font-bold mb-1" style={{ color: '#1B4332' }}>Help</h1>
                <p className="text-sm mb-6" style={{ color: '#6B7280' }}>Frequently asked questions about ClauseKit.</p>

                <div className="space-y-3">
                  {[
                    {
                      q: 'Are ClauseKit contracts legally binding?',
                      a: 'Yes. Contracts generated by ClauseKit are legally binding when properly executed by both parties. They are drafted to comply with UK law. For high-value or complex matters, we recommend review by a qualified solicitor.',
                    },
                    {
                      q: 'What happens after I generate a contract?',
                      a: 'You\'ll see a preview of your contract immediately. To download the full PDF and Word versions, you pay a one-time £7 fee via Stripe. Your contract is available for instant download.',
                    },
                    {
                      q: 'Can I edit the contract after downloading?',
                      a: 'Yes — the Word (.docx) version is fully editable. Make any adjustments before sending to the other party.',
                    },
                    {
                      q: 'Is my data secure?',
                      a: 'We do not store your personal data beyond what\'s needed to generate your contract. Payments are processed securely by Stripe. We never share your data with third parties.',
                    },
                    {
                      q: 'What if I need a contract type not listed?',
                      a: 'Use the "Client Service Agreement" or "Freelance / Project Agreement" types — they cover most situations. Describe your exact needs in the description field and ClauseKit will tailor accordingly.',
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="border p-4"
                      style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E2' }}
                    >
                      <h3 className="text-sm font-semibold mb-1.5" style={{ color: '#1B4332' }}>{item.q}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{item.a}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
