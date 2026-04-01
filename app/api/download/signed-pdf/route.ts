import { NextRequest, NextResponse } from 'next/server'
import { getContractAsync } from '@/lib/contract-store'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const contractId = searchParams.get('contractId')

  if (!contractId) {
    return NextResponse.json({ error: 'Missing contractId' }, { status: 400 })
  }

  const contract = await getContractAsync(contractId)
  if (!contract) {
    return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
  }

  if (contract.status !== 'completed') {
    return NextResponse.json({ error: 'Contract not yet fully signed' }, { status: 400 })
  }

  // Generate a simple text-based PDF (for now, can be enhanced with proper PDF generation)
  // Using a basic HTML-to-text approach for the download
  const party1Sig = contract.party1Signature
  const party2Sig = contract.party2Signature

  const signedContent = `
${contract.title}
${'='.repeat(60)}

${contract.content}

${'='.repeat(60)}
SIGNATURES
${'='.repeat(60)}

PARTY 1 - ${contract.party1?.name || 'Provider'}
Signed by: ${party1Sig?.printedName || 'N/A'}
Date: ${party1Sig?.signedAt ? new Date(party1Sig.signedAt).toLocaleDateString('en-GB') : 'N/A'}
IP Address: ${party1Sig?.ipAddress || 'N/A'}

PARTY 2 - ${contract.party2?.name || 'Client'}
Signed by: ${party2Sig?.printedName || 'N/A'}
Date: ${party2Sig?.signedAt ? new Date(party2Sig.signedAt).toLocaleDateString('en-GB') : 'N/A'}
IP Address: ${party2Sig?.ipAddress || 'N/A'}

${'='.repeat(60)}
This document was electronically signed via ClauseKit.
Legally binding under the Electronic Communications Act 2000.
`

  // Return as downloadable text file (can be upgraded to proper PDF later)
  return new NextResponse(signedContent, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${contract.title.replace(/[^a-zA-Z0-9]/g, '_')}_signed.txt"`,
    },
  })
}
