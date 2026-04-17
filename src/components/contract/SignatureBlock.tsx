'use client'

import { useEffect, useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'

export interface SignatureState {
  sig1Empty: boolean
  name1: string
  date1: string
  getDataUrl?: () => string | null
}

interface Props {
  party1Name: string
  party2Name: string
  onStateChange?: (state: SignatureState) => void
}

export function SignatureBlock({ party1Name, party2Name, onStateChange }: Props) {
  const sig1Ref = useRef<SignatureCanvas>(null)
  const sig2Ref = useRef<SignatureCanvas>(null)
  const [name1, setName1] = useState('')
  const [name2, setName2] = useState('')
  const [date1, setDate1] = useState('')
  const [date2, setDate2] = useState('')

  const getDataUrl = (): string | null => {
    if (!sig1Ref.current || sig1Ref.current.isEmpty()) return null
    try {
      const trimmed = sig1Ref.current.getTrimmedCanvas()
      return trimmed.toDataURL('image/png')
    } catch {
      return sig1Ref.current.toDataURL('image/png')
    }
  }

  useEffect(() => {
    onStateChange?.({
      sig1Empty: !sig1Ref.current || sig1Ref.current.isEmpty(),
      name1,
      date1,
      getDataUrl,
    })
  }, [name1, date1]) // eslint-disable-line react-hooks/exhaustive-deps

  const inputCls = 'w-full border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]'
  const inputSty = { borderColor: '#E5E5E2', backgroundColor: '#FAFAF8', color: '#1A1A1A' }

  const handleSigEnd = () => {
    onStateChange?.({
      sig1Empty: !sig1Ref.current || sig1Ref.current.isEmpty(),
      name1,
      date1,
      getDataUrl,
    })
  }

  return (
    <div className="mt-10 pt-6 border-t-2" style={{ borderColor: '#1B4332' }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#9CA3AF' }}>Acceptance &amp; Signatures</p>
      <p className="text-sm mb-8 leading-relaxed" style={{ color: '#374151' }}>
        By signing below, both parties confirm they have read, understood, and agree to all terms set out in this Agreement.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#1B4332' }}>Provider {party1Name ? `\u2014 ${party1Name}` : ''}</p>
          <p className="text-xs mb-4" style={{ color: '#EF4444' }}>* Required before sending</p>
          <div className="mb-4">
            <p className="text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Signature <span style={{ color: '#EF4444' }}>*</span></p>
            <div className="border" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
              <SignatureCanvas
                ref={sig1Ref}
                onEnd={handleSigEnd}
                canvasProps={{ height: 100, style: { display: 'block', width: '100%', touchAction: 'none' } }}
                backgroundColor="transparent"
                penColor="#1a1a1a"
              />
            </div>
            <button onClick={() => { sig1Ref.current?.clear(); handleSigEnd() }} className="text-xs mt-1 hover:opacity-70" style={{ color: '#9CA3AF' }}>Clear</button>
          </div>
          <div className="mb-3">
            <p className="text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Full Name <span style={{ color: '#EF4444' }}>*</span></p>
            <input type="text" value={name1} onChange={(e) => setName1(e.target.value)} placeholder="Type your full name" className={inputCls} style={inputSty} />
          </div>
          <div>
            <p className="text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Date <span style={{ color: '#EF4444' }}>*</span></p>
            <input
              type="date"
              value={date1}
              onChange={(e) => setDate1(e.target.value)}
              onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
              className={`${inputCls} cursor-pointer`}
              style={inputSty}
            />
          </div>
        </div>

        <div style={{ opacity: 0.5 }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#1B4332' }}>Client {party2Name ? `\u2014 ${party2Name}` : ''}</p>
          <p className="text-xs mb-4" style={{ color: '#9CA3AF' }}>Completed when client signs</p>
          <div className="mb-4">
            <p className="text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Signature</p>
            <div className="border" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
              <SignatureCanvas
                ref={sig2Ref}
                canvasProps={{ height: 100, style: { display: 'block', width: '100%', touchAction: 'none', pointerEvents: 'none' } }}
                backgroundColor="transparent"
                penColor="#1a1a1a"
              />
            </div>
          </div>
          <div className="mb-3">
            <p className="text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Full Name</p>
            <input type="text" value={name2} onChange={(e) => setName2(e.target.value)} disabled placeholder="Awaiting client" className={inputCls} style={{ ...inputSty, cursor: 'not-allowed' }} />
          </div>
          <div>
            <p className="text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Date</p>
            <input type="date" value={date2} onChange={(e) => setDate2(e.target.value)} disabled className={inputCls} style={{ ...inputSty, cursor: 'not-allowed' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
