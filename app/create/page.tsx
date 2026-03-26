import type { Metadata } from "next";
import Link from "next/link";
import { CONTRACT_TYPES } from "@/lib/contract-types";
import CustomContractInput from "./CustomContractInput";

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

export default function CreatePage() {
  return (
    <main className="min-h-screen bg-white max-w-3xl mx-auto px-6 py-16">
      <Link
        href="/"
        className="inline-block text-sm font-semibold mb-10"
        style={{ color: '#2D6A4F' }}
      >
        ← ClauseKit
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        What type of contract do you need?
      </h1>
      <p className="text-gray-500 mb-10">
        Pick a template and we&apos;ll ask you a few questions to customise it.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {CONTRACT_TYPES.map((ct) => (
          <Link
            key={ct.id}
            href={`/intake/${ct.id}`}
            className="group border rounded-xl p-5 hover:shadow-sm transition-all"
            style={{ borderColor: '#E5E5E2' }}
          >
            <div className="text-2xl mb-2">{ct.icon}</div>
            <div
              className="font-semibold text-sm mb-1 group-hover:opacity-80 transition-opacity"
              style={{ color: '#1B4332' }}
            >
              {ct.title}
            </div>
            <div className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>
              {ct.description}
            </div>
          </Link>
        ))}
      </div>

      {/* Custom contract */}
      <div
        className="border border-dashed rounded-xl p-6"
        style={{ borderColor: '#D1D5DB' }}
      >
        <p className="text-sm font-semibold text-gray-900 mb-1">Need something different?</p>
        <p className="text-xs text-gray-500 mb-4">
          Describe what you need and we&apos;ll draft a bespoke UK contract.
        </p>
        <CustomContractInput />
      </div>
    </main>
  );
}
