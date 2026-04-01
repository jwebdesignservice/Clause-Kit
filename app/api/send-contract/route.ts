import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contractId, resend: isResend, recipientEmail, recipientName, title } = body;

    if (!contractId || !recipientEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: contractId and recipientEmail' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const signingLink = `${appUrl}/sign/${contractId}`;

    // Send email via Resend
    const { error } = await resend.emails.send({
      from: 'ClauseKit <onboarding@resend.dev>',
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
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #1B4332; padding: 24px 32px;">
                      <h1 style="margin: 0; color: #FFFFFF; font-size: 20px; font-weight: 700;">ClauseKit</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px;">
                      ${isResend ? `
                        <div style="background-color: #FEF3C7; border: 1px solid #FCD34D; padding: 12px 16px; margin-bottom: 24px;">
                          <p style="margin: 0; color: #92400E; font-size: 14px;">
                            <strong>Updated version:</strong> The sender has made changes to this contract. Please review the updated terms below.
                          </p>
                        </div>
                      ` : ''}
                      
                      <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
                        Hi${recipientName ? ` ${recipientName}` : ''},
                      </p>
                      
                      <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                        A contract has been ${isResend ? 'updated and re-sent' : 'sent'} to you for review and signature:
                      </p>
                      
                      <div style="background-color: #FAFAF8; border: 1px solid #E5E5E2; padding: 20px; margin-bottom: 24px;">
                        <p style="margin: 0 0 8px; color: #1B4332; font-size: 18px; font-weight: 600;">
                          ${title || 'Contract Agreement'}
                        </p>
                        <p style="margin: 0; color: #6B7280; font-size: 14px;">
                          Please review the full contract and sign if you agree to the terms.
                        </p>
                      </div>
                      
                      <a href="${signingLink}" style="display: inline-block; background-color: #2D6A4F; color: #FFFFFF; text-decoration: none; padding: 14px 28px; font-size: 16px; font-weight: 600;">
                        Review &amp; Sign Contract
                      </a>
                      
                      <p style="margin: 24px 0 0; color: #9CA3AF; font-size: 14px; line-height: 1.6;">
                        Or copy this link: <a href="${signingLink}" style="color: #2D6A4F;">${signingLink}</a>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="border-top: 1px solid #E5E5E2; padding: 24px 32px; background-color: #FAFAF8;">
                      <p style="margin: 0; color: #9CA3AF; font-size: 12px; line-height: 1.5;">
                        This contract was sent via ClauseKit. If you weren't expecting this email, you can safely ignore it.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email', detail: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
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
