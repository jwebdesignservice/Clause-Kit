import { NextRequest, NextResponse } from 'next/server'
import { getContractAsync } from '@/lib/contract-store'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const contract = await getContractAsync(params.id)
  
  if (!contract) {
    return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
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
