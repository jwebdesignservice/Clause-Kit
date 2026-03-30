'use client';

import { useState } from 'react';
import { Loader2, Download, Eye, Check } from 'lucide-react';

interface PaywallClientProps {
  contractId: string;
  visibleContent: string;
  blurredContent: string;
  title: string;
}

export default function PaywallClient({
  contractId,
  visibleContent,
  blurredContent,
  title,
}: PaywallClientProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUnlock() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to create checkout session');
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  return (
    <div className="text-sm leading-relaxed" style={{ color: '#1A1A1A' }}>
      {/* Fully visible section */}
      <pre className="whitespace-pre-wrap text-sm leading-relaxed mb-0" style={{ fontFamily: 'inherit', color: '#1A1A1A' }}>
        {visibleContent}
      </pre>

      {/* Blurred section with paywall overlay */}
      <div className="relative mt-0">
        {/* Blurred content */}
        <pre
          className="whitespace-pre-wrap text-sm leading-relaxed select-none"
          style={{ fontFamily: 'inherit', filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none', color: '#1A1A1A' }}
          aria-hidden="true"
        >
          {blurredContent}
        </pre>

        {/* Gradient fade */}
        <div
          className="absolute top-0 left-0 right-0 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, white 0%, transparent 100%)' }}
        />

        {/* Paywall overlay */}
        <div className="absolute inset-0 flex items-start justify-center pt-12">
          <div className="w-full max-w-sm mx-4 border shadow-lg" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E2' }}>
            {/* Header */}
            <div className="px-5 py-4 border-b" style={{ borderColor: '#E5E5E2', backgroundColor: '#1B4332' }}>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 flex-shrink-0" style={{ color: '#52B788' }} />
                <h2 className="text-sm font-bold text-white">Your contract is ready</h2>
              </div>
              <p className="text-xs mt-1 truncate" style={{ color: '#D8F3DC' }}>{title}</p>
            </div>

            <div className="px-5 py-4">
              {/* Price */}
              <div className="flex items-baseline gap-1 mb-4">
                <span className="font-bold" style={{ fontSize: 36, color: '#1B4332', lineHeight: 1 }}>£7</span>
                <span className="text-sm" style={{ color: '#6B7280' }}>one-time</span>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-5">
                {[
                  'Full contract — all clauses unlocked',
                  'Download as PDF and Word (.docx)',
                  'UK law compliant, ready to use',
                  'No subscription required',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#52B788' }} strokeWidth={3} />
                    <span className="text-xs leading-relaxed" style={{ color: '#374151' }}>{item}</span>
                  </li>
                ))}
              </ul>

              {error && (
                <div className="flex items-center gap-2 px-3 py-2 border mb-3 text-xs" style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA', color: '#991B1B' }}>
                  <span className="font-bold flex-shrink-0">!</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleUnlock}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: '#2D6A4F' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Redirecting to payment…
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Pay £7 — Unlock full contract
                  </>
                )}
              </button>

              <p className="mt-3 text-xs text-center" style={{ color: '#9CA3AF' }}>
                Secured by Stripe · Instant download
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
