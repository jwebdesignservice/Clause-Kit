'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CustomContractInput() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState('')

  const handleContinue = () => {
    const trimmed = description.trim()
    if (!trimmed) return
    router.push(`/intake/custom?description=${encodeURIComponent(trimmed)}`)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-semibold hover:underline"
        style={{ color: '#2D6A4F' }}
      >
        + Describe a custom contract
      </button>
    )
  }

  return (
    <div className="space-y-3">
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="e.g. A consultancy agreement between a UK limited company and a US contractor for software development, with IP assignment and a 6-month non-compete clause..."
        rows={4}
        className="w-full border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
        style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8', color: '#1A1A1A' }}
        autoFocus
      />
      <div className="flex items-center gap-3">
        <button
          onClick={handleContinue}
          disabled={!description.trim()}
          className="px-5 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
          style={{ backgroundColor: '#2D6A4F' }}
        >
          Continue
        </button>
        <button
          onClick={() => { setOpen(false); setDescription('') }}
          className="text-sm"
          style={{ color: '#9CA3AF' }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
