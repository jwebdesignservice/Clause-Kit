import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getContractAsync } from '@/lib/contract-store'
import { verifySigningToken } from '@/lib/signing'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const contract = await getContractAsync(params.id)

  if (!contract) {
    return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
  }

  // Access control: allow if
  //  (a) authenticated user owns the contract, OR
  //  (b) caller holds a valid signing token for either party
  const session = await getServerSession(authOptions)
  const callerEmail = session?.user?.email?.toLowerCase() ?? null
  const ownerEmail = (contract.userId ?? contract.party1?.email ?? '').toLowerCase()

  let authorized = false
  if (callerEmail && ownerEmail && callerEmail === ownerEmail) {
    authorized = true
  } else {
    const token = req.nextUrl.searchParams.get('token')
    if (token) {
      const payload = verifySigningToken(token)
      if (payload && payload.contractId === params.id) authorized = true
    }
  }

  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    id: contract.id,
    title: contract.title,
    status: contract.status,
    party1: contract.party1,
    party2: contract.party2,
    party1Signed: !!contract.party1Signature,
    party2Signed: !!contract.party2Signature,
  })
}
