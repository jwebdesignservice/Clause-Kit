import { Resend } from 'resend'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not set')
  return new Resend(key)
}

const FROM = 'ClauseKit <contracts@clausekit.co.uk>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

function baseTemplate(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>ClauseKit</title></head>
<body style="margin:0;padding:0;background:#FAFAF8;font-family:system-ui,sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#fff;border:1px solid #E5E5E2;">
  <div style="background:#2D6A4F;padding:24px 32px;">
    <span style="color:#fff;font-size:18px;font-weight:700;">ClauseKit</span>
  </div>
  <div style="padding:32px;">${bodyHtml}</div>
  <div style="padding:16px 32px;border-top:1px solid #E5E5E2;background:#FAFAF8;">
    <p style="margin:0;font-size:11px;color:#9CA3AF;">ClauseKit &mdash; Professional UK contracts. Not legal advice. &copy; 2026 ClauseKit Ltd.</p>
  </div>
</div>
</body></html>`
}

function btn(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#2D6A4F;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 28px;margin:20px 0;">${label} &rarr;</a>`
}

export async function sendReadyToSign(opts: {
  to: string; contractTitle: string; contractId: string; token: string; clientName: string
}) {
  const url = `${APP_URL}/sign/${opts.contractId}?token=${opts.token}`
  await getResend().emails.send({
    from: FROM, to: opts.to,
    subject: `Your ${opts.contractTitle} is ready to sign`,
    html: baseTemplate(`
      <h2 style="margin:0 0 8px;color:#1B4332;font-size:20px;">Your contract is ready</h2>
      <p style="color:#6B7280;margin:0 0 16px;font-size:14px;line-height:1.6;">Your <strong>${opts.contractTitle}</strong> is ready for your signature.</p>
      ${btn(url, 'Sign your contract')}
      <p style="color:#9CA3AF;font-size:12px;margin-top:16px;">Once signed, it will be sent to <strong>${opts.clientName}</strong> for countersignature.</p>
    `),
  })
}

export async function sendClientSignRequest(opts: {
  to: string; clientName: string; senderName: string; senderEmail: string
  contractTitle: string; contractId: string; token: string; expiryDate: string
}) {
  const url = `${APP_URL}/sign/${opts.contractId}?token=${opts.token}`
  const expiry = new Date(opts.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  await getResend().emails.send({
    from: FROM, to: opts.to,
    subject: `${opts.senderName} has sent you a contract to sign`,
    html: baseTemplate(`
      <p style="color:#6B7280;font-size:13px;margin:0 0 4px;">Hi ${opts.clientName},</p>
      <h2 style="margin:0 0 12px;color:#1B4332;font-size:20px;">${opts.senderName} has sent you a contract</h2>
      <p style="color:#6B7280;margin:0 0 8px;font-size:14px;">Please review and sign: <strong>${opts.contractTitle}</strong></p>
      ${btn(url, 'Review & Sign')}
      <p style="color:#9CA3AF;font-size:12px;margin-top:16px;">Link expires <strong>${expiry}</strong>. Questions? <a href="mailto:${opts.senderEmail}" style="color:#2D6A4F;">${opts.senderEmail}</a></p>
    `),
  })
}

export async function sendContractComplete(opts: {
  to: string; userName: string; clientName: string; contractTitle: string; contractId: string
}) {
  const url = `${APP_URL}/download/${opts.contractId}`
  await getResend().emails.send({
    from: FROM, to: opts.to,
    subject: `\u2705 ${opts.contractTitle} \u2014 fully signed`,
    html: baseTemplate(`
      <p style="color:#6B7280;font-size:13px;margin:0 0 4px;">Hi ${opts.userName},</p>
      <h2 style="margin:0 0 12px;color:#1B4332;font-size:20px;">Contract fully executed</h2>
      <p style="color:#6B7280;margin:0 0 8px;font-size:14px;"><strong>${opts.clientName}</strong> has signed your <strong>${opts.contractTitle}</strong>. Both parties are now bound.</p>
      ${btn(url, 'Download signed contract')}
    `),
  })
}

export async function sendClientSignedCopy(opts: {
  to: string; clientName: string; contractTitle: string; contractId: string
}) {
  const url = `${APP_URL}/download/${opts.contractId}`
  await getResend().emails.send({
    from: FROM, to: opts.to,
    subject: `Your signed copy of ${opts.contractTitle}`,
    html: baseTemplate(`
      <p style="color:#6B7280;font-size:13px;margin:0 0 4px;">Hi ${opts.clientName},</p>
      <h2 style="margin:0 0 12px;color:#1B4332;font-size:20px;">Your signed contract is ready</h2>
      <p style="color:#6B7280;margin:0 0 8px;font-size:14px;">Your signed copy of <strong>${opts.contractTitle}</strong> is available to download.</p>
      ${btn(url, 'Download your copy')}
    `),
  })
}
