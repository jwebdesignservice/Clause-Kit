import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getContractAsync,
  updateContractAsync,
  saveContractAsync,
  type ContractRecord,
} from '@/lib/contract-store'

/**
 * Persist the sender's (party1) signature on a draft contract.
 *
 * Called from the dashboard before any flow that might redirect the user away
 * (e.g. the £7 Stripe checkout) — once the signature is in KV it survives the
 * redirect and is rendered in the downloaded PDF.
 *
 * If the contract record doesn't exist yet (sign before any send), this also
 * creates a minimal draft record so the signature is not orphaned.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const callerEmail = session?.user?.email?.toLowerCase() ?? null
  if (!callerEmail) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  let body: {
    contractId: string
    signatureDataUrl: string
    printedName: string
    signedAt?: string
    // Optional scaffolding so we can save a draft if no record exists yet
    title?: string
    content?: string
    contractType?: string
    party1?: { name?: string; email?: string; company?: string; address?: string }
    party2?: { name?: string; email?: string; company?: string; address?: string }
    docFont?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { contractId, signatureDataUrl, printedName } = body
  if (!contractId || !signatureDataUrl || !printedName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!signatureDataUrl.startsWith('data:image/')) {
    return NextResponse.json({ error: 'Invalid signature format' }, { status: 400 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const signedAt = body.signedAt || new Date().toISOString()
  const sig = { dataUrl: signatureDataUrl, printedName, signedAt, ipAddress: ip }

  const existing = await getContractAsync(contractId)

  if (existing) {
    // Ownership check — only the user who created the contract (or whose
    // email matches party1) may save a sender signature.
    const ownerEmail = (existing.userId ?? existing.party1?.email ?? '').toLowerCase()
    if (ownerEmail && ownerEmail !== callerEmail) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Guard: if the sender has already signed, don't overwrite.
    if (existing.party1Signature) {
      return NextResponse.json({ error: 'Sender has already signed this contract' }, { status: 409 })
    }

    await updateContractAsync(contractId, { party1Signature: sig })
    return NextResponse.json({ success: true })
  }

  // No existing record — create a draft so the signature survives the Stripe redirect.
  const record: ContractRecord = {
    id: contractId,
    contractType: body.contractType || 'unknown',
    title: body.title || 'Contract Agreement',
    content: body.content || '',
    createdAt: new Date().toISOString(),
    status: 'draft',
    userId: callerEmail,
    party1: body.party1
      ? {
          name: body.party1.name || '',
          email: body.party1.email || callerEmail,
          address: body.party1.address || '',
          company: body.party1.company || '',
        }
      : { name: '', email: callerEmail, address: '' },
    party2: body.party2
      ? {
          name: body.party2.name || '',
          email: body.party2.email || '',
          address: body.party2.address || '',
          company: body.party2.company || '',
        }
      : undefined,
    docFont: body.docFont,
    party1Signature: sig,
  }

  await saveContractAsync(record)
  return NextResponse.json({ success: true })
}
