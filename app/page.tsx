import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ClauseKit – UK Contracts in Under 2 Minutes",
  description:
    "Generate bespoke UK-law contracts instantly. No jargon, no subscription. Pay £7 per contract or £19/month for unlimited downloads.",
  openGraph: {
    title: "ClauseKit – Professional UK Contracts, Instantly",
    description:
      "Answer a few plain-English questions and get a UK-law contract ready to download as PDF or Word. No account needed.",
  },
};

const CONTRACT_TYPES = [
  { slug: "freelance", label: "Freelance / Project Agreement", desc: "Web, design, marketing & creative projects" },
  { slug: "nda", label: "NDA", desc: "Mutual & one-way non-disclosure agreements" },
  { slug: "retainer", label: "Retainer Agreement", desc: "Ongoing services with monthly fee" },
  { slug: "subcontractor", label: "Subcontractor Agreement", desc: "Bring in a third party to deliver work" },
  { slug: "service", label: "Client Service Agreement", desc: "General client services contract" },
  { slug: "terms", label: "Website Terms & Conditions", desc: "Legal T&Cs for your website or app" },
  { slug: "debt", label: "Late Payment / Debt Recovery", desc: "Chase unpaid invoices professionally" },
  { slug: "employment", label: "Employment Offer Letter", desc: "Basic offer letter for new hires" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-gray-900">ClauseKit</span>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <Link href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
          <Link href="/create" className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            Create contract
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <p className="text-sm font-medium text-indigo-600 mb-4 uppercase tracking-wide">UK Law · Instant · No legal jargon</p>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Professional UK contracts<br />in under 2 minutes
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Answer a few plain-English questions. Get a bespoke, UK-law contract — ready to download as PDF or Word. No subscription needed.
        </p>
        <Link
          href="/create"
          className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md"
        >
          Create a contract — £7
        </Link>
        <p className="mt-4 text-sm text-gray-400">No account needed to generate · Pay only to download</p>
      </section>

      {/* Contract types */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">8 contract types ready to go</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CONTRACT_TYPES.map((ct) => (
            <Link
              key={ct.slug}
              href={`/intake/${ct.slug}`}
              className="border border-gray-200 rounded-xl p-5 hover:border-indigo-400 hover:shadow-sm transition-all group"
            >
              <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors mb-1">{ct.label}</p>
              <p className="text-sm text-gray-500">{ct.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-12 text-center">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 text-xl font-bold flex items-center justify-center mb-4">1</div>
            <h3 className="font-semibold text-gray-900 mb-2">Describe your contract</h3>
            <p className="text-sm text-gray-500">Answer a few plain-English questions about your project, client, and terms.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 text-xl font-bold flex items-center justify-center mb-4">2</div>
            <h3 className="font-semibold text-gray-900 mb-2">Generate instantly</h3>
            <p className="text-sm text-gray-500">GPT-4o drafts a bespoke UK-law contract in seconds, tailored to your answers.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 text-xl font-bold flex items-center justify-center mb-4">3</div>
            <h3 className="font-semibold text-gray-900 mb-2">Download &amp; use</h3>
            <p className="text-sm text-gray-500">Pay £7 to unlock your full contract as PDF or Word — ready to sign straight away.</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gray-50 py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-12">Simple pricing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <p className="text-3xl font-bold text-gray-900 mb-1">£7</p>
              <p className="text-gray-500 mb-6">per contract</p>
              <p className="text-sm text-gray-600">Generate free, pay to unlock full PDF + Word download.</p>
            </div>
            <div className="bg-indigo-600 text-white rounded-2xl p-8">
              <p className="text-3xl font-bold mb-1">£19<span className="text-lg font-normal">/mo</span></p>
              <p className="text-indigo-200 mb-6">unlimited contracts</p>
              <p className="text-sm text-indigo-100">Unlimited downloads. Cancel anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8 text-center text-sm text-gray-400">
        <p>ClauseKit — AI-generated contracts for UK freelancers & small businesses.</p>
        <p className="mt-1">Not legal advice. Consider review by a qualified solicitor.</p>
      </footer>
    </main>
  );
}
