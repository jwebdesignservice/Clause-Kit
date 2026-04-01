'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SignatureCanvas from 'react-signature-canvas'
import { Check, Loader2, FileText, Pen, Type } from 'lucide-react'

interface Props {
  contractId: string
  token: string
  role: 'party1' | 'party2'
  title: string
  content: string
  party1?: { name: string; email: string }
  party2?: { name: string; email: string }
  party1Signed?: boolean
  party1PrintedName?: string
  party1SignedAt?: string
}

// Parse contract block type (mirrors sender view)
function parseBlock(text: string): { type: 'section' | 'party' | 'signature' | 'footer' | 'body'; heading?: string; body: string } {
  const t = text.trim()
  if (t.startsWith('---') || t.startsWith('This document was generated')) return { type: 'footer', body: t }
  if (t.startsWith('PARTY 1 (') || t.startsWith('PARTY 2 (') || (t.startsWith('PARTY 1') && t.includes('Name:'))) return { type: 'party', body: t }
  if (t.startsWith('PARTY 1 -') || t.startsWith('PARTY 2 -') || t.startsWith('ACCEPTANCE')) return { type: 'signature', body: t }
  if (t.includes('Signature:') && t.includes('Full Name:')) return { type: 'signature', body: t }
  
  // Numbered section: "01. HEADING - body" or "01. HEADING\nbody"
  const sectionMatch = t.match(/^(\d{2}\.\s+[A-Z][A-Z\s&/]+?)(?:\s*[-–—]\s*|\n)([\s\S]+)/)
  if (sectionMatch) return { type: 'section', heading: sectionMatch[1].trim(), body: sectionMatch[2].trim() }
  
  // Pure heading line (numbered or all caps)
  if (/^\d{2}\.\s+[A-Z]/.test(t) && t.length < 80) return { type: 'section', heading: t, body: '' }
  if (t === t.toUpperCase() && t.length > 5 && t.length < 60 && !t.startsWith('-')) return { type: 'section', heading: t, body: '' }
  
  return { type: 'body', body: t }
}

// Format body text (bullets, etc)
function FormattedText({ text }: { text: string }) {
  const lines = text.split('\n')
  const isBulletList = lines.every(l => !l.trim() || l.trim().startsWith('-') || l.trim().startsWith('•'))
  
  if (isBulletList && lines.filter(l => l.trim()).length > 1) {
    return (
      <ul className="space-y-1.5 ml-4">
        {lines.filter(l => l.trim()).map((line, i) => (
          <li key={i} className="text-sm leading-relaxed flex items-start gap-2" style={{ color: '#374151' }}>
            <span style={{ color: '#2D6A4F' }}>•</span>
            <span>{line.replace(/^[-•]\s*/, '')}</span>
          </li>
        ))}
      </ul>
    )
  }
  
  return <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#374151' }}>{text}</p>
}

