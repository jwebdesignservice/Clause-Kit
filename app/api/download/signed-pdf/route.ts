import { NextRequest, NextResponse } from 'next/server'
import { getContractAsync } from '@/lib/contract-store'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

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

  const party1Sig = contract.party1Signature
  const party2Sig = contract.party2Signature

  // Create PDF
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  
  const darkGreen = rgb(0.106, 0.263, 0.196) // #1B4332
  const midGreen = rgb(0.176, 0.416, 0.310)  // #2D6A4F
  const gray = rgb(0.216, 0.255, 0.318)      // #374151
  const lightGray = rgb(0.612, 0.639, 0.686) // #9CA3AF
  
  const pageWidth = 595 // A4 width in points
  const pageHeight = 842 // A4 height in points
  const margin = 50
  const contentWidth = pageWidth - (margin * 2)
  
  let currentPage = pdfDoc.addPage([pageWidth, pageHeight])
  let y = pageHeight - margin
  
  const addNewPageIfNeeded = (neededSpace: number) => {
    if (y - neededSpace < margin) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight])
      y = pageHeight - margin
    }
  }
  
  // Sanitize all text fields — pdf-lib standard fonts only support latin-1
  const s = (str: string) => str.replace(/[^\x00-\xFF]/g, '?')

  // Draw header bar
  currentPage.drawRectangle({
    x: 0,
    y: pageHeight - 40,
    width: pageWidth,
    height: 40,
    color: darkGreen,
  })
  
  currentPage.drawText('ClauseKit', {
    x: margin,
    y: pageHeight - 28,
    size: 14,
    font: fontBold,
    color: rgb(1, 1, 1),
  })
  
  currentPage.drawText('SIGNED CONTRACT', {
    x: pageWidth - margin - 100,
    y: pageHeight - 28,
    size: 10,
    font: fontBold,
    color: rgb(0.322, 0.718, 0.545), // #52B788
  })
  
  y = pageHeight - 70
  
  // Title
  currentPage.drawText(s(contract.title), {
    x: margin,
    y,
    size: 20,
    font: fontBold,
    color: darkGreen,
  })
  y -= 30
  
  // Status badge
  currentPage.drawRectangle({
    x: margin,
    y: y - 4,
    width: 120,
    height: 20,
    color: rgb(0.847, 0.953, 0.863), // #D8F3DC
  })
  currentPage.drawText('FULLY EXECUTED', {
    x: margin + 8,
    y: y,
    size: 10,
    font: fontBold,
    color: midGreen,
  })
  y -= 40
  
  // Contract content
  // Strip non-latin characters that crash Helvetica (pdf-lib standard fonts are latin-1 only)
  const sanitize = (str: string) => str.replace(/[^\x00-\xFF]/g, '?')
  const lines = sanitize(contract.content).split('\n')
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      y -= 10
      continue
    }
    
    addNewPageIfNeeded(20)
    
    // Check if it's a section heading (numbered like "01. HEADING" or ALL CAPS)
    const isHeading = /^\d{2}\.\s+[A-Z]/.test(trimmed) || (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.length < 60)
    
    if (isHeading) {
      y -= 10
      currentPage.drawLine({
        start: { x: margin, y: y + 12 },
        end: { x: margin + contentWidth, y: y + 12 },
        thickness: 1,
        color: rgb(0.847, 0.953, 0.863),
      })
      currentPage.drawText(trimmed, {
        x: margin,
        y,
        size: 11,
        font: fontBold,
        color: darkGreen,
      })
      y -= 20
    } else {
      // Wrap text
      const words = trimmed.split(' ')
      let currentLine = ''
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word
        const textWidth = font.widthOfTextAtSize(testLine, 10)
        
        if (textWidth > contentWidth) {
          addNewPageIfNeeded(14)
          currentPage.drawText(currentLine, {
            x: margin,
            y,
            size: 10,
            font,
            color: gray,
          })
          y -= 14
          currentLine = word
        } else {
          currentLine = testLine
        }
      }
      
      if (currentLine) {
        addNewPageIfNeeded(14)
        currentPage.drawText(currentLine, {
          x: margin,
          y,
          size: 10,
          font,
          color: gray,
        })
        y -= 14
      }
    }
  }
  
  // Signature section
  y -= 30
  addNewPageIfNeeded(200)
  
  currentPage.drawLine({
    start: { x: margin, y },
    end: { x: margin + contentWidth, y },
    thickness: 2,
    color: darkGreen,
  })
  y -= 25
  
  currentPage.drawText('SIGNATURES', {
    x: margin,
    y,
    size: 14,
    font: fontBold,
    color: darkGreen,
  })
  y -= 30
  
  // Party 1 signature
  currentPage.drawRectangle({
    x: margin,
    y: y - 60,
    width: (contentWidth / 2) - 10,
    height: 80,
    borderColor: midGreen,
    borderWidth: 1,
  })
  
  currentPage.drawText(s(`PARTY 1 - ${contract.party1?.name || 'Provider'}`), {
    x: margin + 10,
    y: y - 15,
    size: 9,
    font: fontBold,
    color: darkGreen,
  })
  
  currentPage.drawText(s(`Signed by: ${party1Sig?.printedName || contract.party1?.name || 'N/A'}`), {
    x: margin + 10,
    y: y - 30,
    size: 9,
    font,
    color: gray,
  })

  currentPage.drawText(`Date: ${party1Sig?.signedAt ? new Date(party1Sig.signedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : contract.createdAt ? new Date(contract.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}`, {
    x: margin + 10,
    y: y - 42,
    size: 9,
    font,
    color: gray,
  })

  currentPage.drawText(`IP: ${party1Sig?.ipAddress || 'N/A'}`, {
    x: margin + 10,
    y: y - 54,
    size: 8,
    font,
    color: lightGray,
  })
  
  // Party 2 signature
  const party2X = margin + (contentWidth / 2) + 10
  currentPage.drawRectangle({
    x: party2X,
    y: y - 60,
    width: (contentWidth / 2) - 10,
    height: 80,
    borderColor: midGreen,
    borderWidth: 1,
  })
  
  currentPage.drawText(s(`PARTY 2 - ${contract.party2?.name || 'Client'}`), {
    x: party2X + 10,
    y: y - 15,
    size: 9,
    font: fontBold,
    color: darkGreen,
  })
  
  currentPage.drawText(`Signed by: ${party2Sig?.printedName || 'N/A'}`, {
    x: party2X + 10,
    y: y - 30,
    size: 9,
    font,
    color: gray,
  })
  
  currentPage.drawText(`Date: ${party2Sig?.signedAt ? new Date(party2Sig.signedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}`, {
    x: party2X + 10,
    y: y - 42,
    size: 9,
    font,
    color: gray,
  })
  
  currentPage.drawText(`IP: ${party2Sig?.ipAddress || 'N/A'}`, {
    x: party2X + 10,
    y: y - 54,
    size: 8,
    font,
    color: lightGray,
  })
  
  y -= 80
  
  // Footer
  y -= 20
  currentPage.drawText('This document was electronically signed via ClauseKit.', {
    x: margin,
    y,
    size: 8,
    font,
    color: lightGray,
  })
  y -= 12
  currentPage.drawText('Legally binding under the Electronic Communications Act 2000.', {
    x: margin,
    y,
    size: 8,
    font,
    color: lightGray,
  })
  
  const pdfBytes = await pdfDoc.save()
  
  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${contract.title.replace(/[^a-zA-Z0-9]/g, '_')}_signed.pdf"`,
    },
  })
}
