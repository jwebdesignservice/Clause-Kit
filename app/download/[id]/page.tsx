import { stripe } from '@/lib/stripe';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DownloadPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { contractId?: string };
}) {
  const sessionId = params.id;

  let isPaid = false;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    isPaid = session.payment_status === 'paid';
  } catch {
    redirect('/');
  }

  if (!isPaid) {
    redirect('/');
  }

  const contractId = searchParams.contractId;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16" style={{ backgroundColor: '#FAFAF8' }}>
      {/* Trust banner */}
      <div className="flex items-center justify-center gap-3 px-4 py-2 text-xs font-medium w-full mb-12" style={{ backgroundColor: '#1B4332', color: '#D8F3DC' }}>
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
          </svg>
          UK law only
        </span>
        <span style={{ color: '#52B788' }}>·</span>
        <span>ClauseKit</span>
        <span style={{ color: '#52B788' }}>·</span>
        <span className="font-bold" style={{ color: '#52B788' }}>Payment confirmed</span>
      </div>

      <div className="w-full max-w-md">
        {/* Success header */}
        <div className="border mb-6" style={{ borderColor: '#E5E5E2', backgroundColor: '#FFFFFF' }}>
          <div className="px-6 py-5 border-b" style={{ borderColor: '#E5E5E2', backgroundColor: '#1B4332' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#52B788' }}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Payment confirmed</h1>
                <p className="text-xs" style={{ color: '#D8F3DC' }}>Your contract is ready to download</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm mb-5" style={{ color: '#374151' }}>
              Download your contract in both formats below. The Word file is fully editable — make any final adjustments before signing.
            </p>
            <div className="space-y-3">
              <a
                href={`/api/download/pdf?contractId=${contractId}&session=${sessionId}`}
                className="flex items-center justify-center gap-2.5 w-full py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#2D6A4F' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </a>
              <a
                href={`/api/download/docx?contractId=${contractId}&session=${sessionId}`}
                className="flex items-center justify-center gap-2.5 w-full py-3 text-sm font-semibold border-2 transition-colors hover:bg-[#D8F3DC]"
                style={{ borderColor: '#2D6A4F', color: '#2D6A4F', backgroundColor: 'transparent' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Word (.docx)
              </a>
            </div>
          </div>
        </div>

        {/* What's included */}
        <div className="border px-5 py-4 mb-4" style={{ borderColor: '#E5E5E2', backgroundColor: '#FFFFFF' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>What&apos;s included</p>
          <div className="space-y-2">
            {[
              'Full UK-compliant contract — all clauses unlocked',
              'PDF version — ready to send or print',
              'Editable Word (.docx) — customise before signing',
              'IR35-aware · GDPR compliant · Governed by English & Welsh law',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#52B788' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs leading-relaxed" style={{ color: '#374151' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next step CTA */}
        <div className="border px-5 py-4 mb-4" style={{ borderColor: '#E5E5E2', backgroundColor: '#FAFAF8' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: '#1B4332' }}>Next step</p>
          <p className="text-xs mb-3" style={{ color: '#6B7280' }}>Go to your dashboard to sign and send the contract to your client.</p>
          <Link href="/app" className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold border transition-colors hover:bg-[#D8F3DC]" style={{ borderColor: '#2D6A4F', color: '#2D6A4F' }}>
            Go to dashboard →
          </Link>
        </div>

        <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>
          Need help?{' '}
          <a href="mailto:support@clausekit.co.uk" className="hover:opacity-70 transition-opacity" style={{ color: '#2D6A4F' }}>
            support@clausekit.co.uk
          </a>
        </p>

        {/* Footer legal note */}
        <p className="text-xs text-center mt-6" style={{ color: '#9CA3AF' }}>
          © 2026 ClauseKit · Not legal advice ·{' '}
          <Link href="/terms" className="hover:opacity-70 transition-opacity" style={{ color: '#9CA3AF' }}>Terms</Link>
          {' · '}
          <Link href="/privacy" className="hover:opacity-70 transition-opacity" style={{ color: '#9CA3AF' }}>Privacy</Link>
        </p>
      </div>
    </main>
  );
}
