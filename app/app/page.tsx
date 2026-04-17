'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import SignatureCanvas from 'react-signature-canvas'
import { cn } from '@/lib/utils'
import IntakeWizard, { type IntakeData } from './IntakeWizard'
import { SignatureBlock, type SignatureState } from '@/components/contract/SignatureBlock'
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
  Check,
  Loader2,
  Eye,
  Download,
  ExternalLink,
  Search,
  Pen,
  Menu,
  X,
  ChevronDown,
  Zap,
  Star,
  MoreHorizontal,
  Bookmark,
  Trash2,
  Bell,
  Activity,
  Sparkles,
  BookOpen,
  AlertTriangle,
  Calendar,
  PoundSterling,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

type Tab = 'home' | 'new-contract' | 'my-contracts' | 'templates' | 'pricing' | 'help' | 'contract-view' | 'subscription' | 'notifications'
// Step 1 = choose type, 2 = intake wizard, 3 = loading, 4 = preview
type Step = 1 | 2 | 3 | 4

interface ContractType {
  id: string
  title: string
  description: string
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
}

type ContractStatus = 'draft' | 'sent' | 'completed' | 'expired'

interface Notification {
  id: string
  type: 'contract_signed' | 'contract_sent' | 'info'
  title: string
  message: string
  contractId?: string
  createdAt: string
  read: boolean
}

interface DocStyle {
  font: string
  bodySize: number
  headingSize: number
  bodyColor: string
  headingColor: string
  bodyWeight: 400 | 500 | 600
  headingWeight: 600 | 700 | 800
}

interface SavedContract {
  id: string
  title: string
  typeId: string
  typeName: string
  party1: string
  party2: string
  party1Email: string
  party2Email: string
  status: ContractStatus
  createdAt: string
  sentAt?: string
  completedAt?: string
  content?: string
  intakeData?: Record<string, string | string[]>
  isTemplate?: boolean
  docStyle?: DocStyle
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
  { id: 'subscription', label: 'My Plan', Icon: Star },
  { id: 'notifications', label: 'Notifications', Icon: Bell },
  { id: 'help', label: 'Help', Icon: HelpCircle },
]

const LOADING_MESSAGES = [
  'Drafting your contract\u2026',
  'Applying UK legal clauses\u2026',
  'Checking IR35 compliance\u2026',
  'Finalising your document\u2026',
]

const LS_KEY = 'clausekit_contracts'
const LS_NOTIF_KEY = 'clausekit_notifications'

function loadSaved(): SavedContract[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') } catch { return [] }
}
function persistSaved(c: SavedContract[]) {
  if (typeof window !== 'undefined') localStorage.setItem(LS_KEY, JSON.stringify(c))
}

function loadNotifications(): Notification[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(LS_NOTIF_KEY) ?? '[]') } catch { return [] }
}
function persistNotifications(n: Notification[]) {
  if (typeof window !== 'undefined') localStorage.setItem(LS_NOTIF_KEY, JSON.stringify(n))
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── FAQ data ───────────────────────────────────────────────────────────────────

const FAQS = [
  { q: 'Are ClauseKit contracts legally binding?', a: 'Yes. Contracts generated by ClauseKit are legally binding when properly executed by both parties. They are drafted to comply with UK law. For high-value or complex matters, we recommend review by a qualified solicitor.' },
  { q: 'What happens after I generate a contract?', a: 'You\u2019ll see a preview of your contract immediately. To download the full PDF and Word versions, you pay a one-time \u00A37 fee via Stripe. Your contract is available for instant download.' },
  { q: 'Can I edit the contract after downloading?', a: 'Yes \u2014 the Word (.docx) version is fully editable. Make any adjustments before sending to the other party.' },
  { q: 'Is my data secure?', a: 'We don\u2019t store your contract content after generation. Payments are processed securely by Stripe. We never share your data with third parties.' },
  { q: 'What if I need a contract type that isn\u2019t listed?', a: 'Use the \u201cClient Service Agreement\u201d or \u201cFreelance / Project Agreement\u201d types \u2014 they cover most situations. Describe your exact needs in the description field and ClauseKit will tailor accordingly.' },
]

// ── Sub-components ─────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b last:border-b-0" style={{ borderColor: '#E5E5E2' }}>
      <button className="w-full flex items-center justify-between py-4 text-left" onClick={() => setOpen(!open)}>
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
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm leading-relaxed" style={{ color: '#6B7280' }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Checkout helper ────────────────────────────────────────────────────────────

async function initiateCheckout(contractId: string): Promise<void> {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contractId }),
  })
  const data = await res.json()
  if (data.url) {
    window.location.href = data.url
  } else {
    throw new Error(data.error ?? 'Checkout failed')
  }
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ContractStatus }) {
  const map: Record<ContractStatus, { bg: string; color: string; label: string }> = {
    draft:     { bg: '#FEF3C7', color: '#92400E', label: 'Draft' },
    sent:      { bg: '#DBEAFE', color: '#1E40AF', label: 'Sent' },
    completed: { bg: '#D8F3DC', color: '#1B4332', label: 'Completed' },
    expired:   { bg: '#FEE2E2', color: '#991B1B', label: 'Expired' },
  }
  const s = map[status] ?? map.draft
  return <span className="text-xs font-bold px-2 py-0.5 uppercase tracking-wide" style={{ backgroundColor: s.bg, color: s.color }}>{s.label}</span>
}

// ── My Contracts Tab ──────────────────────────────────────────────────────────

type ContractsTabFilter = 'all' | ContractStatus

// ── Contract row 3-dot menu ───────────────────────────────────────────────────

