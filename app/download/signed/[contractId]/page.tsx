'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, Download, Loader2 } from 'lucide-react'

export default function SignedDownloadPage({ params }: { params: { contractId: string } }) {
  const { contractId } = params
  const [loading, setLoading] = useState(true)
  const [contract, setContract] = useState<{ title: string; status: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/contract/${contractId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setContract(data)
        }
      })
      .catch(() => setError('Failed to load contract'))
      .finally(() => setLoading(false))
  }, [contractId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAF8' }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#2D6A4F' }} />
      </div>
    )
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAF8' }}>
        <div className="text-center p-8">
          <h1 className="font-display text-xl font-bold mb-2" style={{ color: '#1B4332' }}>Contract not found</h1>
          <p className="text-sm mb-4" style={{ color: '#6B7280' }}>{error || 'This contract could not be found.'}</p>
          <Link href="/" className="text-sm font-medium" style={{ color: '#2D6A4F' }}>← Back to home</Link>
        </div>
      </div>
    )
  }

  if (contract.status !== 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAF8' }}>
        <div className="text-center p-8 max-w-md">
          <h1 className="font-display text-xl font-bold mb-2" style={{ color: '#1B4332' }}>Contract not yet complete</h1>
          <p className="text-sm mb-4" style={{ color: '#6B7280' }}>This contract is still awaiting signatures. Downloads are available once both parties have signed.</p>
          <Link href="/" className="text-sm font-medium" style={{ color: '#2D6A4F' }}>← Back to home</Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16" style={{ backgroundColor: '#FAFAF8' }}>
      {/* Header */}
      <div className="flex items-center justify-center gap-3 px-4 py-2 text-xs font-medium w-full mb-12" style={{ backgroundColor: '#1B4332', color: '#D8F3DC' }}>
        <span>ClauseKit</span>
        <span style={{ color: '#52B788' }}>·</span>
        <span className="font-bold" style={{ color: '#52B788' }}>Contract signed</span>
      </div>

      <div className="w-full max-w-md">
        {/* Success card */}
        <div className="border mb-6" style={{ borderColor: '#E5E5E2', backgroundColor: '#FFFFFF' }}>
          <div className="px-6 py-5 border-b" style={{ borderColor: '#E5E5E2', backgroundColor: '#1B4332' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#52B788' }}>
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Contract fully signed</h1>
                <p className="text-xs" style={{ color: '#D8F3DC' }}>{contract.title}</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm mb-5" style={{ color: '#374151' }}>
              Both parties have signed. Download your fully executed contract below.
            </p>
            <div className="space-y-3">
              <a
                href={`/api/download/signed-pdf?contractId=${contractId}`}
                className="flex items-center justify-center gap-2.5 w-full py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#2D6A4F' }}
              >
                <Download className="w-4 h-4" />
                Download Signed PDF
              </a>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="border px-5 py-4 mb-4" style={{ borderColor: '#E5E5E2', backgroundColor: '#FFFFFF' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>What&apos;s included</p>
          <div className="space-y-2">
            {[
              'Full contract with both signatures',
              'Legally binding under UK law',
              'Timestamp and IP records for each signature',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#52B788' }} strokeWidth={3} />
                <span className="text-xs leading-relaxed" style={{ color: '#374151' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>
          © 2026 ClauseKit · Not legal advice
        </p>
      </div>
    </main>
  )
}
