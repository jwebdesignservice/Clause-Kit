import Link from 'next/link'
import { FileText } from 'lucide-react'

export const metadata = { title: 'Refund Policy — ClauseKit' }

export default function RefundsPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF8', fontFamily: 'Inter, sans-serif' }}>
      <div className="flex items-center justify-center gap-3 px-4 py-2 text-xs font-medium w-full" style={{ backgroundColor: '#1B4332', color: '#D8F3DC' }}>
        <span>UK law only</span><span style={{ color: '#52B788' }}>·</span>
        <span>Solicitor-reviewed</span><span style={{ color: '#52B788' }}>·</span>
        <span>ClauseKit</span>
      </div>
      <header className="border-b bg-white" style={{ borderColor: '#E5E5E2' }}>
        <div className="max-w-3xl mx-auto px-6 h-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center" style={{ backgroundColor: '#2D6A4F' }}>
              <FileText className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight" style={{ color: '#1B4332' }}>ClauseKit</span>
          </Link>
          <Link href="/app" className="text-xs font-medium hover:opacity-70" style={{ color: '#2D6A4F' }}>← Back to dashboard</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="border bg-white p-8" style={{ borderColor: '#E5E5E2' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#9CA3AF' }}>Last updated: 29 March 2026</p>
          <h1 className="text-2xl font-bold mb-6" style={{ color: '#1B4332' }}>Refund Policy</h1>

          <div className="space-y-6 text-sm leading-relaxed" style={{ color: '#374151' }}>
            <section>
              <h2 className="text-base font-bold mb-2" style={{ color: '#1B4332' }}>Pay-per-doc (£7)</h2>
              <p>Because contracts are digital goods delivered instantly upon download, <strong>pay-per-doc purchases are non-refundable once the document has been accessed or downloaded.</strong></p>
              <p className="mt-2">If you experienced a technical failure and were charged but did not receive your document, contact us within 7 days at <a href="mailto:hello@clausekit.com" className="underline" style={{ color: '#2D6A4F' }}>hello@clausekit.com</a> and we will investigate and issue a refund if appropriate.</p>
              <p className="mt-2">This policy is consistent with the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013, which provide that the 14-day cooling-off period does not apply to digital content that has been accessed with your prior consent.</p>
            </section>

            <section>
              <h2 className="text-base font-bold mb-2" style={{ color: '#1B4332' }}>Pro plan (£19/month)</h2>
              <ul className="space-y-2 ml-4">
                <li>You may cancel your Pro plan at any time — no further payments will be taken after cancellation</li>
                <li>Your plan remains active until the end of your current billing period</li>
                <li>We do not provide partial-month refunds for unused subscription time</li>
                <li>If you cancel within 14 days of first subscribing and have not used the service, contact us for a full refund</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold mb-2" style={{ color: '#1B4332' }}>How to request a refund</h2>
              <p>Email <a href="mailto:hello@clausekit.com" className="underline" style={{ color: '#2D6A4F' }}>hello@clausekit.com</a> with:</p>
              <ul className="space-y-2 ml-4 mt-2">
                <li>Your email address</li>
                <li>The date of purchase</li>
                <li>A brief description of the issue</li>
              </ul>
              <p className="mt-2">We aim to respond within 2 business days.</p>
            </section>

            <section>
              <h2 className="text-base font-bold mb-2" style={{ color: '#1B4332' }}>Technical issues</h2>
              <p>If ClauseKit fails to generate a contract due to a technical error on our end, we will either regenerate your document or issue a full refund — your choice.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
