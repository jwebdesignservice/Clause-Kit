import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create a UK Contract – Choose Your Type",
  description:
    "Choose from 8 contract types for UK freelancers and businesses. Customise with plain-English questions — ready in minutes.",
  openGraph: {
    title: "Build Your UK Contract in Minutes | ClauseKit",
    description:
      "Freelance, NDA, retainer, and more — pick a template and we'll customise it for you.",
  },
};

const CONTRACT_TYPES = [
  { slug: "freelance", label: "Freelance / Project Agreement" },
  { slug: "nda", label: "NDA" },
  { slug: "retainer", label: "Retainer Agreement" },
  { slug: "subcontractor", label: "Subcontractor Agreement" },
  { slug: "service", label: "Client Service Agreement" },
  { slug: "terms", label: "Website Terms & Conditions" },
  { slug: "debt", label: "Late Payment / Debt Recovery" },
  { slug: "employment", label: "Employment Offer Letter" },
];

export default function CreatePage() {
  return (
    <main className="min-h-screen bg-white max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">What type of contract do you need?</h1>
      <p className="text-gray-500 mb-10">Pick a template and we&apos;ll ask you a few questions to customise it.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CONTRACT_TYPES.map((ct) => (
          <Link
            key={ct.slug}
            href={`/intake/${ct.slug}`}
            className="border border-gray-200 rounded-xl p-5 hover:border-indigo-400 hover:shadow-sm transition-all font-semibold text-gray-900 hover:text-indigo-600"
          >
            {ct.label}
          </Link>
        ))}
      </div>
    </main>
  );
}
