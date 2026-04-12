import { notFound } from 'next/navigation'
import { verifySigningToken } from '@/lib/signing'
import { getContractAsync } from '@/lib/contract-store'
import SigningClient from './SigningClient'

interface Props {
  params: { contractId: string }
  searchParams: { token?: string }
}

export default async function SignPage({ params, searchParams }: Props) {
  const { contractId } = params
  const token = searchParams.token

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAF8' }}>
        <div className="text-center p-8">
          <h1 className="font-display text-xl font-bold mb-2" style={{ color: '#1B4332' }}>Invalid signing link</h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>This link is missing a signing token. Please check your email.</p>
        </div>
      </div>
    )
  }

  const payload = verifySigningToken(token)
  if (!payload || payload.contractId !== contractId) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAF8' }}>
        <div className="text-center p-8">
          <h1 className="font-display text-xl font-bold mb-2" style={{ color: '#1B4332' }}>Link expired</h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>This signing link has expired or is invalid. Contact the sender for a new link.</p>
        </div>
      </div>
    )
  }

  const contract = await getContractAsync(contractId)
  if (!contract) return notFound()

  if (payload.role === 'party1' && contract.party1Signature) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAF8' }}>
        <div className="text-center p-8">
          <h1 className="font-display text-xl font-bold mb-2" style={{ color: '#1B4332' }}>Already signed</h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>You have already signed this contract.</p>
        </div>
      </div>
    )
  }

  if (payload.role === 'party2' && contract.party2Signature) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAF8' }}>
        <div className="text-center p-8">
          <h1 className="font-display text-xl font-bold mb-2" style={{ color: '#1B4332' }}>Already signed</h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>You have already signed this contract.</p>
        </div>
      </div>
    )
  }

  return (
    <SigningClient
      contractId={contractId}
      token={token}
      role={payload.role}
      title={contract.title}
      content={contract.content}
      party1={contract.party1}
      party2={contract.party2}
      party1Signed={!!contract.party1Signature}
      party1PrintedName={contract.party1Signature?.printedName}
      party1SignedAt={contract.party1Signature?.signedAt}
      party1SignatureUrl={contract.party1Signature?.dataUrl}
    />
  )
}
