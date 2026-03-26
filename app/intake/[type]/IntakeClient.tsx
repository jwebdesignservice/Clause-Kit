'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import IntakeWizard, { type IntakeData } from '@/app/app/IntakeWizard'
import { ContractType } from '@/types'

interface Props {
  contractTypeId: ContractType
  contractTypeTitle: string
  customDescription?: string
}

const LOADING_STEPS = [
  { message: 'Analysing your requirements…', detail: 'Reading your intake answers' },
  { message: 'Applying UK legal standards…', detail: 'England & Wales governing law' },
  { message: 'Drafting contract clauses…', detail: 'Late Payment Act, GDPR, IP terms' },
  { message: 'Reviewing payment terms…', detail: 'Statutory interest & invoice conditions' },
  { message: 'Formatting your document…', detail: 'Professional structure & layout' },
  { message: 'Finalising your contract…', detail: 'Almost ready — just a moment' },
]

function GeneratingScreen() {
  const [stepIndex, setStepIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Advance step every ~3.5 seconds
    const stepInterval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, LOADING_STEPS.length - 1))
    }, 3500)

    // Smooth progress bar over ~22 seconds (typical GPT-4o response time)
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) return 95 // hold at 95% until done
        return p + 0.5
      })
    }, 110)

    return () => {
      clearInterval(stepInterval)
      clearInterval(progressInterval)
    }
  }, [])

  const step = LOADING_STEPS[stepIndex]

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
      {/* Animated logo mark */}
      <div className="relative mb-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: '#F0FAF4' }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="6" y="4" width="14" height="2" rx="1" fill="#2D6A4F" className="animate-pulse" />
            <rect x="6" y="9" width="20" height="2" rx="1" fill="#2D6A4F" style={{ animationDelay: '0.1s' }} className="animate-pulse" />
            <rect x="6" y="14" width="18" height="2" rx="1" fill="#2D6A4F" style={{ animationDelay: '0.2s' }} className="animate-pulse" />
            <rect x="6" y="19" width="20" height="2" rx="1" fill="#2D6A4F" style={{ animationDelay: '0.3s' }} className="animate-pulse" />
            <rect x="6" y="24" width="12" height="2" rx="1" fill="#2D6A4F" style={{ animationDelay: '0.4s' }} className="animate-pulse" />
          </svg>
        </div>
        {/* Spinning ring */}
        <div
          className="absolute inset-0 rounded-2xl border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#2D6A4F', borderTopColor: 'transparent', animationDuration: '1.2s' }}
        />
      </div>

      {/* Status */}
      <h2 className="text-lg font-semibold mb-1" style={{ color: '#1B4332' }}>
        {step.message}
      </h2>
      <p className="text-sm mb-8" style={{ color: '#9CA3AF' }}>
        {step.detail}
      </p>

      {/* Progress bar */}
      <div className="w-64 h-1.5 rounded-full overflow-hidden mb-3" style={{ backgroundColor: '#E5E7EB' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, backgroundColor: '#2D6A4F' }}
        />
      </div>

      {/* Step dots */}
      <div className="flex gap-1.5 mb-4">
        {LOADING_STEPS.map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i <= stepIndex ? '#2D6A4F' : '#D1D5DB',
              transform: i === stepIndex ? 'scale(1.4)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      <p className="text-xs" style={{ color: '#9CA3AF' }}>
        This usually takes 15–25 seconds
      </p>
    </div>
  )
}

export default function IntakeClient({ contractTypeId, contractTypeTitle, customDescription }: Props) {
  const router = useRouter()
  const [generating, setGenerating] = useState(false)
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
    return <GeneratingScreen />
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
