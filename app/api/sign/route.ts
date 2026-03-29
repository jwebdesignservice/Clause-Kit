import { NextRequest, NextResponse } from 'next/server'
import { verifySigningToken } from '@/lib/signing'
import { getContractAsync, updateContractAsync } from '@/lib/contract-store'
import { sendContractComplete, sendClientSignedCopy } from '@/lib/email'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  let body: { contractId: string; token: string; signatureDataUrl: string; printedName: string; role: 'party1' | 'party2' }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { contractId, token, signatureDataUrl, printedName, role } = body
  if (!contractId || !token || !signatureDataUrl || !printedName || !role)
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  const payload = verifySigningToken(token)
  if (!payload || payload.contractId !== contractId || payload.role !== role)
    return NextResponse.json({ error: 'Invalid or expired signing link' }, { status: 401 })

  const contract = await getContractAsync(contractId)
  if (!contract) return NextResponse.json({ error: 'Contract not found' }, { status: 404 })

  const sig = { dataUrl: signatureDataUrl, printedName, signedAt: new Date().toISOString(), ipAddress: ip }

  if (role === 'party1') {
    await updateContractAsync(contractId, { party1Signature: sig, status: 'sent' })
    return NextResponse.json({ success: true, status: 'sent', message: `Contract sent to ${contract.party2?.email ?? 'client'} for signature` })
  }

  if (role === 'party2') {
    await updateContractAsync(contractId, { party2Signature: sig, status: 'completed' })
    try {
      if (contract.party1?.email) {
        await sendContractComplete({ to: contract.party1.email, userName: contract.party1.name, clientName: contract.party2?.name ?? 'your client', contractTitle: contract.title, contractId })
      }
      if (contract.party2?.email) {
        await sendClientSignedCopy({ to: contract.party2.email, clientName: contract.party2.name, contractTitle: contract.title, contractId })
      }
    } catch (e) { console.error('Email send failed:', e) }
    return NextResponse.json({ success: true, status: 'completed', message: 'Contract fully executed. Both parties notified.' })
  }

  return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const contractId = searchParams.get('contractId')
  const token = searchParams.get('token')
  if (!contractId || !token) return NextResponse.json({ error: 'Missing contractId or token' }, { status: 400 })

  const payload = verifySigningToken(token)
  if (!payload || payload.contractId !== contractId) return NextResponse.json({ error: 'Invalid or expired link' }, { status: 401 })

  const contract = await getContractAsync(contractId)
  if (!contract) return NextResponse.json({ error: 'Contract not found' }, { status: 404 })

  return NextResponse.json({
    contractId, title: contract.title, content: contract.content, role: payload.role,
    party1: contract.party1, party2: contract.party2,
    party1Signed: !!contract.party1Signature, party1SignedAt: contract.party1Signature?.signedAt,
    party1PrintedName: contract.party1Signature?.printedName, status: contract.status,
  })
}
