export default function PreviewPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen bg-white max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Contract Preview</h1>
      <p className="text-gray-500">Preview for contract {params.id} — coming soon.</p>
    </main>
  );
}
