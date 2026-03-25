import { getContract } from '@/lib/contract-store';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PaywallClient from './PaywallClient';

export const metadata = {
  title: 'Contract Preview',
};

/**
 * Split plain-text contract content into a visible first section
 * and blurred remainder. We show everything up to (but not including)
 * the second top-level numbered clause, e.g. "2. SERVICES".
 */
function splitContractContent(content: string): {
  visible: string;
  blurred: string;
} {
  const lines = content.split('\n');

  // Find lines that start a new top-level numbered section (e.g. "2.", "3.")
  const sectionStarts: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^\d+\.\s+\S/.test(lines[i].trim())) {
      sectionStarts.push(i);
    }
  }

  // Show through the end of the first top-level section.
  // If there are 2+ sections, cut before the second one.
  // If the contract has no numbered sections, show first 30 lines.
  let cutIndex: number;
  if (sectionStarts.length >= 2) {
    cutIndex = sectionStarts[1];
  } else if (sectionStarts.length === 1) {
    // Only one section found — show first 40 lines
    cutIndex = Math.min(40, Math.floor(lines.length * 0.3));
  } else {
    cutIndex = Math.min(30, Math.floor(lines.length * 0.25));
  }

  const visible = lines.slice(0, cutIndex).join('\n');
  const blurred = lines.slice(cutIndex).join('\n');
  return { visible, blurred };
}

export default async function PreviewPage({
  params,
}: {
  params: { id: string };
}) {
  const contract = getContract(params.id);

  if (!contract) {
    notFound();
  }

  const { visible, blurred } = splitContractContent(contract.content);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/create" className="text-indigo-600 font-semibold text-lg tracking-tight">
            ClauseKit
          </Link>
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            Preview
          </span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Document meta */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wide">
              {contract.contractType.replace(/-/g, ' ')}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{contract.title}</h1>
          <p className="text-sm text-gray-400 mt-1">
            Generated{' '}
            {new Date(contract.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Document card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Document header bar */}
          <div className="px-8 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gray-200" />
              <div className="w-3 h-3 rounded-full bg-gray-200" />
              <div className="w-3 h-3 rounded-full bg-gray-200" />
            </div>
            <span className="text-xs text-gray-400 ml-1 font-mono">{contract.title}.pdf</span>
          </div>

          {/* Contract content */}
          <div className="px-8 py-8">
            <PaywallClient
              contractId={contract.id}
              visibleContent={visible}
              blurredContent={blurred}
              title={contract.title}
            />
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-8">
          This is a preview of your generated contract.{' '}
          <Link href="/create" className="text-indigo-500 hover:underline">
            Generate a new document
          </Link>
        </p>
      </div>
    </main>
  );
}
