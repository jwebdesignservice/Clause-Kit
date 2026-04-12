import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createSigningToken } from '@/lib/signing';
import { saveContractAsync, getContractAsync, type ContractRecord } from '@/lib/contract-store';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      contractId,
      resend: isResend,
      recipientEmail,
      recipientName,
      title,
      content,
      senderName,
      senderEmail,
      contractType,
      docFont,
    } = body;

    if (!contractId || !recipientEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: contractId and recipientEmail' },
        { status: 400 }
      );
    }

    // Save or update contract in server store
    const existingContract = await getContractAsync(contractId);
    const contractRecord: ContractRecord = existingContract ?? {
      id: contractId,
      contractType: contractType || 'unknown',
      title: title || 'Contract Agreement',
      content: content || '',
      createdAt: new Date().toISOString(),
      status: 'sent',
      party1: senderName ? { name: senderName, email: senderEmail || '', address: '' } : undefined,
      party2: { name: recipientName || '', email: recipientEmail, address: '' },
    };
    
    // Update content if resending and clear old signature
    if (isResend) {
      if (content) contractRecord.content = content;
      // Clear party2 signature so they can sign again
      contractRecord.party2Signature = undefined;
    }
    contractRecord.status = 'sent';
    contractRecord.party2SigningToken = createSigningToken(contractId, 'party2', recipientEmail);
    if (docFont) contractRecord.docFont = docFont;
    
    await saveContractAsync(contractRecord);

    // Generate signing token for party2 (client)
    const token = contractRecord.party2SigningToken;
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const signingLink = `${appUrl}/sign/${contractId}?token=${token}`;

    // Send email via Resend (non-blocking — contract is saved regardless)
    let emailSent = false
    let emailError: string | undefined
    if (process.env.RESEND_API_KEY) {
      const fromAddress = process.env.EMAIL_FROM || 'ClauseKit <onboarding@resend.dev>'
      const { error } = await resend.emails.send({
        from: fromAddress,
        to: recipientEmail,
        subject: isResend
          ? `[Updated] Contract ready for your signature: ${title || 'Agreement'}`
          : `Contract ready for your signature: ${title || 'Agreement'}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAFAF8;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAFAF8; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="100%" style="max-width: 560px; background-color: #FFFFFF; border: 1px solid #E5E5E2;">
                    <tr>
                      <td style="background-color: #1B4332; padding: 24px 32px;">
                        <h1 style="margin: 0; color: #FFFFFF; font-size: 20px; font-weight: 700;">ClauseKit</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 32px;">
                        ${isResend ? `
                          <div style="background-color: #FEF3C7; border: 1px solid #FCD34D; padding: 12px 16px; margin-bottom: 24px;">
                            <p style="margin: 0; color: #92400E; font-size: 14px;">
                              <strong>Updated version:</strong> The sender has made changes to this contract.
                            </p>
                          </div>
                        ` : ''}
                        <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">Hi${recipientName ? ` ${recipientName}` : ''},</p>
                        <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                          A contract has been ${isResend ? 'updated and re-sent' : 'sent'} to you for review and signature:
                        </p>
                        <div style="background-color: #FAFAF8; border: 1px solid #E5E5E2; padding: 20px; margin-bottom: 24px;">
                          <p style="margin: 0 0 8px; color: #1B4332; font-size: 18px; font-weight: 600;">${title || 'Contract Agreement'}</p>
                          <p style="margin: 0; color: #6B7280; font-size: 14px;">Please review and sign if you agree to the terms.</p>
                        </div>
                        <a href="${signingLink}" style="display: inline-block; background-color: #2D6A4F; color: #FFFFFF; text-decoration: none; padding: 14px 28px; font-size: 16px; font-weight: 600;">
                          Review &amp; Sign Contract
                        </a>
                        <p style="margin: 24px 0 0; color: #9CA3AF; font-size: 14px;">Or copy this link: <a href="${signingLink}" style="color: #2D6A4F;">${signingLink}</a></p>
                      </td>
                    </tr>
                    <tr>
                      <td style="border-top: 1px solid #E5E5E2; padding: 24px 32px; background-color: #FAFAF8;">
                        <p style="margin: 0; color: #9CA3AF; font-size: 12px;">This contract was sent via ClauseKit. If you weren't expecting this, you can safely ignore it.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      })
      if (error) {
        console.error('Resend error:', error)
        emailError = error.message
      } else {
        emailSent = true
      }
    } else {
      console.warn('RESEND_API_KEY not set — skipping email')
      emailError = 'Email not configured'
    }

    return NextResponse.json({
      success: true,
      emailSent,
      emailError,
      signingLink,
      message: isResend ? 'Contract resent successfully' : 'Contract sent successfully',
    });
  } catch (error) {
    console.error('Send contract error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to send contract', detail: message },
      { status: 500 }
    );
  }
}