export default function SigningClient({ contractId, token, role, title, content, party1, party2, party1Signed, party1PrintedName, party1SignedAt }: Props) {
  const sigRef = useRef<SignatureCanvas>(null)
  const [signMode, setSignMode] = useState<'draw' | 'type'>('draw')
  const [typedName, setTypedName] = useState('')
  const [printedName, setPrintedName] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [result, setResult] = useState<{ status: string; message: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const myParty = role === 'party1' ? party1 : party2

  const getSignatureDataUrl = (): string | null => {
    if (signMode === 'draw') {
      if (!sigRef.current || sigRef.current.isEmpty()) return null
      return sigRef.current.toDataURL('image/png')
    }
    if (!typedName.trim()) return null
    const canvas = document.createElement('canvas')
    canvas.width = 400; canvas.height = 80
    const ctx = canvas.getContext('2d')!
    ctx.font = 'italic 40px Georgia, serif'
    ctx.fillStyle = '#1a1a1a'
    ctx.fillText(typedName, 12, 56)
    return canvas.toDataURL('image/png')
  }

  const handleSubmit = async () => {
    setError(null)
    const sigDataUrl = getSignatureDataUrl()
    if (!sigDataUrl) { setError('Please provide your signature.'); return }
    if (!printedName.trim()) { setError('Please enter your full name.'); return }
    if (!agreed) { setError('Please confirm you have read and agree to this contract.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId, token, signatureDataUrl: sigDataUrl, printedName: printedName.trim(), role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Signing failed')
      setResult(data); setDone(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally { setLoading(false) }
  }

  if (done && result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FAFAF8' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-white border p-10 text-center" style={{ borderColor: '#E5E5E2' }}>
          <div className="w-14 h-14 flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: '#D8F3DC' }}>
            <Check className="w-7 h-7" style={{ color: '#2D6A4F' }} strokeWidth={3} />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2" style={{ color: '#1B4332' }}>
            {result.status === 'completed' ? 'Contract fully executed' : 'Signed — sent for countersignature'}
          </h1>
          <p className="text-sm mb-6" style={{ color: '#6B7280' }}>{result.message}</p>
          {result.status === 'completed' && (
            <a href={`/download/${contractId}`} className="inline-flex items-center gap-2 mt-2 px-6 py-3 text-sm font-semibold text-white" style={{ backgroundColor: '#2D6A4F' }}>
              Download signed contract
            </a>
          )}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F3F4F6' }}>
      <div className="bg-white border-b px-6 py-3 flex items-center gap-3" style={{ borderColor: '#E5E5E2' }}>
        <div className="w-6 h-6 flex items-center justify-center" style={{ backgroundColor: '#2D6A4F' }}>
          <FileText className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-bold text-sm" style={{ color: '#1B4332' }}>ClauseKit</span>
        <span className="text-sm" style={{ color: '#9CA3AF' }}>&mdash; Document Signing</span>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-5">
          <h1 className="font-display text-2xl font-bold mb-1" style={{ color: '#1B4332' }}>{title}</h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            {role === 'party1'
              ? `Review and sign below. It will then be sent to ${party2?.name ?? 'your client'} for countersignature.`
              : `${party1?.name ?? 'The other party'} has signed. Please review and sign below.`}
          </p>
        </div>

        {role === 'party2' && party1Signed && (
          <div className="mb-4 flex items-center gap-3 px-4 py-3 border text-sm" style={{ backgroundColor: '#EDFAF2', borderColor: '#D8F3DC', color: '#1B4332' }}>
            <Check className="w-4 h-4" style={{ color: '#2D6A4F' }} strokeWidth={3} />
            <span><strong>{party1PrintedName ?? party1?.name}</strong> signed on {party1SignedAt ? new Date(party1SignedAt).toLocaleDateString('en-GB') : '—'}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border" style={{ borderColor: '#E5E5E2' }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Contract document</p>
            </div>
            <div className="p-6 lg:p-8 max-h-[70vh] overflow-y-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
              {content.split(/\n\n+/).filter(Boolean).map((block, i) => {
                const parsed = parseBlock(block)
                
                if (parsed.type === 'section') {
                  return (
                    <div key={i} className="mt-8 first:mt-0">
                      {parsed.heading && (
                        <div className="border-b pb-2 mb-3" style={{ borderColor: '#D8F3DC' }}>
                          <h3 className="font-bold uppercase tracking-wide" style={{ color: '#1B4332', fontSize: 18 }}>
                            {parsed.heading}
                          </h3>
                        </div>
                      )}
                      {parsed.body && <FormattedText text={parsed.body} />}
                    </div>
                  )
                }
                
                if (parsed.type === 'party') {
                  return (
                    <div key={i} className="mb-6 p-4 border-l-4" style={{ borderColor: '#2D6A4F', backgroundColor: '#FAFAF8' }}>
                      {parsed.body.split('\n').map((line, j) => (
                        <p key={j} className="text-sm" style={{ color: line.includes(':') ? '#1B4332' : '#374151' }}>
                          {line}
                        </p>
                      ))}
                    </div>
                  )
                }
                
                if (parsed.type === 'signature' || parsed.type === 'footer') {
                  // Hide raw signature blocks — we show our own signature UI
                  return null
                }
                
                return (
                  <div key={i} className="mb-4">
                    <FormattedText text={parsed.body} />
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border" style={{ borderColor: '#E5E5E2' }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Your signature</p>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex border" style={{ borderColor: '#E5E5E2' }}>
                  {[{ mode: 'draw', Icon: Pen, label: 'Draw' }, { mode: 'type', Icon: Type, label: 'Type' }].map(({ mode, Icon, label }) => (
                    <button key={mode} onClick={() => setSignMode(mode as 'draw' | 'type')} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold"
                      style={signMode === mode ? { backgroundColor: '#2D6A4F', color: '#fff' } : { backgroundColor: '#FAFAF8', color: '#6B7280' }}>
                      <Icon className="w-3.5 h-3.5" />{label}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {signMode === 'draw' ? (
                    <motion.div key="draw" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="border" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
                        <SignatureCanvas ref={sigRef} canvasProps={{ height: 120, style: { display: 'block', width: '100%', touchAction: 'none' } }} backgroundColor="transparent" penColor="#1a1a1a" />
                      </div>
                      <button onClick={() => sigRef.current?.clear()} className="text-xs mt-1 hover:opacity-70" style={{ color: '#9CA3AF' }}>Clear</button>
                    </motion.div>
                  ) : (
                    <motion.div key="type" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <input type="text" value={typedName} onChange={(e) => setTypedName(e.target.value)} placeholder="Type your name..."
                        className="w-full border px-3 py-3 focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                        style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '22px', color: '#1a1a1a' }} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#1B4332' }}>Full name (printed) *</label>
                  <input type="text" value={printedName} onChange={(e) => setPrintedName(e.target.value)} placeholder="Your full legal name"
                    className="w-full border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                    style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8', color: '#1a1a1a' }} />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#1B4332' }}>Date</label>
                  <div className="px-3 py-2.5 text-sm border flex items-center justify-between" style={{ borderColor: '#E5E5E2', backgroundColor: '#F3F4F6', color: '#374151' }}>
                    <span>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span className="text-xs" style={{ color: '#9CA3AF' }}>Today</span>
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ accentColor: '#2D6A4F', width: 16, height: 16, marginTop: 2 }} />
                  <span className="text-xs leading-relaxed" style={{ color: '#374151' }}>I have read and understood this contract and agree to be bound by its terms.</span>
                </label>

                {error && <p className="text-xs font-medium" style={{ color: '#EF4444' }}>{error}</p>}

                <button onClick={handleSubmit} disabled={loading} className="w-full py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: '#2D6A4F' }}>
                  {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Processing&hellip;</span>
                    : role === 'party1' ? `Sign & Send to ${party2?.name ?? 'Client'}` : 'Sign Contract'}
                </button>

                <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>Legally binding under the Electronic Communications Act 2000</p>
              </div>
            </div>

            <div className="bg-white border p-4" style={{ borderColor: '#E5E5E2' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#9CA3AF' }}>Signing as</p>
              <p className="text-sm font-semibold" style={{ color: '#1B4332' }}>{myParty?.name ?? 'You'}</p>
              <p className="text-xs" style={{ color: '#6B7280' }}>{myParty?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
