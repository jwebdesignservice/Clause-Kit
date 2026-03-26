'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import IntakeWizard, { type IntakeData } from '@/app/app/IntakeWizard'
import { ContractType } from '@/types'

interface Props {
  contractTypeId: ContractType
  contractTypeTitle: string
  customDescription?: string
}

const LOADING_MESSAGES = [
  'Analysing your requirements…',
  'Applying UK legal standards…',
  'Drafting contract clauses…',
  'Reviewing payment terms…',
  'Finalising your document…',
]

export default function IntakeClient({ contractTypeId, contractTypeTitle, customDescription }: Props) {
  const router = useRouter()
  const [generating, setGenerating] = useState(false)
  const [loadingMsg] = useState(
    LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]
  )
  const [error, setError] = useState('')

  const handleComplete = async (data: IntakeData) => {
    setGenerating(true)
    setError('')

    const fields: Record<string, string | string[]> = { ...data }
    if (customDescription) {
      fields.customDescription = customDescription
      fields.serviceDescription = customDescription
    }

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractType: contractTypeId, fields }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Generation failed.' }))
        throw new Error(err.error ?? 'Generation failed.')
      }

      const result = await res.json()
      router.push(`/preview/${result.contractId ?? result.id}`)
    } catch (err) {
      setGenerating(false)
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  const handleBack = () => router.push('/create')

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div
          className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mb-6"
          style={{ borderColor: '#2D6A4F', borderTopColor: 'transparent' }}
        />
        <p className="text-sm font-medium" style={{ color: '#1B4332' }}>{loadingMsg}</p>
        <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>
          This usually takes 10–20 seconds
        </p>
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div
          className="mb-6 px-4 py-3 text-sm border rounded"
          style={{ borderColor: '#FCA5A5', backgroundColor: '#FEF2F2', color: '#991B1B' }}
        >
          {error}
        </div>
      )}
      <IntakeWizard
        contractTypeId={contractTypeId}
        contractTypeTitle={contractTypeTitle}
        onComplete={handleComplete}
        onBack={handleBack}
      />
    </div>
  )
}
