'use client';

import { useState } from 'react';

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
    <div className="font-mono text-sm leading-relaxed text-gray-800">
      {/* Fully visible section */}
      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800 mb-0">
        {visibleContent}
      </pre>

      {/* Blurred section with paywall overlay */}
      <div className="relative mt-0">
        {/* Blurred content */}
        <pre
          className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800 select-none"
          style={{ filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none' }}
          aria-hidden="true"
        >
          {blurredContent}
        </pre>

        {/* Gradient fade at the top of blur */}
        <div
          className="absolute top-0 left-0 right-0 h-16 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, white 0%, transparent 100%)',
          }}
        />

        {/* Paywall overlay */}
        <div className="absolute inset-0 flex items-start justify-center pt-16">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 mx-4 max-w-md w-full text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Unlock your full contract
            </h2>
            <p className="text-gray-500 text-sm mb-1">
              {title}
            </p>
            <p className="text-gray-400 text-xs mb-6">
              Governed by English &amp; Welsh law · Ready to sign
            </p>

            <div className="flex items-baseline justify-center gap-1 mb-6">
              <span className="text-4xl font-bold text-gray-900">£7</span>
              <span className="text-gray-500 text-sm">one-time</span>
            </div>

            <ul className="text-sm text-gray-600 text-left space-y-2 mb-6">
              {[
                'Full contract — all clauses unlocked',
                'Download as PDF and Word (.docx)',
                'UK law compliant, ready to use',
                'No subscription required',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}

            <button
              onClick={handleUnlock}
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                    />
                  </svg>
                  Redirecting to payment…
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  Pay £7 — Unlock full contract
                </>
              )}
            </button>

            <p className="mt-4 text-xs text-gray-400">
              Secured by Stripe · Instant download after payment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