function ContractRowMenu({ contract, onDelete, onSaveTemplate }: {
  contract: SavedContract
  onDelete: (id: string) => void
  onSaveTemplate: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o) }}
        className="w-7 h-7 flex items-center justify-center hover:bg-[#F3F4F6] transition-colors"
        style={{ color: '#9CA3AF' }}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <div
          className="absolute right-0 top-8 z-50 w-44 border shadow-lg py-1"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E2' }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onSaveTemplate(contract.id); setOpen(false) }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium hover:bg-[#FAFAF8] text-left"
            style={{ color: '#374151' }}
          >
            <Bookmark className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#2D6A4F' }} />
            {contract.isTemplate ? 'Remove template' : 'Save as template'}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(contract.id); setOpen(false) }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium hover:bg-[#FEF2F2] text-left"
            style={{ color: '#EF4444' }}
          >
            <Trash2 className="w-3.5 h-3.5 flex-shrink-0" />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

function MyContractsTab({ savedContracts, searchQuery, onNew, onCheckout, onView, onDelete, onSaveTemplate }: {
  savedContracts: SavedContract[]; searchQuery: string; onNew: () => void; onCheckout: (id: string) => void; onView: (id: string) => void; onDelete: (id: string) => void; onSaveTemplate: (id: string) => void
}) {
  const [af, setAf] = useState<ContractsTabFilter>('all')
  const counts: Record<ContractsTabFilter, number> = {
    all: savedContracts.length,
    draft: savedContracts.filter((c) => c.status === 'draft').length,
    sent: savedContracts.filter((c) => c.status === 'sent').length,
    completed: savedContracts.filter((c) => c.status === 'completed').length,
    expired: savedContracts.filter((c) => c.status === 'expired').length,
  }
  const list = savedContracts.filter((c) => {
    const mf = af === 'all' || c.status === af
    const ms = !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.typeName.toLowerCase().includes(searchQuery.toLowerCase())
    return mf && ms
  })
  const tabs: { key: ContractsTabFilter; label: string }[] = [
    { key: 'all', label: 'All' }, { key: 'draft', label: 'Draft' }, { key: 'sent', label: 'Sent' }, { key: 'completed', label: 'Completed' }, { key: 'expired', label: 'Expired' },
  ]
  return (
    <motion.div key="my-contracts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display text-2xl font-bold" style={{ color: '#1B4332' }}>My Contracts</h1>
        <button onClick={onNew} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white hover:opacity-90" style={{ backgroundColor: '#2D6A4F' }}>
          <Plus className="w-4 h-4" /> New Contract
        </button>
      </div>
      <div className="flex border-b mb-5" style={{ borderColor: '#E5E5E2' }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setAf(t.key)} className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px" style={af === t.key ? { borderBottomColor: '#2D6A4F', color: '#1B4332' } : { borderBottomColor: 'transparent', color: '#9CA3AF' }}>
            {t.label}
            {counts[t.key] > 0 && <span className="px-1.5 py-0.5 text-xs font-bold" style={af === t.key ? { backgroundColor: '#D8F3DC', color: '#1B4332' } : { backgroundColor: '#F3F4F6', color: '#9CA3AF' }}>{counts[t.key]}</span>}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
          <div className="w-12 h-12 flex items-center justify-center mb-4" style={{ backgroundColor: '#D8F3DC' }}><FileText className="w-6 h-6" style={{ color: '#2D6A4F' }} /></div>
          <h2 className="font-display text-base font-bold mb-2" style={{ color: '#1B4332' }}>{searchQuery ? 'No contracts match your search' : af === 'all' ? 'No contracts yet' : `No ${af} contracts`}</h2>
          {!searchQuery && af === 'all' && <button onClick={onNew} className="mt-3 flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: '#2D6A4F' }}><Plus className="w-4 h-4" /> Create contract</button>}
        </div>
      ) : (
        <div className="border" style={{ borderColor: '#E5E5E2' }}>
          <div className="flex items-center gap-4 px-4 py-2.5 border-b text-xs font-bold uppercase tracking-widest" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8', color: '#9CA3AF' }}>
            <div className="flex-1">Contract</div><div className="w-24 hidden sm:block text-center">Status</div><div className="w-32 hidden md:block text-right">Date</div><div className="w-28 text-right">Action</div>
          </div>
          {list.map((c, i) => (
            <div key={c.id} className={cn('flex items-center gap-4 px-4 py-3.5 hover:bg-[#FAFAF8] transition-colors', i !== 0 && 'border-t')} style={{ borderColor: '#E5E5E2' }}>
              <button onClick={() => onView(c.id)} className="flex items-center gap-4 flex-1 min-w-0 text-left">
              <FileText className="w-4 h-4 flex-shrink-0" style={{ color: '#9CA3AF' }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate mb-0.5" style={{ color: '#1B4332' }}>{c.title}</p>
                <p className="text-xs truncate" style={{ color: '#9CA3AF' }}>{c.typeName}{c.party2 ? ` · ${c.party2}` : ''}</p>
              </div>
              </button>
              <div className="w-24 hidden sm:flex justify-center flex-shrink-0"><StatusBadge status={c.status} /></div>
              <div className="w-32 hidden md:block text-right text-xs flex-shrink-0" style={{ color: '#9CA3AF' }}>{c.completedAt ? fmtDate(c.completedAt) : c.sentAt ? fmtDate(c.sentAt) : fmtDate(c.createdAt)}</div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <div className="w-24 flex justify-end">
                  {c.status === 'draft' && <button onClick={() => onCheckout(c.id)} className="text-xs font-semibold flex items-center gap-1 hover:opacity-70" style={{ color: '#2D6A4F' }}><Download className="w-3 h-3" /> Unlock</button>}
                  {c.status === 'sent' && <span className="text-xs font-semibold flex items-center gap-1" style={{ color: '#1E40AF' }}><Eye className="w-3 h-3" /> Awaiting</span>}
                  {c.status === 'completed' && <a href={`/download/${c.id}`} className="text-xs font-semibold flex items-center gap-1 hover:opacity-70" style={{ color: '#2D6A4F' }}><Download className="w-3 h-3" /> Download</a>}
                  {c.status === 'expired' && <button onClick={onNew} className="text-xs font-semibold flex items-center gap-1 hover:opacity-70" style={{ color: '#9CA3AF' }}><Plus className="w-3 h-3" /> Redo</button>}
                </div>
                <ContractRowMenu contract={c} onDelete={onDelete} onSaveTemplate={onSaveTemplate} />
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ── Contract Viewer ────────────────────────────────────────────────────────────

// ── Formatted body renderer — handles bullets, bold, tables, sub-headings ─────

function renderInlineFormatting(text: string): React.ReactNode[] {
  // Parse **bold** markers
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: '#1B4332' }}>{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

function FormattedBody({ text, onUpdate, bodySize = 14, bodyColor = '#374151', bodyWeight = 400, editable = true }: {
  text: string
  onUpdate?: (t: string) => void
  bodySize?: number
  bodyColor?: string
  bodyWeight?: 400 | 500 | 600
  editable?: boolean
}) {
  const lines = text.split('\n')

  // Detect if this is a table block (contains | separators)
  const tableLines = lines.filter((l) => l.includes('|') && l.trim().length > 3 && !/^\|?[\s\-|]+\|?$/.test(l.trim()))
  const isTable = tableLines.length >= 2

  // Detect if this contains bullets
  const hasBullets = lines.some((l) => /^\s*[-•]\s/.test(l.trim()))

  if (isTable) {
    const rows = tableLines.map((l) => l.split('|').map((c) => c.trim()).filter(Boolean))
    const nonTableLines = lines.filter((l) => !l.includes('|') || l.trim().length <= 3)
    const isLastRowTotal = rows.length > 0 && rows[rows.length - 1][0]?.toUpperCase().includes('TOTAL')

    return (
      <div className="mb-4">
        {/* Table */}
        <div className="border mb-3" style={{ borderColor: '#E5E5E2' }}>
          {rows.map((row, ri) => {
            const isHeader = ri === 0
            const isTotal = ri === rows.length - 1 && isLastRowTotal
            return (
              <div
                key={ri}
                className="flex items-center justify-between px-4 py-2.5"
                style={{
                  backgroundColor: isHeader ? '#1B4332' : isTotal ? '#FAFAF8' : ri % 2 === 0 ? '#FFFFFF' : '#FAFAF8',
                  borderBottom: ri < rows.length - 1 ? '1px solid #E5E5E2' : undefined,
                  borderTop: isTotal ? '2px solid #1B4332' : undefined,
                }}
              >
                <span className={`${isHeader || isTotal ? 'font-bold' : ''}`} style={{ fontSize: bodySize, color: isHeader ? '#FFFFFF' : bodyColor, fontWeight: isHeader || isTotal ? undefined : bodyWeight }}>
                  {row[0] ?? ''}
                </span>
                <span className={`text-right ${isHeader || isTotal ? 'font-bold' : ''}`} style={{ fontSize: bodySize, color: isHeader ? '#FFFFFF' : '#1B4332', fontFamily: isHeader ? undefined : 'monospace', fontWeight: isHeader || isTotal ? undefined : bodyWeight }}>
                  {row[1] ?? ''}
                </span>
              </div>
            )
          })}
        </div>
        {/* Non-table text below */}
        {nonTableLines.filter((l) => l.trim()).map((line, li) => (
          <p key={li} className="leading-relaxed mb-1 italic" style={{ fontSize: bodySize, color: '#6B7280' }}>
            {renderInlineFormatting(line)}
          </p>
        ))}
      </div>
    )
  }

  if (hasBullets) {
    const bulletLines: string[] = []
    const otherLines: string[] = []
    for (const line of lines) {
      if (/^\s*[-•]\s/.test(line.trim())) {
        bulletLines.push(line.trim().replace(/^[-•]\s*/, ''))
      } else if (line.trim()) {
        otherLines.push(line.trim())
      }
    }
    return (
      <div className="mb-3">
        {otherLines.length > 0 && otherLines.map((line, li) => (
          <p key={`p-${li}`} className="leading-relaxed mb-2" style={{ fontSize: bodySize, color: bodyColor, fontWeight: bodyWeight }}>
            {renderInlineFormatting(line)}
          </p>
        ))}
        <ul className="space-y-1.5 ml-1">
          {bulletLines.map((item, bi) => (
            <li key={bi} className="flex gap-2.5 leading-relaxed" style={{ fontSize: bodySize, color: bodyColor, fontWeight: bodyWeight }}>
              <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5" style={{ backgroundColor: '#2D6A4F', borderRadius: '50%' }} />
              <span>{renderInlineFormatting(item)}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  // Check for sub-headings (lines ending with ":")
  const hasSubHeadings = lines.some((l) => /^[A-Z][A-Za-z\s]+:$/.test(l.trim()))
  if (hasSubHeadings) {
    return (
      <div className="mb-3 space-y-2">
        {lines.filter((l) => l.trim()).map((line, li) => {
          const trimmed = line.trim()
          if (/^[A-Z][A-Za-z\s]+:$/.test(trimmed)) {
            return <p key={li} className="font-semibold mt-3" style={{ fontSize: bodySize, color: '#1B4332' }}>{trimmed}</p>
          }
          return <p key={li} className="leading-relaxed" style={{ fontSize: bodySize, color: bodyColor, fontWeight: bodyWeight }}>{renderInlineFormatting(trimmed)}</p>
        })}
      </div>
    )
  }

  // Plain paragraph with bold support
  return (
    <div
      contentEditable={editable}
      suppressContentEditableWarning
      onBlur={(e) => { if (editable && onUpdate) onUpdate(e.currentTarget.textContent ?? '') }}
      className={`leading-relaxed mb-3 outline-none px-1 -mx-1 ${editable ? 'focus:bg-[#FAFAF8]' : ''}`}
      style={{ fontSize: bodySize, color: bodyColor, fontWeight: bodyWeight, minHeight: '1.2rem' }}
    >
      {text}
    </div>
  )
}

// ── Editable party details (sidebar) ──────────────────────────────────────────

function EditableParties({ contract, intake, onUpdate, onEdit }: {
  contract: SavedContract
  intake: Record<string, unknown>
  onUpdate: (c: SavedContract) => void
  onEdit?: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [p1Name, setP1Name] = useState(contract.party1 ?? '')
  const [p1Company, setP1Company] = useState(String(intake.yourBusinessName ?? ''))
  const [p1Email, setP1Email] = useState(contract.party1Email ?? '')
  const [p1Address, setP1Address] = useState(String(intake.yourAddress ?? ''))
  const [p2Name, setP2Name] = useState(String(intake.theirContactName ?? ''))
  const [p2Company, setP2Company] = useState(contract.party2 ?? '')
  const [p2Email, setP2Email] = useState(contract.party2Email ?? '')
  const [p2Address, setP2Address] = useState(String(intake.theirAddress ?? ''))

  const inputCls = "w-full border px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
  const inputSty = { borderColor: '#E5E5E2', backgroundColor: '#FAFAF8', color: '#1A1A1A' }

  const handleSave = () => {
    const updated = { ...contract, party1: p1Name, party1Email: p1Email, party2: p2Company, party2Email: p2Email }
    if (contract.intakeData) {
      updated.intakeData = { ...contract.intakeData, yourBusinessName: p1Company, yourAddress: p1Address, theirContactName: p2Name, theirAddress: p2Address }
    }
    onUpdate(updated)
    onEdit?.()
    setEditing(false)
  }

  const renderField = (label: string, value: string, onChange: (v: string) => void, id: string) => (
    <div key={id}>
      <label htmlFor={id} className="text-[10px] uppercase tracking-widest mb-1 block" style={{ color: '#888' }}>{label}</label>
      {editing ? (
        <input id={id} type="text" value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} style={inputSty} />
      ) : (
        <p className="text-sm font-medium" style={{ color: '#1A1A1A', borderBottom: '1px solid #E5E5E2', paddingBottom: 4 }}>{value || '\u2014'}</p>
      )}
    </div>
  )

  return (
    <>
      {/* Provider card */}
      <div className="border mb-4" style={{ borderColor: '#E5E5E2', borderLeftWidth: 4, borderLeftColor: '#1B4332' }}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: '#E5E5E2', backgroundColor: '#1B4332' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white">Provider</p>
          {!editing && (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs font-medium hover:opacity-70 text-white">
              <Pen className="w-3 h-3" /> Edit
            </button>
          )}
        </div>
        <div className="px-4 py-3 space-y-3">
          {renderField('Name', p1Name, setP1Name, 'p1-name')}
          {renderField('Company Name', p1Company, setP1Company, 'p1-company')}
          {renderField('Business Email', p1Email, setP1Email, 'p1-email')}
          {renderField('Business Address', p1Address, setP1Address, 'p1-address')}
        </div>
      </div>

      {/* Client card */}
      <div className="border mb-4" style={{ borderColor: '#E5E5E2', borderLeftWidth: 4, borderLeftColor: '#2D6A4F' }}>
        <div className="px-4 py-2.5 border-b" style={{ borderColor: '#E5E5E2', backgroundColor: '#D8F3DC' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#1B4332' }}>Client</p>
        </div>
        <div className="px-4 py-3 space-y-3">
          {renderField('Name', p2Name, setP2Name, 'p2-name')}
          {renderField('Company Name', p2Company, setP2Company, 'p2-company')}
          {renderField('Business Email', p2Email, setP2Email, 'p2-email')}
          {renderField('Business Address', p2Address, setP2Address, 'p2-address')}
        </div>
      </div>

      {editing && (
        <div className="flex gap-2">
          <button onClick={handleSave} className="flex-1 py-2 text-xs font-semibold text-white" style={{ backgroundColor: '#2D6A4F' }}>
            Save changes
          </button>
          <button onClick={() => setEditing(false)} className="flex-1 py-2 text-xs font-medium border" style={{ borderColor: '#E5E5E2', color: '#6B7280' }}>
            Cancel
          </button>
        </div>
      )}
    </>
  )
}

// ── Document header party info block ──────────────────────────────────────────

function DocumentPartyHeader({ contract, intake }: { contract: SavedContract; intake: Record<string, unknown> }) {
  const p1Name = contract.party1 ?? ''
  const p1Company = String(intake.yourBusinessName ?? '')
  const p1Email = contract.party1Email ?? ''
  const p1Address = String(intake.yourAddress ?? '')
  const p2Name = String(intake.theirContactName ?? '')
  const p2Company = contract.party2 ?? ''
  const p2Email = contract.party2Email ?? ''
  const p2Address = String(intake.theirAddress ?? '')

  const field = (label: string, value: string) => value ? (
    <div><p className="text-[10px] uppercase tracking-widest" style={{ color: '#888' }}>{label}</p><p className="text-sm font-medium" style={{ color: '#1A1A1A', borderBottom: '1px solid #E5E5E2', paddingBottom: 3 }}>{value}</p></div>
  ) : null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {/* Provider */}
      <div className="border" style={{ borderColor: '#E5E5E2', borderLeftWidth: 4, borderLeftColor: '#1B4332' }}>
        <div className="px-4 py-2 border-b" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#888' }}>Provider</p>
        </div>
        <div className="px-4 py-3 space-y-2">
          {field('Name', p1Name)}
          {field('Company Name', p1Company)}
          {field('Business Email', p1Email)}
          {field('Business Address', p1Address)}
        </div>
      </div>
      {/* Client */}
      <div className="border" style={{ borderColor: '#E5E5E2', borderLeftWidth: 4, borderLeftColor: '#2D6A4F' }}>
        <div className="px-4 py-2 border-b" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#888' }}>Client</p>
        </div>
        <div className="px-4 py-3 space-y-2">
          {field('Name', p2Name)}
          {field('Company Name', p2Company)}
          {field('Business Email', p2Email)}
          {field('Business Address', p2Address)}
        </div>
      </div>
    </div>
  )
}


// ── Floating selection toolbar ───────────────────────────────────────────────

// ── Fixed vertical format toolbar (left of document, right of sidebar) ────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function FloatingFormatToolbar({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const exec = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value ?? undefined)
  }

  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [textColor, setTextColor] = useState('#374151')

  useEffect(() => {
    const update = () => {
      setIsBold(document.queryCommandState('bold'))
      setIsItalic(document.queryCommandState('italic'))
      setIsUnderline(document.queryCommandState('underline'))
    }
    document.addEventListener('selectionchange', update)
    return () => document.removeEventListener('selectionchange', update)
  }, [])

  const btn = "flex items-center justify-center w-9 h-9 text-xs font-bold border transition-colors"
  const active = { backgroundColor: '#1B4332', color: '#FFFFFF', borderColor: '#1B4332' }
  const inactive = { backgroundColor: '#FFFFFF', color: '#374151', borderColor: '#E5E5E2' }

  return (
    <div
      className="fixed z-40 flex flex-col border-r border-b shadow-sm"
      style={{
        left: 220,   // flush right of the 220px sidebar
        top: 48,     // below the top bar
        bottom: 0,
        width: 48,
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E5E2',
      }}
    >
      {/* Header label — rotated to read top-to-bottom */}
      <div
        className="flex items-center justify-center flex-shrink-0 border-b"
        style={{ height: 80, backgroundColor: '#1B4332', borderColor: '#E5E5E2' }}
      >
        <p
          className="text-[9px] font-bold uppercase tracking-widest"
          style={{ color: '#D8F3DC', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          Format
        </p>
      </div>

      {/* Buttons — stacked vertically */}
      <div className="flex flex-col items-center gap-1 py-3 px-1.5 flex-1 overflow-y-auto">
        <button onMouseDown={(e) => { e.preventDefault(); exec('bold') }} className={btn} style={isBold ? active : inactive} title="Bold">B</button>
        <button onMouseDown={(e) => { e.preventDefault(); exec('italic') }} className={`${btn} italic`} style={isItalic ? active : inactive} title="Italic">I</button>
        <button onMouseDown={(e) => { e.preventDefault(); exec('underline') }} className={`${btn} underline`} style={isUnderline ? active : inactive} title="Underline">U</button>

        <div className="w-6 h-px my-1" style={{ backgroundColor: '#E5E5E2' }} />

        <button onMouseDown={(e) => { e.preventDefault(); exec('fontSize', '2') }} className={btn} style={inactive} title="Smaller text">
          <span style={{ fontSize: 9 }}>A−</span>
        </button>
        <button onMouseDown={(e) => { e.preventDefault(); exec('fontSize', '4') }} className={btn} style={inactive} title="Larger text">
          <span style={{ fontSize: 13 }}>A+</span>
        </button>

        <div className="w-6 h-px my-1" style={{ backgroundColor: '#E5E5E2' }} />

        {/* Text colour */}
        <label
          className="relative flex items-center justify-center w-9 h-9 border cursor-pointer"
          style={{ borderColor: '#E5E5E2', backgroundColor: '#FFFFFF' }}
          title="Text colour"
        >
          <span className="text-xs font-bold" style={{ color: textColor }}>A</span>
          <div className="absolute bottom-1 left-1 right-1 h-1" style={{ backgroundColor: textColor }} />
          <input
            type="color"
            value={textColor}
            onChange={(e) => { setTextColor(e.target.value); exec('foreColor', e.target.value) }}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </label>

        <div className="w-6 h-px my-1" style={{ backgroundColor: '#E5E5E2' }} />

        <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('removeFormat', false) }} className={btn} style={inactive} title="Clear formatting">
          <span style={{ fontSize: 11 }}>✕</span>
        </button>
      </div>

      {/* Hint at bottom */}
      <div className="flex-shrink-0 border-t px-1 py-2" style={{ borderColor: '#E5E5E2' }}>
        <p
          className="text-[8px] text-center leading-tight"
          style={{ color: '#9CA3AF', writingMode: 'vertical-rl', transform: 'rotate(180deg)', margin: '0 auto' }}
        >
          Select text
        </p>
      </div>
    </div>
  )
}

function ContractViewer({ contract, onBack, onCheckout, onSubscribe, onSend, onUpdate, session, isSubscribed }: {
  contract: SavedContract
  onBack: () => void
  onCheckout: (id: string) => void
  onSubscribe: () => Promise<void>
  onSend: (id: string, resend?: boolean, senderSig?: { dataUrl: string; printedName: string; signedAt: string }) => Promise<void>
  onUpdate: (updated: SavedContract) => void
  session: { user?: { name?: string | null; email?: string | null } } | null
  isSubscribed: boolean
}) {
  const [sideTab, setSideTab] = useState<'parties' | 'details' | 'styling' | 'insights'>('parties')

  // AI insights (health score + summary) — lazy-loaded on tab open
  type HealthScore = {
    overall: number
    categories: { label: string; score: 'strong' | 'moderate' | 'weak' | 'missing'; detail: string }[]
    topTip: string
  }
  type ContractSummary = {
    headline: string
    whatYouAreAgreeing: string[]
    whatTheyAreAgreeing: string[]
    keyProtections: string[]
    keyRisks: string[]
    importantDates: string[]
    moneyTerms: string
  }
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null)
  const [healthLoading, setHealthLoading] = useState(false)
  const [healthError, setHealthError] = useState<string | null>(null)
  const [summary, setSummary] = useState<ContractSummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  // Regenerate-with-feedback modal
  const [showRegenModal, setShowRegenModal] = useState(false)
  const [regenFeedback, setRegenFeedback] = useState('')
  const [regenLoading, setRegenLoading] = useState(false)
  const [regenError, setRegenError] = useState<string | null>(null)

  // Autosave indicator — 'idle' | 'saving' | 'saved'
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)

  // Mobile sidebar collapse state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [editableContent, setEditableContent] = useState(contract.content ?? '')
  const [editableTitle, setEditableTitle] = useState(contract.title)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isEditMode, setIsEditMode] = useState(contract.status !== 'sent')
  const [sigState, setSigState] = useState<SignatureState>({ sig1Empty: true, name1: '', date1: '' })
  const [sigError, setSigError] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [subscribeLoading, setSubscribeLoading] = useState(false)
  const [docFont, setDocFont] = useState(contract.docStyle?.font ?? 'Inter, sans-serif')
  const [docBodySize, setDocBodySize] = useState(contract.docStyle?.bodySize ?? 14)
  const [docHeadingSize, setDocHeadingSize] = useState(contract.docStyle?.headingSize ?? 18)
  const [docBodyColor, setDocBodyColor] = useState(contract.docStyle?.bodyColor ?? '#374151')
  const [docHeadingColor, setDocHeadingColor] = useState(contract.docStyle?.headingColor ?? '#1B4332')
  const [docFontWeight, setDocFontWeight] = useState<400 | 500 | 600>(contract.docStyle?.bodyWeight ?? 500)
  const [docHeadingWeight, setDocHeadingWeight] = useState<600 | 700 | 800>(contract.docStyle?.headingWeight ?? 700)
  const [docLogo, setDocLogo] = useState<string>(String(contract.intakeData?.yourLogo ?? ''))
  const documentContainerRef = useRef<HTMLDivElement>(null)

  const senderReady = !sigState.sig1Empty && !!sigState.name1.trim() && !!sigState.date1

  // Persist doc style whenever typography settings change
  useEffect(() => {
    const docStyle: DocStyle = { font: docFont, bodySize: docBodySize, headingSize: docHeadingSize, bodyColor: docBodyColor, headingColor: docHeadingColor, bodyWeight: docFontWeight, headingWeight: docHeadingWeight }
    onUpdate({ ...contract, docStyle })
  }, [docFont, docBodySize, docHeadingSize, docBodyColor, docHeadingColor, docFontWeight, docHeadingWeight]) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced save with status indicator
  useEffect(() => {
    if (editableContent === contract.content && editableTitle === contract.title) return
    setSaveStatus('saving')
    const t = setTimeout(() => {
      onUpdate({ ...contract, content: editableContent, title: editableTitle })
      setSaveStatus('saved')
      setLastSavedAt(new Date())
    }, 500)
    return () => clearTimeout(t)
  }, [editableContent, editableTitle]) // eslint-disable-line react-hooks/exhaustive-deps

  // Health score: fetch once when Insights tab opens (or refresh on content change + tab open)
  useEffect(() => {
    if (sideTab !== 'insights' || !editableContent.trim()) return
    if (healthScore || healthLoading) return
    setHealthLoading(true)
    setHealthError(null)
    fetch('/api/health-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editableContent, contractType: contract.typeId }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? 'Failed')
        return r.json()
      })
      .then((d) => setHealthScore(d.score))
      .catch((e) => setHealthError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setHealthLoading(false))
  }, [sideTab]) // eslint-disable-line react-hooks/exhaustive-deps

  // Summary: fetch once when Insights tab opens
  useEffect(() => {
    if (sideTab !== 'insights' || !editableContent.trim()) return
    if (summary || summaryLoading) return
    setSummaryLoading(true)
    setSummaryError(null)
    fetch('/api/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editableContent }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? 'Failed')
        return r.json()
      })
      .then((d) => setSummary(d.summary))
      .catch((e) => setSummaryError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setSummaryLoading(false))
  }, [sideTab]) // eslint-disable-line react-hooks/exhaustive-deps

  // Invalidate cached insights when content changes substantively
  useEffect(() => {
    setHealthScore(null)
    setSummary(null)
  }, [contract.id]) // reset per contract

  // Parse contract text into blocks
  const blocks = editableContent.split(/\n\n+/).filter(Boolean)

  const intake = contract.intakeData ?? {}

  const KEY_TERM_LABELS: Record<string, string> = {
    feeAmount: 'Fee',
    feeStructure: 'Fee structure',
    paymentTerms: 'Payment terms',
    paymentSchedule: 'Payment schedule',
    ipTransfer: 'IP transfer',
    noticePeriod: 'Notice period',
    ndaDuration: 'NDA duration',
    ndaScope: 'NDA scope',
    retainerFee: 'Monthly retainer',
    minimumTerm: 'Minimum term',
    jobTitle: 'Job title',
    annualSalary: 'Annual salary',
    hoursPerWeek: 'Hours per week',
    holidayDays: 'Holiday days',
    probationPeriod: 'Probation period',
    revisionsIncluded: 'Revisions included',
    deliverables: 'Deliverables',
    retainerServices: 'Services',
    confidentialityDuration: 'Confidentiality',
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const keyTerms = Object.entries(KEY_TERM_LABELS)
    .filter(([k]) => intake[k] && String(intake[k]).trim())
    .map(([k, label]) => ({ label, value: String(intake[k]) }))

  // Parse block into heading + body (AI often puts "01. HEADING - body text" on same line)
  const parseBlock = (text: string): { type: 'section' | 'party' | 'signature' | 'footer' | 'body'; heading?: string; body: string } => {
    const t = text.trim()
    if (t.startsWith('---') || t.startsWith('This document was generated')) return { type: 'footer', body: t }
    if (t.startsWith('PARTY 1 (') || t.startsWith('PARTY 2 (') || (t.startsWith('PARTY 1') && t.includes('Name:'))) return { type: 'party', body: t }
    if (t.startsWith('PARTY 1 —') || t.startsWith('PARTY 2 —') || t.startsWith('PARTY 1—') || t.startsWith('PARTY 2—')) return { type: 'signature', body: t }
    if (t.startsWith('ACCEPTANCE') || (t.includes('Signature:') && t.includes('___')) || (t.includes('___') && (t.includes('Full Name') || t.includes('Date:')))) return { type: 'signature', body: t }
    // Suppress any remaining raw signature text lines
    if (t.includes('Signature:') && t.includes('Full Name:')) return { type: 'signature', body: t }

    // Numbered section: "01. HEADING - body" or "01. HEADING\nbody"
    const sectionMatch = t.match(/^(\d{2}\.\s+[A-Z][A-Z\s&/]+?)(?:\s*[-–—]\s*|\n)([\s\S]+)/)
    if (sectionMatch) return { type: 'section', heading: sectionMatch[1].trim(), body: sectionMatch[2].trim() }

    // Pure heading line (all caps, short)
    if (/^\d{2}\.\s+[A-Z]/.test(t) && t.length < 80) return { type: 'section', heading: t, body: '' }
    if (t === t.toUpperCase() && t.length > 5 && t.length < 60 && !t.startsWith('-')) return { type: 'section', heading: t, body: '' }

    return { type: 'body', body: t }
  }

  return (
    <div className="flex h-full overflow-hidden relative">
      {/* Floating format toolbar */}
      <FloatingFormatToolbar containerRef={documentContainerRef} />

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setMobileSidebarOpen((o) => !o)}
        className="lg:hidden fixed bottom-5 right-5 z-30 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg"
        style={{ backgroundColor: '#2D6A4F' }}
        aria-label="Toggle contract panel"
      >
        {mobileSidebarOpen ? <X className="w-5 h-5" /> : <LayoutTemplate className="w-5 h-5" />}
      </button>

      {/* ── Left: Editable Document ── */}
      <div ref={documentContainerRef} className="flex-1 overflow-y-auto" style={{ backgroundColor: '#FFFFFF', fontFamily: docFont }}>
        <div className="max-w-3xl mx-auto px-8 py-10">
          {/* Back */}
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs mb-6 hover:opacity-70 transition-opacity" style={{ color: '#6B7280' }}>
            &larr; Back to dashboard
          </button>

          {/* Locked banner for sent contracts */}
          {contract.status === 'sent' && !isEditMode && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 mb-6 border" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" style={{ color: '#6B7280' }} />
                <p className="text-sm" style={{ color: '#374151' }}>This contract has been sent and is locked for editing</p>
              </div>
              <button
                onClick={() => setIsEditMode(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#2D6A4F' }}
              >
                <Pen className="w-3 h-3" /> Unlock & Edit
              </button>
            </div>
          )}

          {/* Header block */}
          <div className={`border-b pb-6 mb-8 ${!isEditMode ? 'opacity-60 pointer-events-none select-none' : ''}`} style={{ borderColor: '#E5E5E2' }}>
            <div
              contentEditable={isEditMode}
              suppressContentEditableWarning
              onBlur={(e) => { if (isEditMode) setEditableTitle(e.currentTarget.textContent ?? '') }}
              className={`font-display text-3xl font-bold mb-2 outline-none px-1 -mx-1 ${isEditMode ? 'focus:bg-[#FAFAF8]' : ''}`}
              style={{ color: '#1B4332', minHeight: '2rem' }}
            >
              {contract.title}
            </div>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>
              {contract.typeName} &middot; Generated {new Date(contract.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} &middot; {isEditMode ? 'Click any text to edit' : 'Locked'}
            </p>
          </div>

          {/* Logo */}
          {docLogo && (
            <div className="mb-6">
              <img src={docLogo} alt="Logo" className="object-contain" style={{ maxHeight: 60, maxWidth: 200 }} />
            </div>
          )}

          {/* Party info cards — at top of document */}
          <div className={`${!isEditMode ? 'opacity-60 pointer-events-none select-none' : ''}`}>
            {isEditMode && (
              <div className="flex items-center gap-2 mb-2 px-1">
                <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#9CA3AF' }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>Edit party details in the <button onClick={() => setSideTab('parties')} className="font-semibold underline hover:opacity-70" style={{ color: '#2D6A4F' }}>Parties tab →</button></p>
              </div>
            )}
            <DocumentPartyHeader contract={contract} intake={intake} />
          </div>

          {/* Document body — parsed sections */}
          <div className={`${!isEditMode ? 'opacity-60 pointer-events-none select-none' : ''}`}>
            {blocks.map((block, i) => {
              const parsed = parseBlock(block)
              const updateBlock = (text: string) => {
                const nb = [...blocks]; nb[i] = text; setEditableContent(nb.join('\n\n'))
                setHasUnsavedChanges(true)
              }

              if (parsed.type === 'section') {
                return (
                  <div key={i} className="mt-8">
                    {/* Section heading — bold, with divider */}
                    {parsed.heading && (
                      <div className="border-b pb-2 mb-3" style={{ borderColor: '#D8F3DC' }}>
                        <div
                          contentEditable={isEditMode}
                          suppressContentEditableWarning
                          onBlur={(e) => { if (isEditMode) updateBlock(`${e.currentTarget.textContent ?? ''}\n${parsed.body}`) }}
                          className={`font-bold uppercase tracking-wide outline-none px-1 -mx-1 ${isEditMode ? 'focus:bg-[#FAFAF8]' : ''}`}
                          style={{ color: docHeadingColor, fontSize: docHeadingSize, fontWeight: docHeadingWeight }}
                        >
                          {parsed.heading}
                        </div>
                      </div>
                    )}
                    {/* Section body — normal weight, below heading */}
                    {parsed.body && (
                      <FormattedBody text={parsed.body} onUpdate={isEditMode ? (newBody) => updateBlock(`${parsed.heading ?? ''}\n${newBody}`) : undefined} bodySize={docBodySize} bodyColor={docBodyColor} bodyWeight={docFontWeight} editable={isEditMode} />
                    )}
                  </div>
                )
              }

              if (parsed.type === 'party') {
                // Party info is shown in the sidebar — skip rendering in the document body
                return null
              }

              if (parsed.type === 'signature') {
                if (i > 0 && blocks.slice(0, i).some((b) => parseBlock(b).type === 'signature')) return null
                return <SignatureBlock key={i} party1Name={contract.party1 ?? ''} party2Name={contract.party2 ?? ''} onStateChange={setSigState} />
              }

              if (parsed.type === 'footer') {
                return (
                  <div key={i} className="mt-10 pt-4 border-t text-center" style={{ borderColor: '#E5E5E2' }}>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>{block}</p>
                  </div>
                )
              }

              // Body text — check for bullets, tables, bold
              return <FormattedBody key={i} text={block} onUpdate={updateBlock} bodySize={docBodySize} bodyColor={docBodyColor} bodyWeight={docFontWeight} />
            
            })}
          </div>

          {blocks.length === 0 && (
            <p className="text-sm italic" style={{ color: '#9CA3AF' }}>No contract content yet.</p>
          )}
        </div>
      </div>

      {/* Mobile overlay when sidebar open */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden fixed inset-0 z-10 bg-black/40"
          aria-hidden="true"
        />
      )}

      {/* ── Right: Info Sidebar ── */}
      <div
        className={`w-80 flex-shrink-0 flex flex-col border-l overflow-hidden transition-transform duration-200 lg:translate-x-0 lg:static fixed right-0 top-0 bottom-0 z-20 ${mobileSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ backgroundColor: '#FAFAF8', borderColor: '#E5E5E2' }}
      >
        {/* Autosave indicator */}
        {saveStatus !== 'idle' && (
          <div className="flex items-center gap-1.5 px-4 py-2 border-b text-[11px] font-medium" style={{ borderColor: '#E5E5E2', backgroundColor: '#FFFFFF', color: saveStatus === 'saving' ? '#9CA3AF' : '#2D6A4F' }}>
            {saveStatus === 'saving' ? (
              <><Loader2 className="w-3 h-3 animate-spin" /> Saving&hellip;</>
            ) : (
              <><Check className="w-3 h-3" strokeWidth={3} />
                Saved{lastSavedAt ? ` ${new Date().getTime() - lastSavedAt.getTime() < 60000 ? 'just now' : lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}</>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b flex-shrink-0" style={{ borderColor: '#E5E5E2' }}>
          {(['parties', 'insights', 'styling', 'details'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSideTab(t)}
              className="flex-1 py-2.5 text-[11px] font-semibold capitalize transition-colors"
              style={sideTab === t
                ? { backgroundColor: '#D8F3DC', color: '#1B4332', borderBottom: '2px solid #2D6A4F' }
                : { backgroundColor: 'transparent', color: '#9CA3AF', borderBottom: '2px solid transparent' }
              }
            >
              {t === 'parties' ? 'Parties' : t === 'details' ? 'Details' : t === 'insights' ? 'Insights' : 'Styling'}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {sideTab === 'parties' && (
            <EditableParties contract={contract} intake={intake} onUpdate={onUpdate} onEdit={() => setHasUnsavedChanges(true)} />
          )}

          {sideTab === 'details' && (
            <>
              {[
                { label: 'Contract type', value: contract.typeName },
                { label: 'Status', value: contract.status.charAt(0).toUpperCase() + contract.status.slice(1) },
                { label: 'Generated', value: new Date(contract.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) },
                { label: 'Governing law', value: String(intake.governingLaw ?? 'England & Wales') },
                { label: 'Start date', value: String(intake.contractStartDate ?? '') },
                { label: 'Contract ID', value: contract.id },
              ].filter(r => r.value).map(r => (
                <div key={r.label} className="mb-3">
                  <p className="text-xs font-medium mb-0.5" style={{ color: '#9CA3AF' }}>{r.label}</p>
                  <p className={`text-sm break-all ${r.label === 'Contract ID' ? 'font-mono text-xs' : ''}`} style={{ color: '#1B4332' }}>{r.value}</p>
                </div>
              ))}

              {/* Reading stats */}
              {(() => {
                const words = editableContent.split(/\s+/).filter(Boolean).length
                const readMin = Math.max(1, Math.round(words / 220))
                const sections = (editableContent.match(/^\d{2}\.\s+[A-Z]/gm) ?? []).length
                return (
                  <div className="mt-4 pt-4 border-t space-y-3" style={{ borderColor: '#E5E5E2' }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Document stats</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 border" style={{ borderColor: '#E5E5E2' }}>
                        <p className="text-lg font-bold" style={{ color: '#1B4332' }}>{words}</p>
                        <p className="text-[10px]" style={{ color: '#9CA3AF' }}>words</p>
                      </div>
                      <div className="p-2 border" style={{ borderColor: '#E5E5E2' }}>
                        <p className="text-lg font-bold" style={{ color: '#1B4332' }}>{readMin}</p>
                        <p className="text-[10px]" style={{ color: '#9CA3AF' }}>min read</p>
                      </div>
                      <div className="p-2 border" style={{ borderColor: '#E5E5E2' }}>
                        <p className="text-lg font-bold" style={{ color: '#1B4332' }}>{sections || '—'}</p>
                        <p className="text-[10px]" style={{ color: '#9CA3AF' }}>sections</p>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </>
          )}

          {sideTab === 'insights' && (
            <div className="space-y-5">
              {/* ── Health Score ── */}
              <div className="pb-5 border-b" style={{ borderColor: '#E5E5E2' }}>
                <div className="flex items-center gap-1.5 mb-3">
                  <Activity className="w-3.5 h-3.5" style={{ color: '#2D6A4F' }} />
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Contract Health Score</p>
                </div>

                {healthLoading && (
                  <div className="flex items-center gap-2 py-4 text-xs" style={{ color: '#9CA3AF' }}>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analysing contract&hellip;
                  </div>
                )}
                {healthError && (
                  <div className="text-xs py-2" style={{ color: '#EF4444' }}>
                    {healthError}
                    <button onClick={() => { setHealthScore(null); setHealthError(null) }} className="ml-2 underline">Retry</button>
                  </div>
                )}
                {healthScore && (
                  <>
                    <div className="flex items-baseline gap-2 mb-3">
                      <p className="text-4xl font-bold font-display" style={{ color: healthScore.overall >= 7 ? '#2D6A4F' : healthScore.overall >= 5 ? '#CA8A04' : '#EF4444' }}>{healthScore.overall.toFixed(1)}</p>
                      <p className="text-sm" style={{ color: '#9CA3AF' }}>/ 10</p>
                    </div>
                    {healthScore.topTip && (
                      <div className="mb-3 px-3 py-2 text-xs border-l-2" style={{ borderColor: '#2D6A4F', backgroundColor: '#F0FDF4', color: '#1B4332' }}>
                        <span className="font-semibold">Top tip:</span> {healthScore.topTip}
                      </div>
                    )}
                    <ul className="space-y-1.5">
                      {healthScore.categories.map((c) => {
                        const colorMap = { strong: '#2D6A4F', moderate: '#CA8A04', weak: '#DC2626', missing: '#9CA3AF' } as const
                        return (
                          <li key={c.label} className="flex items-start gap-2 text-xs">
                            <span className="inline-block w-2 h-2 mt-1 flex-shrink-0" style={{ backgroundColor: colorMap[c.score], borderRadius: '50%' }} />
                            <div>
                              <p className="font-semibold" style={{ color: '#1B4332' }}>{c.label} <span className="font-normal capitalize" style={{ color: colorMap[c.score] }}>· {c.score}</span></p>
                              <p style={{ color: '#6B7280' }}>{c.detail}</p>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </>
                )}
              </div>

              {/* ── Plain-English Summary ── */}
              <div className="pb-5 border-b" style={{ borderColor: '#E5E5E2' }}>
                <div className="flex items-center gap-1.5 mb-3">
                  <BookOpen className="w-3.5 h-3.5" style={{ color: '#2D6A4F' }} />
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Plain-English Summary</p>
                </div>

                {summaryLoading && (
                  <div className="flex items-center gap-2 py-4 text-xs" style={{ color: '#9CA3AF' }}>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Summarising&hellip;
                  </div>
                )}
                {summaryError && (
                  <div className="text-xs py-2" style={{ color: '#EF4444' }}>
                    {summaryError}
                    <button onClick={() => { setSummary(null); setSummaryError(null) }} className="ml-2 underline">Retry</button>
                  </div>
                )}
                {summary && (
                  <div className="space-y-3 text-xs">
                    {summary.headline && (
                      <p className="font-semibold" style={{ color: '#1B4332' }}>{summary.headline}</p>
                    )}
                    {summary.whatYouAreAgreeing?.length > 0 && (
                      <div>
                        <p className="font-semibold mb-1" style={{ color: '#2D6A4F' }}>You agree to:</p>
                        <ul className="space-y-1 pl-3" style={{ color: '#374151' }}>
                          {summary.whatYouAreAgreeing.map((b, i) => <li key={i} className="list-disc list-outside">{b}</li>)}
                        </ul>
                      </div>
                    )}
                    {summary.whatTheyAreAgreeing?.length > 0 && (
                      <div>
                        <p className="font-semibold mb-1" style={{ color: '#2D6A4F' }}>They agree to:</p>
                        <ul className="space-y-1 pl-3" style={{ color: '#374151' }}>
                          {summary.whatTheyAreAgreeing.map((b, i) => <li key={i} className="list-disc list-outside">{b}</li>)}
                        </ul>
                      </div>
                    )}
                    {summary.keyRisks?.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <AlertTriangle className="w-3 h-3" style={{ color: '#DC2626' }} />
                          <p className="font-semibold" style={{ color: '#DC2626' }}>Key risks:</p>
                        </div>
                        <ul className="space-y-1 pl-3" style={{ color: '#374151' }}>
                          {summary.keyRisks.map((b, i) => <li key={i} className="list-disc list-outside">{b}</li>)}
                        </ul>
                      </div>
                    )}
                    {summary.importantDates?.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <Calendar className="w-3 h-3" style={{ color: '#1B4332' }} />
                          <p className="font-semibold" style={{ color: '#1B4332' }}>Important dates:</p>
                        </div>
                        <ul className="space-y-1 pl-3" style={{ color: '#374151' }}>
                          {summary.importantDates.map((b, i) => <li key={i} className="list-disc list-outside">{b}</li>)}
                        </ul>
                      </div>
                    )}
                    {summary.moneyTerms && (
                      <div className="flex items-start gap-1 pt-1">
                        <PoundSterling className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: '#1B4332' }} />
                        <p style={{ color: '#374151' }}><span className="font-semibold">Money:</span> {summary.moneyTerms}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── AI Regenerate ── */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5" style={{ color: '#2D6A4F' }} />
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Refine with AI</p>
                </div>
                <p className="text-xs mb-2" style={{ color: '#6B7280' }}>
                  Give feedback and regenerate the whole contract. Example: &ldquo;stronger IP protection&rdquo; or &ldquo;plain English&rdquo;.
                </p>
                <button
                  onClick={() => { setShowRegenModal(true); setRegenError(null) }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold border transition-colors hover:bg-[#D8F3DC]"
                  style={{ borderColor: '#2D6A4F', color: '#2D6A4F', backgroundColor: 'transparent' }}
                >
                  <Sparkles className="w-3.5 h-3.5" /> Regenerate with feedback
                </button>
              </div>
            </div>
          )}

          {/* Regenerate modal */}
          <AnimatePresence>
            {showRegenModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                onClick={() => !regenLoading && setShowRegenModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="w-full max-w-md border shadow-xl"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E2' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#E5E5E2' }}>
                    <h3 className="font-display text-lg font-bold flex items-center gap-2" style={{ color: '#1B4332' }}>
                      <Sparkles className="w-4 h-4" /> Regenerate contract
                    </h3>
                    <button onClick={() => !regenLoading && setShowRegenModal(false)} className="p-1 hover:opacity-70" style={{ color: '#9CA3AF' }}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-5 space-y-3">
                    <p className="text-xs" style={{ color: '#6B7280' }}>
                      What should the AI change? One or two sentences work best.
                    </p>
                    <textarea
                      value={regenFeedback}
                      onChange={(e) => setRegenFeedback(e.target.value)}
                      rows={4}
                      placeholder="e.g. add stronger IP ownership clause; make termination terms clearer; simpler language throughout"
                      className="w-full border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                      style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8', color: '#1A1A1A' }}
                      disabled={regenLoading}
                    />
                    {regenError && <p className="text-xs" style={{ color: '#EF4444' }}>{regenError}</p>}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => !regenLoading && setShowRegenModal(false)}
                        className="flex-1 py-2 text-sm font-semibold border hover:bg-[#FAFAF8] transition-colors"
                        style={{ borderColor: '#E5E5E2', color: '#6B7280' }}
                        disabled={regenLoading}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          setRegenLoading(true)
                          setRegenError(null)
                          try {
                            const res = await fetch('/api/regenerate', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ contractId: contract.id, feedback: regenFeedback.trim() || undefined }),
                            })
                            const data = await res.json()
                            if (!res.ok) throw new Error(data.error ?? 'Regeneration failed')
                            setEditableContent(data.content)
                            setShowRegenModal(false)
                            setRegenFeedback('')
                            setHealthScore(null)
                            setSummary(null)
                          } catch (e) {
                            setRegenError(e instanceof Error ? e.message : 'Something went wrong')
                          } finally {
                            setRegenLoading(false)
                          }
                        }}
                        disabled={regenLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                        style={{ backgroundColor: '#2D6A4F' }}
                      >
                        {regenLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Regenerating&hellip;</> : <><Sparkles className="w-3.5 h-3.5" /> Regenerate</>}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {sideTab === 'styling' && (
            <div className="space-y-5">
              {/* ── Logo ── */}
              <div className="pb-5 border-b" style={{ borderColor: '#E5E5E2' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: '#9CA3AF' }}>Logo</p>
                {docLogo ? (
                  <div className="flex items-center justify-between p-3 border" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
                    <img src={docLogo} alt="Logo" className="h-8 object-contain" style={{ maxWidth: 120 }} />
                    <button onClick={() => setDocLogo('')} className="text-xs font-semibold hover:opacity-70 ml-3 flex-shrink-0" style={{ color: '#EF4444' }}>Remove</button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed py-5 cursor-pointer hover:border-[#2D6A4F] transition-colors" style={{ borderColor: '#D1D5DB', backgroundColor: '#FAFAF8' }}>
                    <input type="file" accept="image/png,image/jpeg,image/jpg" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; if (file.size > 2 * 1024 * 1024) { alert('Logo must be under 2MB'); return }; const reader = new FileReader(); reader.onload = (ev) => setDocLogo(ev.target?.result as string ?? ''); reader.readAsDataURL(file) }} />
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#9CA3AF' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                    <span className="text-xs font-semibold" style={{ color: '#374151' }}>Click to upload logo</span>
                    <span className="text-[10px]" style={{ color: '#9CA3AF' }}>PNG or JPG · max 2MB</span>
                  </label>
                )}
              </div>

              {/* ── Typography ── */}
              <div className="py-5 border-b" style={{ borderColor: '#E5E5E2' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>Typography</p>

                {/* Font family */}
                <div className="mb-4">
                  <p className="text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Font family</p>
                  <select value={docFont} onChange={(e) => setDocFont(e.target.value)} className="w-full border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]" style={{ borderColor: '#E5E5E2', backgroundColor: '#FFFFFF', color: '#1A1A1A' }}>
                    <option value="Inter, sans-serif">Inter (default)</option>
                    <option value="Georgia, serif">Georgia</option>
                    <option value="'Times New Roman', serif">Times New Roman</option>
                    <option value="'Courier New', monospace">Courier New</option>
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="system-ui, sans-serif">System UI</option>
                  </select>
                </div>

                {/* Body size */}
                <div className="mb-4">
                  <p className="text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Body size</p>
                  <div className="flex border overflow-hidden" style={{ borderColor: '#E5E5E2' }}>
                    <button onClick={() => setDocBodySize(s => Math.max(10, s - 1))} className="px-3 flex items-center justify-center border-r text-base font-bold hover:bg-[#FAFAF8] transition-colors" style={{ borderColor: '#E5E5E2', color: '#6B7280', height: 36 }}>−</button>
                    <span className="flex-1 flex items-center justify-center text-sm font-bold" style={{ color: '#1B4332', height: 36 }}>{docBodySize}px</span>
                    <button onClick={() => setDocBodySize(s => Math.min(24, s + 1))} className="px-3 flex items-center justify-center border-l text-base font-bold hover:bg-[#FAFAF8] transition-colors" style={{ borderColor: '#E5E5E2', color: '#6B7280', height: 36 }}>+</button>
                  </div>
                </div>

                {/* Heading size */}
                <div className="mb-4">
                  <p className="text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Heading size</p>
                  <div className="flex border overflow-hidden" style={{ borderColor: '#E5E5E2' }}>
                    <button onClick={() => setDocHeadingSize(s => Math.max(12, s - 1))} className="px-3 flex items-center justify-center border-r text-base font-bold hover:bg-[#FAFAF8] transition-colors" style={{ borderColor: '#E5E5E2', color: '#6B7280', height: 36 }}>−</button>
                    <span className="flex-1 flex items-center justify-center text-sm font-bold" style={{ color: '#1B4332', height: 36 }}>{docHeadingSize}px</span>
                    <button onClick={() => setDocHeadingSize(s => Math.min(32, s + 1))} className="px-3 flex items-center justify-center border-l text-base font-bold hover:bg-[#FAFAF8] transition-colors" style={{ borderColor: '#E5E5E2', color: '#6B7280', height: 36 }}>+</button>
                  </div>
                </div>

              </div>

              {/* ── Colours ── */}
              <div className="py-5 border-b" style={{ borderColor: '#E5E5E2' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>Colours</p>
                <div className="space-y-2">
                  <label className="flex items-center justify-between px-3 py-2.5 border cursor-pointer hover:bg-[#FAFAF8] transition-colors" style={{ borderColor: '#E5E5E2' }}>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: '#374151' }}>Body text</p>
                      <p className="text-[10px] font-mono mt-0.5" style={{ color: '#9CA3AF' }}>{docBodyColor}</p>
                    </div>
                    <div className="relative flex-shrink-0">
                      <div className="w-8 h-8 border" style={{ backgroundColor: docBodyColor, borderColor: '#D1D5DB' }} />
                      <input type="color" value={docBodyColor} onChange={(e) => setDocBodyColor(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                    </div>
                  </label>
                  <label className="flex items-center justify-between px-3 py-2.5 border cursor-pointer hover:bg-[#FAFAF8] transition-colors" style={{ borderColor: '#E5E5E2' }}>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: '#374151' }}>Headings</p>
                      <p className="text-[10px] font-mono mt-0.5" style={{ color: '#9CA3AF' }}>{docHeadingColor}</p>
                    </div>
                    <div className="relative flex-shrink-0">
                      <div className="w-8 h-8 border" style={{ backgroundColor: docHeadingColor, borderColor: '#D1D5DB' }} />
                      <input type="color" value={docHeadingColor} onChange={(e) => setDocHeadingColor(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                    </div>
                  </label>
                </div>
              </div>

              {/* ── Reset ── */}
              <div className="pt-4">
                <button
                  onClick={() => { setDocFont('Inter, sans-serif'); setDocBodySize(14); setDocHeadingSize(18); setDocBodyColor('#374151'); setDocHeadingColor('#1B4332'); setDocFontWeight(500); setDocHeadingWeight(700) }}
                  className="w-full py-2.5 text-xs font-semibold border hover:bg-[#FAFAF8] transition-colors"
                  style={{ borderColor: '#E5E5E2', color: '#6B7280' }}
                >
                  Reset to defaults
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Save as template */}
        <div className="flex-shrink-0 border-t px-4 pt-3 pb-0" style={{ borderColor: '#E5E5E2', backgroundColor: '#FFFFFF' }}>
          <button
            onClick={() => {
              const isNowTemplate = !contract.isTemplate
              onUpdate({ ...contract, isTemplate: isNowTemplate })
            }}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold border transition-colors hover:bg-[#FAFAF8]"
            style={contract.isTemplate
              ? { borderColor: '#2D6A4F', color: '#2D6A4F', backgroundColor: '#D8F3DC' }
              : { borderColor: '#E5E5E2', color: '#6B7280', backgroundColor: 'transparent' }}
          >
            <Bookmark className="w-3.5 h-3.5" />
            {contract.isTemplate ? '✓ Saved as template' : 'Save as template'}
          </button>
        </div>

        {/* Download / paywall */}
        <div className="flex-shrink-0 border-t p-4 space-y-2" style={{ borderColor: '#E5E5E2', backgroundColor: '#FFFFFF' }}>
          {sigError && (
            <div className="flex items-start gap-2 px-3 py-2.5 text-xs border mb-2" style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA', color: '#991B1B' }}>
              <span className="font-bold flex-shrink-0">!</span>
              <span>{sigError}</span>
            </div>
          )}
          {/* Payment choice modal */}
          <AnimatePresence>
            {showPaymentModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                onClick={() => setShowPaymentModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="w-full max-w-md border shadow-xl"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E2' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#E5E5E2' }}>
                    <h3 className="font-display text-lg font-bold" style={{ color: '#1B4332' }}>Choose how to pay</h3>
                    <button onClick={() => setShowPaymentModal(false)} className="p-1 hover:opacity-70" style={{ color: '#9CA3AF' }}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal content */}
                  <div className="p-5 space-y-4">
                    {/* One-time payment option */}
                    <button
                      onClick={async () => {
                        setShowPaymentModal(false)
                        setCheckoutLoading(true)
                        await onCheckout(contract.id)
                        setCheckoutLoading(false)
                      }}
                      disabled={checkoutLoading}
                      className="w-full border-2 p-4 text-left hover:border-[#2D6A4F] transition-colors group"
                      style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold mb-1" style={{ color: '#1B4332' }}>Pay once</p>
                          <p className="text-sm" style={{ color: '#6B7280' }}>Download this contract only</p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-2xl font-bold" style={{ color: '#1B4332' }}>£7</p>
                          <p className="text-xs" style={{ color: '#9CA3AF' }}>one-time</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <Check className="w-3.5 h-3.5" style={{ color: '#52B788' }} />
                        <span className="text-xs" style={{ color: '#6B7280' }}>PDF + Word download</span>
                      </div>
                    </button>

                    {/* Pro subscription option */}
                    <button
                      onClick={async () => {
                        setSubscribeLoading(true)
                        await onSubscribe()
                        setSubscribeLoading(false)
                      }}
                      disabled={subscribeLoading}
                      className="w-full border-2 p-4 text-left transition-colors relative overflow-hidden"
                      style={{ borderColor: '#2D6A4F', backgroundColor: '#1B4332' }}
                    >
                      <div className="absolute top-0 right-0 px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: '#52B788', color: '#1B4332' }}>
                        BEST VALUE
                      </div>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold mb-1 text-white">Go Pro</p>
                          <p className="text-sm" style={{ color: '#D8F3DC' }}>Unlimited contracts</p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-2xl font-bold text-white">£19</p>
                          <p className="text-xs" style={{ color: '#D8F3DC' }}>/month</p>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1.5">
                        {['Up to 20 contracts/day', 'All 8 contract types', 'Cancel any time'].map((f) => (
                          <div key={f} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5" style={{ color: '#52B788' }} />
                            <span className="text-xs text-white">{f}</span>
                          </div>
                        ))}
                      </div>
                      {subscribeLoading && (
                        <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(27,67,50,0.9)' }}>
                          <Loader2 className="w-5 h-5 animate-spin text-white" />
                        </div>
                      )}
                    </button>

                    <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>
                      Secure payment via Stripe · Cancel any time
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {contract.status === 'completed' ? (
            <a href={`/download/${contract.id}`} className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: '#2D6A4F' }}>
              <Download className="w-4 h-4" /> Download PDF + Word
            </a>
          ) : contract.status === 'sent' ? (
            /* Already sent — allow edit and resend */
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-3 py-2 border" style={{ borderColor: '#DBEAFE', backgroundColor: '#EFF6FF' }}>
                <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#1E40AF' }} />
                <p className="text-xs font-medium" style={{ color: '#1E40AF' }}>Sent to {contract.party2 || 'client'} — awaiting signature</p>
              </div>
              
              {!isEditMode ? (
                /* Locked state — show unlock button */
                <>
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold border-2 transition-colors hover:bg-[#D8F3DC]"
                    style={{ borderColor: '#2D6A4F', color: '#2D6A4F', backgroundColor: 'transparent' }}
                  >
                    <Pen className="w-4 h-4" /> Edit Contract
                  </button>
                  <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>
                    Unlock to make changes, then resend to your client
                  </p>
                </>
              ) : hasUnsavedChanges ? (
                /* Unlocked with changes — show resend button */
                <>
                  <button
                    onClick={async () => {
                      if (!senderReady) {
                        const missing: string[] = []
                        if (sigState.sig1Empty) missing.push('signature')
                        if (!sigState.name1.trim()) missing.push('full name')
                        if (!sigState.date1) missing.push('date')
                        setSigError(`Please complete your ${missing.join(', ')} before resending.`)
                        return
                      }
                      const dataUrl = sigState.getDataUrl?.()
                      if (!dataUrl) {
                        setSigError('Please provide your signature before resending.')
                        return
                      }
                      setSigError(null)
                      setCheckoutLoading(true)
                      await onSend(contract.id, true, {
                        dataUrl,
                        printedName: sigState.name1.trim(),
                        signedAt: new Date(sigState.date1).toISOString(),
                      })
                      setCheckoutLoading(false)
                      setHasUnsavedChanges(false)
                      setIsEditMode(false)
                    }}
                    disabled={checkoutLoading}
                    className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                    style={{ backgroundColor: '#2D6A4F' }}
                  >
                    {checkoutLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending&hellip;</> : <><RotateCcw className="w-4 h-4" /> Save & Resend Contract</>}
                  </button>
                  <button
                    onClick={() => { setIsEditMode(false); setHasUnsavedChanges(false) }}
                    className="flex items-center justify-center gap-2 w-full py-2 text-xs font-medium transition-opacity hover:opacity-70"
                    style={{ color: '#6B7280' }}
                  >
                    Cancel changes
                  </button>
                </>
              ) : (
                /* Unlocked but no changes yet */
                <>
                  <div className="flex items-center gap-2 px-3 py-2 border" style={{ borderColor: '#D1FAE5', backgroundColor: '#ECFDF5' }}>
                    <Pen className="w-4 h-4 flex-shrink-0" style={{ color: '#065F46' }} />
                    <p className="text-xs font-medium" style={{ color: '#065F46' }}>Edit mode — make your changes above</p>
                  </div>
                  <button
                    onClick={() => setIsEditMode(false)}
                    className="flex items-center justify-center gap-2 w-full py-2 text-xs font-medium transition-opacity hover:opacity-70"
                    style={{ color: '#6B7280' }}
                  >
                    Cancel editing
                  </button>
                </>
              )}
            </div>
          ) : !session ? (
            /* Require sign-in to send contracts */
            <div className="text-center">
              <div className="flex items-center gap-2 justify-center mb-3 px-3 py-2 border" style={{ borderColor: '#FCD34D', backgroundColor: '#FFFBEB' }}>
                <Lock className="w-4 h-4 flex-shrink-0" style={{ color: '#92400E' }} />
                <p className="text-xs font-medium" style={{ color: '#92400E' }}>Sign in to send contracts and track responses</p>
              </div>
              <a
                href="/auth/signin"
                className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-white"
                style={{ backgroundColor: '#2D6A4F' }}
              >
                Sign in to continue
              </a>
              <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>
                Your contracts will be saved to your account
              </p>
            </div>
          ) : isSubscribed ? (
            /* Pro subscriber — no payment needed */
            <>
              <button
                onClick={async () => {
                  if (!senderReady) {
                    const missing: string[] = []
                    if (sigState.sig1Empty) missing.push('signature')
                    if (!sigState.name1.trim()) missing.push('full name')
                    if (!sigState.date1) missing.push('date')
                    setSigError(`Please complete your ${missing.join(', ')} before sending.`)
                    return
                  }
                  const dataUrl = sigState.getDataUrl?.()
                  if (!dataUrl) {
                    setSigError('Please provide your signature before sending.')
                    return
                  }
                  setSigError(null)
                  setCheckoutLoading(true)
                  await onSend(contract.id, false, {
                    dataUrl,
                    printedName: sigState.name1.trim(),
                    signedAt: new Date(sigState.date1).toISOString(),
                  })
                  setCheckoutLoading(false)
                }}
                disabled={checkoutLoading}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: '#2D6A4F' }}
              >
                {checkoutLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending&hellip;</> : <><ArrowRight className="w-4 h-4" /> Sign &amp; Send</>}
              </button>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <div className="w-2 h-2" style={{ backgroundColor: '#52B788', borderRadius: '50%' }} />
                <p className="text-xs font-medium" style={{ color: '#52B788' }}>Pro plan — no charge</p>
              </div>
            </>
          ) : (
            /* Non-subscriber — show payment options */
            <>
              <button
                onClick={async () => {
                  if (!senderReady) {
                    const missing: string[] = []
                    if (sigState.sig1Empty) missing.push('signature')
                    if (!sigState.name1.trim()) missing.push('full name')
                    if (!sigState.date1) missing.push('date')
                    setSigError(`Please complete your ${missing.join(', ')} before sending.`)
                    return
                  }
                  const dataUrl = sigState.getDataUrl?.()
                  if (!dataUrl) {
                    setSigError('Please provide your signature before sending.')
                    return
                  }
                  setSigError(null)
                  setCheckoutLoading(true)
                  try {
                    // Persist signature BEFORE opening payment modal so it
                    // survives the Stripe redirect.
                    const intakeData = contract.intakeData ?? {}
                    const saveRes = await fetch('/api/contract/sign-owner', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        contractId: contract.id,
                        signatureDataUrl: dataUrl,
                        printedName: sigState.name1.trim(),
                        signedAt: new Date(sigState.date1).toISOString(),
                        title: contract.title,
                        content: contract.content,
                        contractType: contract.typeId,
                        docFont: contract.docStyle?.font,
                        party1: {
                          name: contract.party1,
                          email: contract.party1Email,
                          company: String(intakeData.yourBusinessName ?? ''),
                          address: String(intakeData.yourAddress ?? ''),
                        },
                        party2: {
                          name: contract.party2,
                          email: contract.party2Email,
                          company: String(intakeData.theirContactName ?? ''),
                          address: String(intakeData.theirAddress ?? ''),
                        },
                      }),
                    })
                    if (!saveRes.ok && saveRes.status !== 409) {
                      const data = await saveRes.json().catch(() => ({}))
                      throw new Error(data.error ?? 'Could not save signature')
                    }
                    setShowPaymentModal(true)
                  } catch (e) {
                    setSigError(e instanceof Error ? e.message : 'Could not save signature')
                  } finally {
                    setCheckoutLoading(false)
                  }
                }}
                disabled={checkoutLoading}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: '#2D6A4F' }}
              >
                {checkoutLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Preparing&hellip;</> : <><ArrowRight className="w-4 h-4" /> Sign &amp; Send</>}
              </button>
              <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>
                {senderReady ? 'Ready to send' : 'Complete your signature below to send'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AppDashboard() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [step, setStep] = useState<Step>(1)
  const [selectedType, setSelectedType] = useState<ContractType | null>(null)
  const [, setIntakeData] = useState<IntakeData | null>(null)
  const [loadingMsg, setLoadingMsg] = useState(0)
  const [contractId, setContractId] = useState<string | null>(null)
  const [contractContent, setContractContent] = useState<string | null>(null)
  const [contractTitle, setContractTitle] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [subLoading, setSubLoading] = useState(false)
  const [subscribeSuccess, setSubscribeSuccess] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [templateToast, setTemplateToast] = useState<'saved' | 'removed' | null>(null)
  const [sendToast, setSendToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [sentModal, setSentModal] = useState<{ contractTitle: string; recipientName: string; recipientEmail: string; isResend?: boolean } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [savedContracts, setSavedContracts] = useState<SavedContract[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [viewingContractId, setViewingContractId] = useState<string | null>(null)

  useEffect(() => { setSavedContracts(loadSaved()) }, [])
  useEffect(() => { setNotifications(loadNotifications()) }, [])

  // Check subscription status
  useEffect(() => {
    fetch('/api/subscription/status')
      .then(r => r.json())
      .then(d => { if (d.active) setIsSubscribed(true) })
      .catch(() => {})
  }, [])

  // Check for subscribed=true param after Stripe redirect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('subscribed') === 'true') {
        setSubscribeSuccess(true)
        setIsSubscribed(true)
        window.history.replaceState({}, '', '/app')
        setTimeout(() => setSubscribeSuccess(false), 8000)
      }
    }
  }, [])

  const handleSubscribe = async () => {
    setSubLoading(true)
    try {
      const res = await fetch('/api/checkout/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session?.user?.email ?? undefined }),
      })
      const data = await res.json()
      console.log('Subscription response:', data)
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('No URL in response:', data)
        alert('Checkout failed: ' + (data.error || 'No checkout URL returned'))
      }
    } catch (err) {
      console.error('Subscription error:', err)
      alert('Checkout failed. Please try again.')
    } finally {
      setSubLoading(false)
    }
  }

  // Send contract to client (Pro users or after payment)
  const handleSendContract = async (
    contractId: string,
    resend = false,
    senderSig?: { dataUrl: string; printedName: string; signedAt: string },
  ) => {
    const contract = savedContracts.find(c => c.id === contractId)
    if (!contract) return

    const intake = contract.intakeData ?? {}

    try {
      const res = await fetch('/api/send-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId,
          resend,
          recipientEmail: contract.party2Email,
          recipientName: contract.party2,
          recipientCompany: (intake.theirContactName as string) || '',
          recipientAddress: (intake.theirAddress as string) || '',
          content: contract.content,
          title: contract.title,
          senderName: contract.party1,
          senderEmail: contract.party1Email,
          senderCompany: (intake.yourBusinessName as string) || '',
          senderAddress: (intake.yourAddress as string) || '',
          contractType: contract.typeId,
          docFont: contract.docStyle?.font,
          senderSignature: senderSig,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to send contract')
      }

      // Update contract status to 'sent'
      const updated = savedContracts.map(c =>
        c.id === contractId
          ? { ...c, status: 'sent' as const, sentAt: new Date().toISOString() }
          : c
      )
      setSavedContracts(updated)
      persistSaved(updated)

      // Show success modal
      setSentModal({
        contractTitle: contract.title,
        recipientName: contract.party2 || 'your client',
        recipientEmail: contract.party2Email || '',
        isResend: resend,
      })
      
      // Add notification (only for first send)
      if (!resend) {
        const newNotif: Notification = {
          id: `notif-${Date.now()}`,
          type: 'contract_sent',
          title: 'Contract sent',
          message: `"${contract.title}" sent to ${contract.party2 || 'client'}`,
          contractId,
          createdAt: new Date().toISOString(),
          read: true, // Already seeing the modal, so mark as read
        }
        const updatedNotifs = [newNotif, ...notifications]
        setNotifications(updatedNotifs)
        persistNotifications(updatedNotifs)
      }
    } catch (err) {
      console.error('Send contract error:', err)
      setSendToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to send contract' })
      setTimeout(() => setSendToast(null), 5000)
    }
  }

  // Loading message cycle
  useEffect(() => {
    if (step !== 3) return
    const t = setInterval(() => setLoadingMsg((v) => Math.min(v + 1, LOADING_MESSAGES.length - 1)), 1800)
    return () => clearInterval(t)
  }, [step])

  const navigate = (tab: Tab) => {
    setActiveTab(tab)
    setSidebarOpen(false)
    if (tab === 'new-contract') handleReset()
  }

  const handleSelectType = (type: ContractType) => {
    setSelectedType(type)
    setStep(2)
    setActiveTab('new-contract')
  }

  const handleGenerate = async (intake: IntakeData) => {
    if (!selectedType) return
    setIntakeData(intake)
    setError(null)
    setLoadingMsg(0)
    setStep(3)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractType: selectedType.id,
          fields: intake,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Generation failed')
      }
      const data = await res.json()
      // API returns contractId (not id)
      const id = data.contractId ?? data.id
      setContractId(id)
      setContractContent(data.content)
      setContractTitle(data.title)
      setStep(4)

      // Persist to localStorage
      const entry: SavedContract = {
        id,
        title: data.title ?? selectedType.title,
        typeId: selectedType.id,
        typeName: selectedType.title,
        party1: ((intake.yourFullName ?? intake.yourName) as string) ?? '',
        party2: (intake.theirName as string) ?? '',
        party1Email: (intake.yourEmail as string) ?? '',
        party2Email: (intake.theirEmail as string) ?? '',
        status: 'draft',
        createdAt: new Date().toISOString(),
        content: data.content,
        intakeData: intake as unknown as Record<string, string | string[]>,
      }
      const updated = [entry, ...loadSaved()]
      persistSaved(updated)
      setSavedContracts(updated)

      // Navigate to contract viewer
      setViewingContractId(id)
      setActiveTab('contract-view')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStep(2)
    }
  }

  const handleCheckout = async () => {
    if (!contractId) return
    setCheckoutLoading(true)
    try {
      await initiateCheckout(contractId)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
      setCheckoutLoading(false)
    }
  }

  const handleReset = () => {
    setStep(1)
    setSelectedType(null)
    setIntakeData(null)
    setContractId(null)
    setContractContent(null)
    setContractTitle(null)
    setError(null)
    setLoadingMsg(0)
    setCheckoutLoading(false)
  }

  const stats = {
    total: savedContracts.length,
    generated: savedContracts.filter((c) => c.status === 'draft').length,
    paid: savedContracts.filter((c) => c.status === 'completed').length,
  }

  // filtered is used inside MyContractsTab — kept for search propagation

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: '#FAFAF8' }}>

      {/* ── UK TRUST BANNER (full width) ── */}
      <div className="flex items-center justify-center gap-3 px-4 py-2 text-xs font-medium flex-shrink-0 w-full" style={{ backgroundColor: '#1B4332', color: '#D8F3DC' }}>
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
          UK law only
        </span>
        <span style={{ color: '#52B788' }}>·</span>
        <span>IR35-aware</span>
        <span style={{ color: '#52B788' }}>·</span>
        <span>Solicitor-reviewed</span>
        <span style={{ color: '#52B788' }}>·</span>
        <span>Not a template — bespoke every time</span>
        <span style={{ color: '#52B788' }}>·</span>
        <span className="font-bold" style={{ color: '#52B788' }}>£7 to download</span>
      </div>

      <div className="flex flex-1 overflow-hidden">

      {/* ── SIDEBAR ── */}
      <aside
        className={cn(
          'flex-shrink-0 flex flex-col h-full z-40 transition-transform duration-200',
          'w-[220px] border-r',
          'max-md:fixed max-md:top-0 max-md:left-0 max-md:shadow-xl',
          sidebarOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full',
        )}
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E2' }}
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
            const unreadCount = item.id === 'notifications' ? notifications.filter(n => !n.read).length : 0
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all text-left border-l-2',
                  isActive ? '' : 'hover:bg-[#FAFAF8] border-l-transparent',
                )}
                style={isActive ? { backgroundColor: '#EDFAF2', color: '#1B4332', borderLeftColor: '#2D6A4F' } : { color: '#6B7280' }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: isActive ? '#2D6A4F' : '#9CA3AF' }} />
                <span className="flex-1">{item.label}</span>
                {unreadCount > 0 && (
                  <span className="w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: '#EF4444', borderRadius: '50%' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Upgrade nudge / Pro badge */}
        {isSubscribed ? (
          <div className="mx-3 mb-3 p-3 border" style={{ backgroundColor: '#EDFAF2', borderColor: '#52B78840' }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 flex-shrink-0" style={{ backgroundColor: '#52B788', borderRadius: '50%' }} />
              <p className="text-xs font-bold" style={{ color: '#1B4332' }}>Pro plan active</p>
            </div>
            <p className="text-xs mt-1" style={{ color: '#52B788' }}>Up to 20 contracts/day</p>
          </div>
        ) : (
          <div className="mx-3 mb-3 p-3 border" style={{ backgroundColor: '#EDFAF2', borderColor: '#52B78840' }}>
            <p className="text-xs font-semibold mb-0.5" style={{ color: '#1B4332' }}>Pro plan</p>
            <p className="text-xs mb-2" style={{ color: '#52B788' }}>&pound;19/mo &mdash; up to 20/day</p>
            <button
              onClick={handleSubscribe}
              disabled={subLoading}
              className="w-full py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-1"
              style={{ backgroundColor: '#2D6A4F' }}
            >
              {subLoading ? <><Loader2 className="w-3 h-3 animate-spin" /> Loading…</> : 'Upgrade'}
            </button>
          </div>
        )}

        {/* Account section */}
        <div className="border-t flex-shrink-0" style={{ borderColor: '#E5E5E2' }}>
          {session ? (
            <div className="px-4 py-3">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: '#2D6A4F' }}>
                  {(session.user?.name ?? session.user?.email ?? 'U').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate" style={{ color: '#1B4332' }}>{session.user?.name ?? 'User'}</p>
                  <p className="text-xs truncate" style={{ color: '#9CA3AF' }}>{session.user?.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate('subscription')} className="flex-1 text-xs font-medium py-1.5 border hover:bg-[#FAFAF8] transition-colors" style={{ borderColor: '#E5E5E2', color: '#6B7280' }}>
                  Settings
                </button>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="flex-1 text-xs font-medium py-1.5 border hover:bg-[#FAFAF8] transition-colors" style={{ borderColor: '#E5E5E2', color: '#6B7280' }}>
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4 py-3">
              <Link href="/auth/signin" className="w-full flex items-center justify-center py-2 text-xs font-semibold text-white" style={{ backgroundColor: '#2D6A4F' }}>
                Sign in
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="md:hidden fixed inset-0 z-30 bg-black/20" onClick={() => setSidebarOpen(false)} />}

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 h-12 border-b flex-shrink-0 bg-white" style={{ borderColor: '#E5E5E2' }}>
          <button className="md:hidden p-1 text-gray-500" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Search */}
          <div className="flex-1 flex items-center gap-2 border px-3 py-1.5 max-w-md" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
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

          <div className="ml-auto flex items-center gap-2">
            {session ? (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: '#2D6A4F' }} title={session.user?.email ?? ''}>
                  {(session.user?.name ?? session.user?.email ?? 'U').slice(0, 2).toUpperCase()}
                </div>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="text-xs hover:opacity-70 hidden sm:block" style={{ color: '#9CA3AF' }}>
                  Sign out
                </button>
              </div>
            ) : (
              <Link href="/auth/signin" className="text-xs font-semibold px-3 py-1.5 border hover:bg-[#D8F3DC]" style={{ borderColor: '#2D6A4F', color: '#2D6A4F' }}>
                Sign in
              </Link>
            )}
          </div>
        </div>

        {/* Template saved toast */}
        <AnimatePresence>
          {templateToast && (
            <motion.div
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.2 }}
              className="fixed top-4 left-1/2 z-50 flex items-center gap-3 px-5 py-3 shadow-lg border"
              style={{ transform: 'translateX(-50%)', backgroundColor: '#1B4332', borderColor: '#2D6A4F', color: '#FFFFFF', minWidth: 280 }}
            >
              <Bookmark className="w-4 h-4 flex-shrink-0" style={{ color: '#52B788' }} />
              <div className="flex-1">
                {templateToast === 'saved' ? (
                  <>
                    <p className="text-sm font-semibold">Template saved</p>
                    <p className="text-xs mt-0.5" style={{ color: '#D8F3DC' }}>Find it in the Templates tab under &ldquo;My saved templates&rdquo;</p>
                  </>
                ) : (
                  <p className="text-sm font-semibold">Template removed</p>
                )}
              </div>
              <button onClick={() => setTemplateToast(null)} className="ml-2 hover:opacity-70" style={{ color: '#9CA3AF' }}>
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
          {sendToast && (
            <motion.div
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.2 }}
              className="fixed top-4 left-1/2 z-50 flex items-center gap-3 px-5 py-3 shadow-lg border"
              style={{
                transform: 'translateX(-50%)',
                backgroundColor: sendToast.type === 'success' ? '#1B4332' : '#991B1B',
                borderColor: sendToast.type === 'success' ? '#2D6A4F' : '#EF4444',
                color: '#FFFFFF',
                minWidth: 280
              }}
            >
              {sendToast.type === 'success' ? (
                <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#52B788' }} />
              ) : (
                <X className="w-4 h-4 flex-shrink-0" style={{ color: '#FCA5A5' }} />
              )}
              <p className="text-sm font-semibold flex-1">{sendToast.message}</p>
              <button onClick={() => setSendToast(null)} className="ml-2 hover:opacity-70" style={{ color: '#9CA3AF' }}>
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contract sent success modal */}
        <AnimatePresence>
          {sentModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
              onClick={() => setSentModal(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-full max-w-md border shadow-xl"
                style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E2' }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Success header */}
                <div className="px-6 py-5 text-center border-b" style={{ borderColor: '#E5E5E2', backgroundColor: '#D8F3DC' }}>
                  <div className="w-14 h-14 mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: '#1B4332', borderRadius: '50%' }}>
                    <Check className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-1" style={{ color: '#1B4332' }}>{sentModal.isResend ? 'Contract resent!' : 'Contract sent!'}</h3>
                  <p className="text-sm" style={{ color: '#2D6A4F' }}>{sentModal.isResend ? 'Your updated contract is on its way' : 'Your contract is on its way'}</p>
                </div>

                {/* Details */}
                <div className="px-6 py-5">
                  <div className="border p-4 mb-4" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
                    <p className="text-sm font-semibold mb-2" style={{ color: '#1B4332' }}>{sentModal.contractTitle}</p>
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#6B7280' }}>
                      <span>Sent to:</span>
                      <span className="font-medium" style={{ color: '#374151' }}>{sentModal.recipientName}</span>
                      {sentModal.recipientEmail && (
                        <span style={{ color: '#9CA3AF' }}>({sentModal.recipientEmail})</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 mb-5">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#FEF3C7', borderRadius: '50%' }}>
                        <span className="text-xs font-bold" style={{ color: '#92400E' }}>1</span>
                      </div>
                      <p className="text-sm" style={{ color: '#374151' }}>
                        <strong style={{ color: '#1B4332' }}>Pending signature</strong> — waiting for {sentModal.recipientName} to review and sign
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#E5E5E2', borderRadius: '50%' }}>
                        <span className="text-xs font-bold" style={{ color: '#6B7280' }}>2</span>
                      </div>
                      <p className="text-sm" style={{ color: '#6B7280' }}>
                        You&apos;ll be notified when they sign
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSentModal(null)
                        setActiveTab('my-contracts')
                        setViewingContractId(null)
                      }}
                      className="flex-1 py-2.5 text-sm font-semibold text-white"
                      style={{ backgroundColor: '#2D6A4F' }}
                    >
                      View sent contracts
                    </button>
                    <button
                      onClick={() => setSentModal(null)}
                      className="flex-1 py-2.5 text-sm font-medium border"
                      style={{ borderColor: '#E5E5E2', color: '#6B7280' }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subscription success banner */}
        {subscribeSuccess && (
          <div className="flex items-center justify-between px-4 py-2.5 text-sm font-medium flex-shrink-0" style={{ backgroundColor: '#52B788', color: '#FFFFFF' }}>
            <span>✓ Subscription active — you can now generate up to 20 contracts per day.</span>
            <button onClick={() => setSubscribeSuccess(false)} className="ml-4 text-white hover:opacity-70 text-xs font-bold">✕</button>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-white">
          <AnimatePresence mode="wait">

            {/* ── HOME ── */}
            {activeTab === 'home' && (
              <motion.div key="home" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="font-display text-2xl font-bold" style={{ color: '#1B4332' }}>Welcome back</h1>
                    <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>Generate a UK-compliant contract in under 2 minutes.</p>
                  </div>
                  <button
                    onClick={() => navigate('new-contract')}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#2D6A4F' }}
                  >
                    <Plus className="w-4 h-4" /> New Contract
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 border mb-8" style={{ borderColor: '#E5E5E2' }}>
                  {[
                    { label: 'Contracts generated', value: stats.total },
                    { label: 'Awaiting download', value: stats.generated },
                    { label: 'Downloaded', value: stats.paid },
                  ].map((s, i) => (
                    <div key={i} className={cn('p-4', i !== 2 && 'border-r')} style={{ borderColor: '#E5E5E2' }}>
                      <p className="text-xs font-medium mb-1" style={{ color: '#9CA3AF' }}>{s.label}</p>
                      <p className="font-display text-2xl font-bold" style={{ color: '#1B4332' }}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Quick-start contract types */}
                <div className="mb-8">
                  <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>Quick start</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {CONTRACT_TYPES.slice(0, 4).map((c) => {
                      const Icon = c.Icon
                      return (
                        <button
                          key={c.id}
                          onClick={() => handleSelectType(c)}
                          className="flex items-center gap-3 p-3 border text-left hover:border-[#2D6A4F] hover:bg-[#FAFAF8] transition-all"
                          style={{ borderColor: '#E5E5E2', backgroundColor: '#FFFFFF' }}
                        >
                          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#D8F3DC' }}>
                            <Icon className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                          </div>
                          <span className="text-xs font-semibold leading-snug" style={{ color: '#1B4332' }}>{c.title}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Recent contracts */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Recent contracts</h2>
                    {savedContracts.length > 0 && (
                      <button onClick={() => navigate('my-contracts')} className="text-xs font-medium hover:opacity-70" style={{ color: '#2D6A4F' }}>
                        View all
                      </button>
                    )}
                  </div>

                  {savedContracts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center border" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
                      <div className="w-12 h-12 flex items-center justify-center mb-4" style={{ backgroundColor: '#D8F3DC' }}>
                        <FileText className="w-6 h-6" style={{ color: '#2D6A4F' }} />
                      </div>
                      <h3 className="font-display text-base font-bold mb-2" style={{ color: '#1B4332' }}>No contracts yet</h3>
                      <p className="text-sm mb-4 max-w-xs" style={{ color: '#6B7280' }}>Generate your first contract in under 2 minutes.</p>
                      <button
                        onClick={() => navigate('new-contract')}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: '#2D6A4F' }}
                      >
                        <Plus className="w-4 h-4" /> Create contract
                      </button>
                    </div>
                  ) : (
                    <div className="border" style={{ borderColor: '#E5E5E2' }}>
                      {savedContracts.slice(0, 5).map((c, i) => (
                        <div key={c.id} className={cn('flex items-center gap-4 px-4 py-3 hover:bg-[#FAFAF8] transition-colors', i !== 0 && 'border-t')} style={{ borderColor: '#E5E5E2' }}>
                          <button onClick={() => { setViewingContractId(c.id); setActiveTab('contract-view') }} className="flex items-center gap-4 flex-1 min-w-0 text-left">
                            <FileText className="w-4 h-4 flex-shrink-0" style={{ color: '#9CA3AF' }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate" style={{ color: '#1B4332' }}>{c.title}</p>
                              <p className="text-xs" style={{ color: '#9CA3AF' }}>{c.typeName}</p>
                            </div>
                          </button>
                          <StatusBadge status={c.status} />
                          <span className="text-xs flex-shrink-0 hidden sm:block" style={{ color: '#9CA3AF' }}>{fmtDate(c.createdAt)}</span>
                          <ContractRowMenu
                            contract={c}
                            onDelete={(id) => {
                              const next = savedContracts.filter(s => s.id !== id)
                              setSavedContracts(next); persistSaved(next)
                            }}
                            onSaveTemplate={(id) => {
                              const isNowTemplate = !savedContracts.find(s => s.id === id)?.isTemplate
                              const next = savedContracts.map(s => s.id === id ? { ...s, isTemplate: isNowTemplate } : s)
                              setSavedContracts(next); persistSaved(next)
                              setTemplateToast(isNowTemplate ? 'saved' : 'removed')
                              setTimeout(() => setTemplateToast(null), 3500)
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── NEW CONTRACT ── */}
            {activeTab === 'new-contract' && (
              <motion.div key="new-contract" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="p-6 lg:p-8">

                {/* Step 1: Choose type */}
                {step === 1 && (
                  <div>
                    <h1 className="font-display text-2xl font-bold mb-1" style={{ color: '#1B4332' }}>New contract</h1>
                    <p className="text-sm mb-6" style={{ color: '#6B7280' }}>Choose a contract type to get started.</p>
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
                            <div className="w-9 h-9 flex items-center justify-center mb-3" style={{ backgroundColor: '#D8F3DC' }}>
                              <Icon className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                            </div>
                            <span className="text-sm font-semibold mb-1 leading-snug" style={{ color: '#1B4332' }}>{type.title}</span>
                            <span className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>{type.description}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Step 2: Intake Wizard */}
                {step === 2 && selectedType && (
                  <IntakeWizard
                    contractTypeId={selectedType.id}
                    contractTypeTitle={selectedType.title}
                    onComplete={handleGenerate}
                    onBack={() => setStep(1)}
                  />
                )}

                {/* Step 3: Loading */}
                {step === 3 && (
                  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} className="mb-6">
                      <Loader2 className="w-10 h-10" style={{ color: '#2D6A4F' }} />
                    </motion.div>
                    <AnimatePresence mode="wait">
                      <motion.p key={loadingMsg} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="font-display text-xl font-bold mb-2" style={{ color: '#1B4332' }}>
                        {LOADING_MESSAGES[loadingMsg]}
                      </motion.p>
                    </AnimatePresence>
                    <p className="text-sm mb-6" style={{ color: '#6B7280' }}>ClauseKit is generating your bespoke UK contract&hellip;</p>
                    <div className="w-56 overflow-hidden h-1" style={{ backgroundColor: '#E5E5E2' }}>
                      <motion.div className="h-full" style={{ backgroundColor: '#2D6A4F' }} initial={{ width: '5%' }} animate={{ width: '90%' }} transition={{ duration: 6, ease: 'easeInOut' }} />
                    </div>
                    <p className="text-xs mt-4" style={{ color: '#9CA3AF' }}>Usually takes 20&ndash;40 seconds</p>
                  </div>
                )}

                {/* Step 4: Preview + Paywall */}
                {step === 4 && contractContent && (
                  <div className="max-w-2xl">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6 gap-4">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold mb-2" style={{ backgroundColor: '#D8F3DC', color: '#1B4332' }}>
                          <Check className="w-3 h-3" style={{ color: '#2D6A4F' }} /> Generated
                        </div>
                        <h1 className="font-display text-2xl font-bold" style={{ color: '#1B4332' }}>{contractTitle ?? 'Your Contract'}</h1>
                        <p className="text-sm" style={{ color: '#6B7280' }}>UK law &middot; {selectedType?.title}</p>
                      </div>
                      <button onClick={handleReset} className="flex-shrink-0 text-xs font-medium px-3 py-1.5 border hover:opacity-70 transition-opacity" style={{ borderColor: '#E5E5E2', color: '#6B7280' }}>
                        Start over
                      </button>
                    </div>

                    {/* What you get callout */}
                    <div className="border p-4 mb-5 flex gap-4" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
                      <div className="flex-1 space-y-1.5">
                        {['Full UK-compliant contract', 'PDF ready to sign', 'Editable Word (.docx)', 'IR35 &amp; GDPR clauses included'].map((f) => (
                          <div key={f} className="flex items-center gap-2 text-sm">
                            <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#52B788' }} strokeWidth={3} />
                            <span dangerouslySetInnerHTML={{ __html: f }} style={{ color: '#374151' }} />
                          </div>
                        ))}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="font-display text-3xl font-bold" style={{ color: '#1B4332' }}>&pound;7</p>
                        <p className="text-xs" style={{ color: '#9CA3AF' }}>one-time</p>
                      </div>
                    </div>

                    {/* Document preview with blur */}
                    <div className="border overflow-hidden relative mb-4" style={{ borderColor: '#E5E5E2', backgroundColor: '#FFFFFF' }}>
                      {/* Visible preview */}
                      <div className="px-6 pt-6 pb-2">
                        <pre className="text-xs leading-relaxed font-mono whitespace-pre-wrap" style={{ color: '#1A1A1A' }}>
                          {contractContent.slice(0, 500)}
                        </pre>
                      </div>

                      {/* Blurred section */}
                      <div className="relative">
                        <div className="px-6 pt-2 pb-6" style={{ filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none' }}>
                          <pre className="text-xs leading-relaxed font-mono whitespace-pre-wrap" style={{ color: '#1A1A1A' }}>
                            {contractContent.slice(500, 1300)}
                          </pre>
                        </div>

                        {/* Paywall overlay */}
                        <div
                          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
                          style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.9) 30%, rgba(255,255,255,0.98) 60%)' }}
                        >
                          <div className="w-10 h-10 flex items-center justify-center mb-3" style={{ backgroundColor: '#D8F3DC' }}>
                            <Eye className="w-5 h-5" style={{ color: '#2D6A4F' }} />
                          </div>
                          <h3 className="font-display text-base font-bold mb-1" style={{ color: '#1B4332' }}>Your contract is ready</h3>
                          <p className="text-sm mb-5 max-w-xs" style={{ color: '#6B7280' }}>
                            Unlock the full contract &mdash; download as PDF and Word, ready to sign and send.
                          </p>
                          <button
                            onClick={handleCheckout}
                            disabled={checkoutLoading}
                            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 mb-2"
                            style={{ backgroundColor: '#2D6A4F' }}
                          >
                            {checkoutLoading ? (
                              <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting to payment&hellip;</>
                            ) : (
                              <><Download className="w-4 h-4" /> &pound;7 &mdash; Unlock full contract (PDF + Word)</>
                            )}
                          </button>
                          <p className="text-xs" style={{ color: '#9CA3AF' }}>Secure payment via Stripe &middot; Instant download</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <a href={`/preview/${contractId}`} className="inline-flex items-center gap-1.5 text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: '#2D6A4F' }}>
                        View full preview page <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── MY CONTRACTS ── */}
            {activeTab === 'my-contracts' && (
              <MyContractsTab
                savedContracts={savedContracts}
                searchQuery={searchQuery}
                onNew={() => navigate('new-contract')}
                onCheckout={initiateCheckout}
                onView={(id) => { setViewingContractId(id); setActiveTab('contract-view') }}
                onDelete={(id) => {
                  const next = savedContracts.filter(c => c.id !== id)
                  setSavedContracts(next)
                  persistSaved(next)
                }}
                onSaveTemplate={(id) => {
                  const isNowTemplate = !savedContracts.find(c => c.id === id)?.isTemplate
                  const next = savedContracts.map(c => c.id === id ? { ...c, isTemplate: isNowTemplate } : c)
                  setSavedContracts(next)
                  persistSaved(next)
                  setTemplateToast(isNowTemplate ? 'saved' : 'removed')
                  setTimeout(() => setTemplateToast(null), 3500)
                }}
              />
            )}

            {/* ── TEMPLATES ── */}
            {activeTab === 'templates' && (
              <motion.div key="templates" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="p-6 lg:p-8">
                <div className="mb-6">
                  <h1 className="font-display text-2xl font-bold mb-1" style={{ color: '#1B4332' }}>Contract templates</h1>
                  <p className="text-sm" style={{ color: '#6B7280' }}>8 UK-compliant contract templates. Click any to generate instantly.</p>
                </div>

                {/* Saved templates */}
                {savedContracts.filter(c => c.isTemplate).length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>My saved templates</h2>
                    <div className="border" style={{ borderColor: '#E5E5E2' }}>
                      <div className="flex items-center gap-4 px-4 py-2 border-b text-[10px] font-bold uppercase tracking-widest" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8', color: '#9CA3AF' }}>
                        <div className="flex-1">Template</div>
                        <div className="text-right">Actions</div>
                      </div>
                      {savedContracts.filter(c => c.isTemplate).map((c, i) => (
                        <div key={c.id} className={cn('flex items-center gap-4 px-4 py-3.5 hover:bg-[#FAFAF8] transition-colors', i !== 0 && 'border-t')} style={{ borderColor: '#E5E5E2' }}>
                          <div className="w-9 h-9 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#D8F3DC' }}>
                            <Bookmark className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: '#1B4332' }}>{c.title}</p>
                            <p className="text-xs" style={{ color: '#9CA3AF' }}>{c.typeName} · Saved {fmtDate(c.createdAt)}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Use as starting point — clones the contract */}
                            <button
                              onClick={() => {
                                const clone: SavedContract = {
                                  ...c,
                                  id: crypto.randomUUID(),
                                  title: `${c.title} (copy)`,
                                  createdAt: new Date().toISOString(),
                                  status: 'draft',
                                  isTemplate: false,
                                  sentAt: undefined,
                                  completedAt: undefined,
                                }
                                const next = [clone, ...loadSaved()]
                                persistSaved(next)
                                setSavedContracts(next)
                                setViewingContractId(clone.id)
                                setActiveTab('contract-view')
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                              style={{ backgroundColor: '#2D6A4F' }}
                            >
                              <Plus className="w-3 h-3" /> Use template
                            </button>
                            <button onClick={() => { setViewingContractId(c.id); setActiveTab('contract-view') }} className="text-xs font-semibold flex items-center gap-1 hover:opacity-70 px-2 py-1.5 border" style={{ color: '#374151', borderColor: '#E5E5E2' }}>
                              <Eye className="w-3 h-3" /> View
                            </button>
                            <button
                              onClick={() => {
                                const next = savedContracts.map(s => s.id === c.id ? { ...s, isTemplate: false } : s)
                                setSavedContracts(next); persistSaved(next)
                              }}
                              className="text-xs font-medium hover:opacity-70 px-2 py-1.5" style={{ color: '#9CA3AF' }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>Standard templates</h2>
                <div className="border" style={{ borderColor: '#E5E5E2' }}>
                  <div className="flex items-center gap-4 px-4 py-2.5 border-b text-xs font-bold uppercase tracking-widest" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8', color: '#9CA3AF' }}>
                    <div className="flex-1">Template</div>
                    <div className="w-56 hidden lg:block">Description</div>
                    <div className="w-24 text-right">Action</div>
                  </div>
                  {CONTRACT_TYPES.map((type, i) => {
                    const Icon = type.Icon
                    return (
                      <div key={type.id} className={cn('flex items-center gap-4 px-4 py-4 hover:bg-[#FAFAF8] transition-colors', i !== 0 && 'border-t')} style={{ borderColor: '#E5E5E2' }}>
                        <div className="w-9 h-9 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#D8F3DC' }}>
                          <Icon className="w-4 h-4" style={{ color: '#2D6A4F' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold" style={{ color: '#1B4332' }}>{type.title}</p>
                        </div>
                        <div className="w-56 hidden lg:block">
                          <p className="text-xs truncate" style={{ color: '#6B7280' }}>{type.description}</p>
                        </div>
                        <div className="w-24 text-right">
                          <button onClick={() => handleSelectType(type)} className="text-xs font-semibold flex items-center gap-1 ml-auto hover:opacity-70 transition-opacity" style={{ color: '#2D6A4F' }}>
                            Generate <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-6 border p-4 flex items-center gap-4" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
                  <Zap className="w-5 h-5 flex-shrink-0" style={{ color: '#2D6A4F' }} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: '#1B4332' }}>All templates included in both plans</p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>Pay &pound;7 per contract, or &pound;19/month for unlimited access to every template.</p>
                  </div>
                  <button onClick={() => navigate('pricing')} className="flex-shrink-0 text-xs font-semibold hover:opacity-70 transition-opacity" style={{ color: '#2D6A4F' }}>
                    See pricing &rarr;
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── PRICING ── */}
            {activeTab === 'pricing' && (
              <motion.div key="pricing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="p-6 lg:p-8">
                <div className="mb-6">
                  <h1 className="font-display text-2xl font-bold mb-1" style={{ color: '#1B4332' }}>Pricing</h1>
                  <p className="text-sm" style={{ color: '#6B7280' }}>Generate for free. Pay only when you download.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mb-6">
                  {/* Pay per doc */}
                  <div className="border-2 p-7" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#9CA3AF' }}>Pay as you go</p>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="font-display text-5xl font-bold" style={{ color: '#1B4332' }}>&pound;7</span>
                      <span className="text-sm" style={{ color: '#6B7280' }}>/ contract</span>
                    </div>
                    <p className="text-sm mb-6" style={{ color: '#6B7280' }}>Generate and download one contract at a time.</p>
                    <ul className="space-y-2.5 mb-7">
                      {['Full UK-compliant contract', 'PDF + Word download', 'Tailored to your answers', 'No subscription needed'].map((f) => (
                        <li key={f} className="flex items-center gap-2.5 text-sm">
                          <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#52B788' }} strokeWidth={3} />
                          <span style={{ color: '#1A1A1A' }}>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => navigate('new-contract')} className="w-full py-2.5 text-sm font-semibold border-2 transition-colors hover:bg-[#D8F3DC]" style={{ borderColor: '#2D6A4F', color: '#2D6A4F', backgroundColor: 'transparent' }}>
                      Generate a contract
                    </button>
                  </div>

                  {/* Unlimited */}
                  <div className="border-2 p-7 relative text-white" style={{ borderColor: '#2D6A4F', backgroundColor: '#2D6A4F' }}>
                    <div className="absolute -top-3.5 left-5 px-3 py-0.5 text-xs font-bold" style={{ backgroundColor: '#52B788', color: '#1B4332' }}>Best value</div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#D8F3DC' }}>Unlimited</p>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="font-display text-5xl font-bold">&pound;19</span>
                      <span className="text-sm" style={{ color: '#D8F3DC' }}>/month</span>
                    </div>
                    <p className="text-sm mb-6" style={{ color: '#D8F3DC' }}>Generate up to 20 contracts per day — perfect for busy freelancers.</p>
                    <ul className="space-y-2.5 mb-7">
                      {['All 8 contract types', 'Up to 20 contracts/day', 'PDF + Word', 'Cancel any time'].map((f) => (
                        <li key={f} className="flex items-center gap-2.5 text-sm">
                          <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#52B788' }} strokeWidth={3} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={handleSubscribe}
                      disabled={subLoading}
                      className="w-full py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                      style={{ backgroundColor: '#FFFFFF', color: '#1B4332' }}
                    >
                      {subLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting…</> : 'Get Pro access'}
                    </button>
                  </div>
                </div>

                <div className="max-w-2xl border p-4 flex items-start gap-3" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
                  <Star className="w-4 h-4 flex-shrink-0 mt-0.5 fill-current" style={{ color: '#F59E0B' }} />
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    A solicitor charges &pound;150&ndash;&pound;500 for the same document. One ClauseKit contract pays for 3 months of the unlimited plan. &middot; Secure payments via Stripe.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── HELP ── */}
            {activeTab === 'help' && (
              <motion.div key="help" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="p-6 lg:p-8">
                <div className="mb-6">
                  <h1 className="font-display text-2xl font-bold mb-1" style={{ color: '#1B4332' }}>Help &amp; FAQ</h1>
                  <p className="text-sm" style={{ color: '#6B7280' }}>Frequently asked questions about ClauseKit.</p>
                </div>

                {/* Trust strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                  {[
                    { Icon: Shield, label: 'Solicitor-Reviewed' },
                    { Icon: Zap, label: 'ClauseKit Powered' },
                    { Icon: FileText, label: 'UK Law Only' },
                    { Icon: Lock, label: 'GDPR Compliant' },
                  ].map((t) => (
                    <div key={t.label} className="flex items-center gap-2.5 border p-3" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
                      <t.Icon className="w-4 h-4 flex-shrink-0" style={{ color: '#2D6A4F' }} />
                      <span className="text-xs font-semibold" style={{ color: '#1B4332' }}>{t.label}</span>
                    </div>
                  ))}
                </div>

                <div className="max-w-2xl border" style={{ borderColor: '#E5E5E2', backgroundColor: '#FFFFFF' }}>
                  <div className="px-6 divide-y" style={{ borderColor: '#E5E5E2' }}>
                    {FAQS.map((item) => <FaqItem key={item.q} q={item.q} a={item.a} />)}
                  </div>
                </div>

                <div className="max-w-2xl mt-5 border p-5 flex items-center gap-4" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#25D366' }}>
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold mb-0.5" style={{ color: '#1B4332' }}>Still have a question?</p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>Message us on WhatsApp. We usually reply within an hour.</p>
                  </div>
                  <a href="https://wa.me/447700900000" target="_blank" rel="noreferrer" className="flex-shrink-0 px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: '#25D366' }}>
                    Chat with us
                  </a>
                </div>
              </motion.div>
            )}

            {/* ── MY PLAN / SUBSCRIPTION ── */}
            {activeTab === 'subscription' && (
              <motion.div key="subscription" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="p-6 lg:p-8">
                <div className="mb-6">
                  <h1 className="font-display text-2xl font-bold mb-1" style={{ color: '#1B4332' }}>My Plan</h1>
                  <p className="text-sm" style={{ color: '#6B7280' }}>Manage your subscription and billing.</p>
                </div>

                <div className="max-w-lg space-y-4">
                  {/* Plan status card */}
                  <div className="border" style={{ borderColor: '#E5E5E2', backgroundColor: '#FFFFFF' }}>
                    <div className="px-5 py-3 border-b" style={{ borderColor: '#E5E5E2', backgroundColor: isSubscribed ? '#1B4332' : '#FAFAF8' }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: isSubscribed ? '#D8F3DC' : '#9CA3AF' }}>Current plan</p>
                    </div>
                    <div className="px-5 py-4">
                      {isSubscribed ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2" style={{ backgroundColor: '#52B788', borderRadius: '50%' }} />
                              <p className="text-base font-bold" style={{ color: '#1B4332' }}>Pro Plan — Active</p>
                            </div>
                            <p className="text-sm" style={{ color: '#6B7280' }}>£19/month · up to 20 contracts per day</p>
                          </div>
                          <span className="text-xs font-bold px-2 py-1" style={{ backgroundColor: '#D8F3DC', color: '#1B4332' }}>ACTIVE</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-base font-bold mb-1" style={{ color: '#1B4332' }}>Pay as you go</p>
                            <p className="text-sm" style={{ color: '#6B7280' }}>£7 per contract download</p>
                          </div>
                          <button
                            onClick={handleSubscribe}
                            disabled={subLoading}
                            className="px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center gap-1"
                            style={{ backgroundColor: '#2D6A4F' }}
                          >
                            {subLoading ? <><Loader2 className="w-3 h-3 animate-spin" /> Loading…</> : 'Upgrade to Pro'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Usage today */}
                  {isSubscribed && (
                    <div className="border px-5 py-4" style={{ borderColor: '#E5E5E2', backgroundColor: '#FFFFFF' }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>Today&apos;s usage</p>
                      <p className="text-sm" style={{ color: '#374151' }}>Contracts generated today reset at midnight UTC.</p>
                    </div>
                  )}

                  {/* Manage billing — Stripe portal */}
                  {isSubscribed && (
                    <div className="border px-5 py-4" style={{ borderColor: '#E5E5E2', backgroundColor: '#FFFFFF' }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>Billing & subscription</p>
                      <p className="text-sm mb-4" style={{ color: '#374151' }}>Update your payment method, view invoices, or cancel your subscription via the Stripe billing portal.</p>
                      <button
                        onClick={async (e) => {
                          const btn = e.currentTarget
                          btn.textContent = 'Opening…'
                          btn.setAttribute('disabled', 'true')
                          try {
                            const res = await fetch('/api/subscription/portal', { method: 'POST' })
                            const data = await res.json()
                            if (data.url) {
                              window.location.href = data.url
                            } else {
                              alert(data.error ?? 'Could not open billing portal. Please try again.')
                              btn.textContent = 'Manage billing'
                              btn.removeAttribute('disabled')
                            }
                          } catch {
                            alert('Network error. Please try again.')
                            btn.textContent = 'Manage billing'
                            btn.removeAttribute('disabled')
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-2 transition-colors hover:bg-[#D8F3DC]"
                        style={{ borderColor: '#2D6A4F', color: '#2D6A4F', backgroundColor: 'transparent' }}
                      >
                        <CreditCard className="w-4 h-4" /> Manage billing
                      </button>
                    </div>
                  )}

                  {/* Legal links */}
                  <div className="border px-5 py-4" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>Legal</p>
                    <div className="flex flex-col gap-2">
                      <a href="/terms" target="_blank" className="text-sm hover:opacity-70 transition-opacity" style={{ color: '#2D6A4F' }}>Terms & Conditions →</a>
                      <a href="/privacy" target="_blank" className="text-sm hover:opacity-70 transition-opacity" style={{ color: '#2D6A4F' }}>Privacy Policy →</a>
                      <a href="/refunds" target="_blank" className="text-sm hover:opacity-70 transition-opacity" style={{ color: '#2D6A4F' }}>Refund Policy →</a>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── NOTIFICATIONS ── */}
            {activeTab === 'notifications' && (
              <motion.div key="notifications" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="p-6 lg:p-8">
                <div className="mb-6">
                  <h1 className="font-display text-2xl font-bold mb-1" style={{ color: '#1B4332' }}>Notifications</h1>
                  <p className="text-sm" style={{ color: '#6B7280' }}>Stay updated on your contracts and client activity.</p>
                </div>

                <div className="max-w-2xl space-y-3">
                  {notifications.length === 0 ? (
                    <div className="border p-8 text-center" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
                      <Bell className="w-10 h-10 mx-auto mb-3" style={{ color: '#D1D5DB' }} />
                      <h3 className="font-semibold mb-1" style={{ color: '#374151' }}>No notifications yet</h3>
                      <p className="text-sm" style={{ color: '#9CA3AF' }}>You&apos;ll be notified when clients sign your contracts.</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={cn(
                          'border p-4 flex items-start gap-4 transition-colors',
                          !notif.read && 'border-l-4'
                        )}
                        style={{
                          borderColor: notif.read ? '#E5E5E2' : '#2D6A4F',
                          backgroundColor: notif.read ? '#FFFFFF' : '#FAFAF8',
                          borderLeftColor: !notif.read ? '#2D6A4F' : undefined,
                        }}
                      >
                        <div
                          className="w-9 h-9 flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: notif.type === 'contract_signed' ? '#D8F3DC' : notif.type === 'contract_sent' ? '#DBEAFE' : '#F3F4F6',
                            borderRadius: '50%',
                          }}
                        >
                          {notif.type === 'contract_signed' ? (
                            <Check className="w-4 h-4" style={{ color: '#1B4332' }} />
                          ) : notif.type === 'contract_sent' ? (
                            <ArrowRight className="w-4 h-4" style={{ color: '#1E40AF' }} />
                          ) : (
                            <Bell className="w-4 h-4" style={{ color: '#6B7280' }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold mb-0.5" style={{ color: '#1B4332' }}>{notif.title}</p>
                          <p className="text-sm mb-2" style={{ color: '#6B7280' }}>{notif.message}</p>
                          <p className="text-xs" style={{ color: '#9CA3AF' }}>{fmtDate(notif.createdAt)}</p>
                        </div>
                        {notif.contractId && (
                          <button
                            onClick={() => {
                              setViewingContractId(notif.contractId!)
                              setActiveTab('contract-view')
                              // Mark as read
                              if (!notif.read) {
                                const updated = notifications.map(n => n.id === notif.id ? { ...n, read: true } : n)
                                setNotifications(updated)
                                persistNotifications(updated)
                              }
                            }}
                            className="text-xs font-medium flex-shrink-0 hover:opacity-70"
                            style={{ color: '#2D6A4F' }}
                          >
                            View →
                          </button>
                        )}
                      </div>
                    ))
                  )}

                  {notifications.length > 0 && (
                    <button
                      onClick={() => {
                        const updated = notifications.map(n => ({ ...n, read: true }))
                        setNotifications(updated)
                        persistNotifications(updated)
                      }}
                      className="text-xs font-medium hover:opacity-70"
                      style={{ color: '#6B7280' }}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── CONTRACT VIEW ── */}
            {activeTab === 'contract-view' && viewingContractId && (() => {
              const c = savedContracts.find(s => s.id === viewingContractId)
              if (!c) return (
                <motion.div key="contract-view-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8">
                  <p className="text-sm" style={{ color: '#6B7280' }}>Contract not found.</p>
                </motion.div>
              )
              return (
                <motion.div key={`contract-view-${c.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full overflow-hidden">
                  <ContractViewer
                    contract={c}
                    onBack={() => { setActiveTab('my-contracts'); setViewingContractId(null) }}
                    onCheckout={initiateCheckout}
                    onSubscribe={handleSubscribe}
                    onSend={handleSendContract}
                    onUpdate={(updated) => {
                      const prev = savedContracts.find(s => s.id === updated.id)
                      const next = savedContracts.map(s => s.id === updated.id ? updated : s)
                      setSavedContracts(next)
                      persistSaved(next)
                      // Fire toast when template status changes
                      if (prev && prev.isTemplate !== updated.isTemplate) {
                        setTemplateToast(updated.isTemplate ? 'saved' : 'removed')
                        setTimeout(() => setTemplateToast(null), 3500)
                      }
                    }}
                    session={session}
                    isSubscribed={isSubscribed}
                  />
                </motion.div>
              )
            })()}

          </AnimatePresence>
        </main>

        {/* Footer */}
        <div className="flex-shrink-0 border-t px-6 py-3 flex items-center justify-between" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>© 2026 ClauseKit · Not legal advice</p>
          <div className="flex items-center gap-4">
            <a href="/terms" target="_blank" className="text-xs hover:opacity-70 transition-opacity" style={{ color: '#9CA3AF' }}>Terms</a>
            <a href="/privacy" target="_blank" className="text-xs hover:opacity-70 transition-opacity" style={{ color: '#9CA3AF' }}>Privacy</a>
            <a href="/refunds" target="_blank" className="text-xs hover:opacity-70 transition-opacity" style={{ color: '#9CA3AF' }}>Refunds</a>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
