import Link from 'next/link'
import { FileText } from 'lucide-react'

export const metadata = { title: 'Privacy Policy — ClauseKit' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF8', fontFamily: 'Inter, sans-serif' }}>
      {/* Trust banner */}
      <div className="flex items-center justify-center gap-3 px-4 py-2 text-xs font-medium w-full" style={{ backgroundColor: '#1B4332', color: '#D8F3DC' }}>
        <span>UK law only</span><span style={{ color: '#52B788' }}>·</span>
        <span>Solicitor-reviewed</span><span style={{ color: '#52B788' }}>·</span>
        <span>ClauseKit</span>
      </div>
      {/* Header */}
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
          <h1 className="text-2xl font-bold mb-6" style={{ color: '#1B4332' }}>Privacy Policy</h1>

          <div className="space-y-6 text-sm leading-relaxed" style={{ color: '#374151' }}>
            <section>
              <h2 className="text-base font-bold mb-2" style={{ color: '#1B4332' }}>1. Who we are</h2>
              <p>ClauseKit is operated by JWebDesign (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;). We provide AI-powered UK contract generation services at clausekit.com. For privacy matters, contact us at <a href="mailto:hello@clausekit.com" className="underline" style={{ color: '#2D6A4F' }}>hello@clausekit.com</a>.</p>
            </section>

            <section>
              <h2 className="text-base font-bold mb-2" style={{ color: '#1B4332' }}>2. What data we collect</h2>
              <ul className="space-y-2 ml-4">
                <li><strong>Account data:</strong> name, email address when you sign up or use Google OAuth</li>
                <li><strong>Contract data:</strong> the information you enter into our intake forms to generate contracts</li>
                <li><strong>Payment data:</strong> processed entirely by Stripe — we never store card details</li>
                <li><strong>Usage data:</strong> pages visited, features used, for improving the service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold mb-2" style={{ color: '#1B4332' }}>3. How we use your data</h2>
              <ul className="space-y-2 ml-4">
                <li>To generate and deliver your contracts</li>
                <li>To process payments via Stripe</li>
                <li>To manage your subscription</li>
                <li>To send transactional emails (contract delivery, receipts)</li>
                <li>To improve our service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold mb-2" style={{ color: '#1B4332' }}>4. Contract content</h2>
              <p>Contract content you generate is processed by OpenAI&apos;s API to produce the document. We do not permanently store your contract content on our servers beyond what is needed to deliver the download. We do not use your contract content to train AI models. OpenAI&apos;s data usage policies apply to processing — see <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noreferrer" className="underline" style={{ color: '#2D6A4F' }}>openai.com/policies/privacy-policy</a>.</p>
            </section>

            <section>
              <h2 className="text-base font-bold mb-2" style={{ color: '#1B4332' }}>5. Data sharing</h2>
              <p>We do not sell your personal data. We share data only with:</p>
              <ul className="space-y-2 ml-4 mt-2">
                <li><strong>Stripe</strong> — payment processing</li>
                <li><strong>OpenAI</strong> — contract generation</li>
                <li><strong>Resend</strong> — transactional email delivery</li>
                <li><strong>Vercel</strong> — hosting infrastructure</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold mb-2" style={{ color: '#1B4332' }}>6. Data retention</h2>
              <p>We retain your account data for as long as your account is active. Contract records are retained for 90 days. You may request deletion at any time by emailing <a href="mailto:hello@clausekit.com" className="underline" style={{ color: '#2D6A4F' }}>hello@clausekit.com</a>.</p>
            </section>

            <section>
              <h2 className="text-base font-bold mb-2" style={{ color: '#1B4332' }}>7. Your rights (UK GDPR)</h2>
              <p>Under the UK GDPR and Data Protection Act 2018, you have the right to: access your data, rectify inaccurate data, erase your data, restrict processing, data portability, and object to processing. To exercise any right, contact <a href="mailto:hello@clausekit.com" className="underline" style={{ color: '#2D6A4F' }}>hello@clausekit.com</a>.</p>
            </section>

            <section>
              <h2 className="text-base font-bold mb-2" style={{ color: '#1B4332' }}>8. Cookies</h2>
              <p>We use only essential cookies required for authentication and session management. We do not use tracking or advertising cookies.</p>
            </section>

            <section>
              <h2 className="text-base font-bold mb-2" style={{ color: '#1B4332' }}>9. Changes</h2>
              <p>We may update this policy. We will notify you of material changes by email or a prominent notice on the site.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
