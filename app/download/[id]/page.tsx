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
    <main className="min-h-screen bg-white max-w-2xl mx-auto px-6 py-16 text-center">
      <div className="mb-10">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
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
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment confirmed</h1>
        <p className="text-gray-500">Your document is ready to download.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href={`/api/download/pdf?contractId=${contractId}&session=${sessionId}`}
          className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Download PDF
        </a>
        <a
          href={`/api/download/docx?contractId=${contractId}&session=${sessionId}`}
          className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-indigo-400 hover:text-indigo-600 transition-colors"
        >
          Download Word (.docx)
        </a>
      </div>

      <p className="mt-10 text-sm text-gray-400">
        <Link href="/create" className="text-indigo-600 hover:underline">
          Generate another document
        </Link>
      </p>
    </main>
  );
}
