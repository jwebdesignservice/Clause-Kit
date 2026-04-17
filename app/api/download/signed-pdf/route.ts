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

  // pdf-lib Helvetica is latin-1 only — strip anything outside that range
  const s = (str: string) => str.replace(/[^\x00-\xFF]/g, '-')
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  const pdfDoc = await PDFDocument.create()

  // Map site font family → closest pdf-lib standard font
  const pickFonts = (fam?: string): [StandardFonts, StandardFonts] => {
    const f = (fam ?? '').toLowerCase()
    if (f.includes('georgia') || f.includes('times') || f.includes('garamond') || f.includes('serif'))
      return [StandardFonts.TimesRoman, StandardFonts.TimesRomanBold]
    if (f.includes('courier') || f.includes('mono'))
      return [StandardFonts.Courier, StandardFonts.CourierBold]
    return [StandardFonts.Helvetica, StandardFonts.HelveticaBold]
  }
  const [regular, bold] = pickFonts(contract.docFont)
  const font     = await pdfDoc.embedFont(regular)
  const fontBold = await pdfDoc.embedFont(bold)

  // Pre-embed signature images so we can draw them in the signature boxes
  const embedSig = async (dataUrl?: string) => {
    if (!dataUrl || !dataUrl.startsWith('data:image/')) return null
    try {
      const base64 = dataUrl.split(',')[1]
      if (!base64) return null
      const bytes = Buffer.from(base64, 'base64')
      if (dataUrl.includes('image/jpeg') || dataUrl.includes('image/jpg')) {
        return await pdfDoc.embedJpg(bytes)
      }
      return await pdfDoc.embedPng(bytes)
    } catch (e) {
      console.error('Signature embed failed:', e)
      return null
    }
  }
  const party1SigImg = await embedSig(party1Sig?.dataUrl)
  const party2SigImg = await embedSig(party2Sig?.dataUrl)

  const darkGreen = rgb(0.106, 0.263, 0.196) // #1B4332
  const midGreen  = rgb(0.176, 0.416, 0.310) // #2D6A4F
  const gray      = rgb(0.216, 0.255, 0.318) // #374151
  const lightGray = rgb(0.612, 0.639, 0.686) // #9CA3AF
  const paleGreen = rgb(0.847, 0.953, 0.863) // #D8F3DC
  const borderGray = rgb(0.898, 0.898, 0.886) // #E5E5E2

  const pageWidth    = 595
  const pageHeight   = 842
  const margin       = 50
  const contentWidth = pageWidth - margin * 2

  let page = pdfDoc.addPage([pageWidth, pageHeight])
  let y = pageHeight - margin

  const newPage = () => {
    page = pdfDoc.addPage([pageWidth, pageHeight])
    y = pageHeight - margin
  }

  const ensureSpace = (needed: number) => {
    if (y - needed < margin + 20) newPage()
  }

  // Draw wrapped text, advancing y. Returns nothing (mutates y).
  const drawWrapped = (
    text: string,
    opts: {
      x?: number
      size?: number
      bold?: boolean
      color?: ReturnType<typeof rgb>
      maxWidth?: number
      lineHeight?: number
    } = {}
  ) => {
    const {
      x = margin,
      size = 10,
      bold = false,
      color = gray,
      maxWidth = contentWidth - (x - margin),
      lineHeight = Math.ceil(size * 1.55),
    } = opts
    const f = bold ? fontBold : font
    const words = s(text).split(' ').filter(Boolean)
    let line = ''
    for (const word of words) {
      const test = line ? `${line} ${word}` : word
      if (f.widthOfTextAtSize(test, size) > maxWidth && line) {
        ensureSpace(lineHeight)
        page.drawText(line, { x, y, size, font: f, color })
        y -= lineHeight
        line = word
      } else {
        line = test
      }
    }
    if (line) {
      ensureSpace(lineHeight)
      page.drawText(line, { x, y, size, font: f, color })
      y -= lineHeight
    }
  }

  // ── Block parser — mirrors the website's parseBlock exactly ─────────────────
  const parseBlock = (text: string): {
    type: 'section' | 'party' | 'signature' | 'footer' | 'body'
    heading?: string
    body: string
  } => {
    const t = text.trim()
    if (t.startsWith('---') || t.startsWith('This document was generated'))
      return { type: 'footer', body: t }
    if (t.startsWith('PARTY 1 (') || t.startsWith('PARTY 2 (') || (t.startsWith('PARTY 1') && t.includes('Name:')))
      return { type: 'party', body: t }
    if (/^PARTY\s*[12]\s*[-—–]/i.test(t))
      return { type: 'signature', body: t }
    if (
      t.startsWith('ACCEPTANCE') ||
      (t.includes('Signature:') && t.includes('___')) ||
      (t.includes('___') && (t.includes('Full Name') || t.includes('Date:')))
    )
      return { type: 'signature', body: t }
    if (t.includes('Signature:') && t.includes('Full Name:'))
      return { type: 'signature', body: t }

    const sectionMatch = t.match(/^(\d{2}\.\s+[A-Z][A-Z\s&/]+?)(?:\s*[-–—]\s*|\n)([\s\S]+)/)
    if (sectionMatch)
      return { type: 'section', heading: sectionMatch[1].trim(), body: sectionMatch[2].trim() }
    if (/^\d{2}\.\s+[A-Z]/.test(t) && t.length < 80)
      return { type: 'section', heading: t, body: '' }
    if (t === t.toUpperCase() && t.length > 5 && t.length < 60 && !t.startsWith('-'))
      return { type: 'section', heading: t, body: '' }

    return { type: 'body', body: t }
  }

  // Render body text: handles bullets and sub-headings (matching FormattedBody on site)
  const renderBody = (text: string) => {
    for (const rawLine of text.split('\n')) {
      const t = rawLine.trim()
      if (!t) { y -= 5; continue }

      // Bullet
      if (t.startsWith('-') || t.startsWith('•')) {
        const content = t.replace(/^[-•]\s*/, '')
        ensureSpace(15)
        page.drawText('•', { x: margin + 8, y, size: 10, font, color: midGreen })
        drawWrapped(content, { x: margin + 20, size: 10, maxWidth: contentWidth - 20 })
        continue
      }

      // Sub-heading (short line ending in colon that isn't a field label)
      if (
        t.endsWith(':') &&
        t.length < 60 &&
        !/^(Signature|Full Name|Date|Email|Address|Name)\s*:/i.test(t)
      ) {
        ensureSpace(16)
        drawWrapped(t, { size: 10, bold: true, color: darkGreen })
        continue
      }

      drawWrapped(t, { size: 10, color: gray })
    }
  }

  // ── 1. Header bar ────────────────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: pageHeight - 40, width: pageWidth, height: 40, color: darkGreen })
  page.drawText('ClauseKit', { x: margin, y: pageHeight - 27, size: 14, font: fontBold, color: rgb(1, 1, 1) })
  page.drawText('SIGNED CONTRACT', {
    x: pageWidth - margin - 108,
    y: pageHeight - 27,
    size: 10,
    font: fontBold,
    color: rgb(0.322, 0.718, 0.545),
  })
  y = pageHeight - 65

  // ── 2. Title ─────────────────────────────────────────────────────────────────
  drawWrapped(contract.title, { size: 22, bold: true, color: darkGreen })
  y -= 2
  const subtitle = [contract.contractType, contract.createdAt ? `Generated ${fmtDate(contract.createdAt)}` : ''].filter(Boolean).join(' · ')
  if (subtitle) drawWrapped(subtitle, { size: 9, color: lightGray })
  y -= 6

  // Status badge
  page.drawRectangle({ x: margin, y: y - 5, width: 115, height: 18, color: paleGreen })
  page.drawText('FULLY EXECUTED', { x: margin + 8, y: y - 1, size: 9, font: fontBold, color: midGreen })
  y -= 30

  // ── 3. Party cards ───────────────────────────────────────────────────────────
  // Two side-by-side cards (Provider | Client) matching DocumentPartyHeader on site
  const cardW = (contentWidth - 10) / 2
  const p1 = contract.party1
  const p2 = contract.party2

  const drawPartyCard = (
    xStart: number,
    role: string,
    accentColor: ReturnType<typeof rgb>,
    fields: { label: string; value: string }[]
  ) => {
    const rowH = 16
    const cardH = 22 + fields.length * rowH + 8
    // Card border
    page.drawRectangle({ x: xStart, y: y - cardH + 18, width: cardW, height: cardH, borderColor: borderGray, borderWidth: 1 })
    // Accent left border
    page.drawRectangle({ x: xStart, y: y - cardH + 18, width: 4, height: cardH, color: accentColor })
    // Header strip
    page.drawRectangle({ x: xStart + 4, y: y - cardH + 18, width: cardW - 4, height: 18, color: rgb(0.980, 0.980, 0.976) })
    page.drawText(role.toUpperCase(), { x: xStart + 10, y: y + 1, size: 8, font: fontBold, color: lightGray })

    let cy = y - 18
    for (const { label, value } of fields) {
      if (!value) continue
      page.drawText(label.toUpperCase(), { x: xStart + 10, y: cy, size: 7, font: fontBold, color: lightGray })
      cy -= 11
      const displayVal = s(value)
      page.drawText(displayVal, { x: xStart + 10, y: cy, size: 9, font, color: rgb(0.102, 0.102, 0.102) })
      const vw = font.widthOfTextAtSize(displayVal, 9)
      page.drawLine({
        start: { x: xStart + 10, y: cy - 2 },
        end: { x: xStart + 10 + Math.min(vw + 2, cardW - 20), y: cy - 2 },
        thickness: 0.5,
        color: rgb(0.102, 0.102, 0.102),
      })
      cy -= rowH - 11 + 5
    }
    return cardH
  }

  const p1Fields = [
    { label: 'Name', value: p1?.name || '' },
    { label: 'Company Name', value: p1?.company || '' },
    { label: 'Business Email', value: p1?.email || '' },
    { label: 'Business Address', value: p1?.address || '' },
  ].filter(f => f.value)
  const p2Fields = [
    { label: 'Name', value: p2?.name || '' },
    { label: 'Company Name', value: p2?.company || '' },
    { label: 'Business Email', value: p2?.email || '' },
    { label: 'Business Address', value: p2?.address || '' },
  ].filter(f => f.value)

  const h1 = drawPartyCard(margin, 'Provider', darkGreen, p1Fields)
  const h2 = drawPartyCard(margin + cardW + 10, 'Client', midGreen, p2Fields)
  y -= Math.max(h1, h2) + 18

  // Thin divider below party cards
  page.drawLine({ start: { x: margin, y }, end: { x: margin + contentWidth, y }, thickness: 0.5, color: borderGray })
  y -= 18

  // ── 4. Document body ─────────────────────────────────────────────────────────
  const blocks = contract.content.split(/\n\n+/).filter(Boolean)
  let footerText = ''

  for (const block of blocks) {
    const parsed = parseBlock(block)

    // Party info and raw signature blocks are handled separately
    if (parsed.type === 'party' || parsed.type === 'signature') continue
    if (parsed.type === 'footer') { footerText = parsed.body; continue }

    if (parsed.type === 'section') {
      ensureSpace(40)
      y -= 14

      if (parsed.heading) {
        // Green underline above heading (matches website's border-b on the section heading div)
        page.drawLine({
          start: { x: margin, y: y + 14 },
          end: { x: margin + contentWidth, y: y + 14 },
          thickness: 0.75,
          color: paleGreen,
        })
        drawWrapped(parsed.heading, { size: 11, bold: true, color: darkGreen })
        y -= 3
      }
      if (parsed.body) {
        renderBody(parsed.body)
        y -= 4
      }
      continue
    }

    // Plain body block
    renderBody(parsed.body)
    y -= 4
  }

  // ── 5. Acceptance & Signatures ───────────────────────────────────────────────
  ensureSpace(220)
  y -= 24

  // Heavy dark green rule (matches border-t-2 on site's SignatureBlock)
  page.drawLine({ start: { x: margin, y }, end: { x: margin + contentWidth, y }, thickness: 2, color: darkGreen })
  y -= 16

  drawWrapped('ACCEPTANCE & SIGNATURES', { size: 12, bold: true, color: darkGreen })
  y -= 4
  drawWrapped(
    'By signing below, both parties confirm they have read, understood, and agree to all terms set out in this Agreement.',
    { size: 9, color: gray }
  )
  y -= 18

  // Two-column signature boxes
  const colW  = (contentWidth - 12) / 2
  const sigH  = 118
  ensureSpace(sigH + 20)

  const drawSigBox = (
    xStart: number,
    role: string,
    partyName: string | undefined,
    printedName: string | undefined,
    signedAt: string | undefined,
    ip: string | undefined,
    accentColor: ReturnType<typeof rgb>,
    sigImg: Awaited<ReturnType<typeof pdfDoc.embedPng>> | null,
  ) => {
    const name = printedName || partyName || 'N/A'
    const date = signedAt
      ? fmtDate(signedAt)
      : contract.createdAt
        ? fmtDate(contract.createdAt)
        : 'N/A'

    // Box
    page.drawRectangle({ x: xStart, y: y - sigH + 18, width: colW, height: sigH, borderColor: accentColor, borderWidth: 1 })
    // Header strip
    page.drawRectangle({ x: xStart, y: y - sigH + 18 + sigH - 18, width: colW, height: 18, color: rgb(0.933, 0.973, 0.949) })

    page.drawText(s(`${role} - ${partyName || 'N/A'}`), { x: xStart + 8, y: y + 1, size: 9, font: fontBold, color: darkGreen })

    // SIGNATURE label
    page.drawText('SIGNATURE', { x: xStart + 8, y: y - 20, size: 7, font: fontBold, color: lightGray })

    // Embed actual signature image, fit within box while preserving aspect ratio
    if (sigImg) {
      const maxW = colW - 16
      const maxH = 28
      const scale = Math.min(maxW / sigImg.width, maxH / sigImg.height, 1)
      const drawW = sigImg.width * scale
      const drawH = sigImg.height * scale
      page.drawImage(sigImg, {
        x: xStart + 8,
        y: y - 30 - drawH + 4, // position under label
        width: drawW,
        height: drawH,
      })
    } else {
      page.drawText('[Digitally signed]', { x: xStart + 8, y: y - 30, size: 9, font, color: midGreen })
    }

    const row = (label: string, value: string, dy: number, valueColor = gray) => {
      page.drawText(label, { x: xStart + 8, y: y - dy,     size: 7, font: fontBold, color: lightGray })
      page.drawText(s(value), { x: xStart + 8, y: y - dy - 10, size: 9, font, color: valueColor })
    }

    row('FULL NAME',  name,                50)
    row('DATE',       date,                80)
    page.drawText(`IP: ${ip || 'N/A'}`, { x: xStart + 8, y: y - 108, size: 7, font, color: lightGray })
  }

  drawSigBox(margin,           'Provider', p1?.name, party1Sig?.printedName, party1Sig?.signedAt || contract.createdAt, party1Sig?.ipAddress, darkGreen, party1SigImg)
  drawSigBox(margin + colW + 12, 'Client', p2?.name, party2Sig?.printedName, party2Sig?.signedAt,                       party2Sig?.ipAddress, midGreen,  party2SigImg)
  y -= sigH + 16

  // ── 6. Footer ────────────────────────────────────────────────────────────────
  page.drawLine({ start: { x: margin, y }, end: { x: margin + contentWidth, y }, thickness: 0.5, color: borderGray })
  y -= 14

  if (footerText) {
    drawWrapped(footerText, { size: 8, color: lightGray })
    y -= 4
  }
  drawWrapped('This document was electronically signed via ClauseKit.', { size: 8, color: lightGray })
  y -= 2
  drawWrapped('Legally binding under the Electronic Communications Act 2000.', { size: 8, color: lightGray })

  const pdfBytes = await pdfDoc.save()
  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${contract.title.replace(/[^a-zA-Z0-9]/g, '_')}_signed.pdf"`,
    },
  })
}
