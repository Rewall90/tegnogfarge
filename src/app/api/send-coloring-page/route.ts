import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getDb } from '@/lib/db';

// ============================================================================
// CONFIGURATION
// ============================================================================

const resend = new Resend(process.env.RESEND_API_KEY);
const CAMPAIGN_ID = 'photo-to-coloring-test';

// ============================================================================
// TYPES
// ============================================================================

interface SendColoringPageRequest {
  email: string;
  image: string; // Base64 encoded image
  mimeType: string;
  campaignId?: string; // Optional campaign ID for tracking
}

// ============================================================================
// EMAIL TEMPLATE
// ============================================================================

interface EmailTemplateOptions {
  baseUrl: string;
  trackingPixelUrl: string;
  ctaUrl: string;
}

function getEmailTemplate({ baseUrl, trackingPixelUrl, ctaUrl }: EmailTemplateOptions): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ditt fargeleggingsbilde</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center;">
                    <h1 style="margin: 0; color: #264653; font-size: 28px; font-weight: bold;">
                      Her er fargeleggingsbildet ditt!
                    </h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 0 40px 30px;">
                    <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                      Takk for at du brukte vår AI-fargeleggingstjeneste! Bildet ditt er vedlagt som en PNG-fil som du kan skrive ut og fargelegge.
                    </p>

                    <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                      <strong>Tips for beste resultat:</strong>
                    </p>
                    <ul style="color: #666; font-size: 14px; line-height: 1.8; margin: 0 0 30px; padding-left: 20px;">
                      <li>Skriv ut på tykt papir for best fargeleggingsopplevelse</li>
                      <li>Bruk fargeblyanter, tusjer eller akvarellfarger</li>
                      <li>Del gjerne resultatet med oss på sosiale medier!</li>
                    </ul>
                  </td>
                </tr>

                <!-- CTA Button -->
                <tr>
                  <td style="padding: 0 40px 40px; text-align: center;">
                    <a href="${ctaUrl}" style="display: inline-block; background-color: #2EC4B6; color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      Lag flere fargeleggingsbilder
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9f9f9; border-radius: 0 0 12px 12px;">
                    <p style="color: #999; font-size: 13px; line-height: 1.5; margin: 0; text-align: center;">
                      Denne e-posten ble sendt fra TegnOgFarge.no<br>
                      Vi lagrer ikke bildene dine - de behandles kun for å lage fargeleggingstegningen.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <!-- Tracking pixel for email opens -->
        <img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:block; border:0; opacity:0;">
      </body>
    </html>
  `;
}

// ============================================================================
// ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!process.env.RESEND_API_KEY) {
      console.error('[send-coloring-page] Missing RESEND_API_KEY');
      return NextResponse.json(
        { error: 'E-posttjenesten er ikke konfigurert' },
        { status: 503 }
      );
    }

    // Parse request body
    const body: SendColoringPageRequest = await request.json();

    if (!body.email || !body.image || !body.mimeType) {
      return NextResponse.json(
        { error: 'Mangler e-post, bilde eller bildetype' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Ugyldig e-postadresse' },
        { status: 400 }
      );
    }

    // Get base URL for links
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'https://tegnogfarge.no';

    // Determine file extension from mime type
    const extension = body.mimeType.includes('png') ? 'png' :
                      body.mimeType.includes('jpeg') || body.mimeType.includes('jpg') ? 'jpg' :
                      body.mimeType.includes('webp') ? 'webp' : 'png';

    // In development, redirect to test email
    let recipientEmail = body.email;
    if (process.env.NODE_ENV === 'development' && process.env.DEV_TEST_EMAIL) {
      recipientEmail = process.env.DEV_TEST_EMAIL;
      console.log(`[send-coloring-page] Development mode: Redirecting email from ${body.email} to ${recipientEmail}`);
    }

    // Generate tracking ID for email opens/clicks: campaignId:email:timestamp
    const campaignId = body.campaignId || CAMPAIGN_ID;
    const trackingId = `${campaignId}:${body.email}:${Date.now()}`;
    const trackingPixelUrl = `${baseUrl}/api/email-tracking/open?trackingId=${encodeURIComponent(trackingId)}`;

    // Wrap CTA link with click tracking
    const ctaUrl = `${baseUrl}/api/email-tracking/click?trackingId=${encodeURIComponent(trackingId)}&url=${encodeURIComponent(baseUrl)}`;

    console.log('[send-coloring-page] Sending coloring page to:', recipientEmail);
    console.log('[send-coloring-page] Tracking ID:', trackingId);

    // Send email with attachment
    const result = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME || 'TegnOgFarge.no'} <${process.env.EMAIL_FROM || 'noreply@tegnogfarge.no'}>`,
      to: recipientEmail,
      subject: 'Ditt fargeleggingsbilde fra TegnOgFarge.no',
      html: getEmailTemplate({ baseUrl, trackingPixelUrl, ctaUrl }),
      attachments: [
        {
          filename: `fargeleggingsbilde.${extension}`,
          content: body.image, // Base64 string
        },
      ],
    });

    if (result.error) {
      console.error('[send-coloring-page] Resend error:', result.error);
      return NextResponse.json(
        { error: 'Kunne ikke sende e-post. Prøv igjen senere.' },
        { status: 500 }
      );
    }

    console.log('[send-coloring-page] Email sent successfully. ID:', result.data?.id);

    // Track email send in lead_submissions for Email Stats dashboard
    try {
      const db = await getDb();
      const submissionsCollection = db.collection('lead_submissions');

      // Update or create submission with email history
      await submissionsCollection.updateOne(
        { email: body.email, campaignId },
        {
          $push: {
            emailHistory: {
              type: 'coloring_page_delivery',
              sentAt: new Date(),
              messageId: result.data?.id,
              trackingId, // Store tracking ID for open/click tracking reference
              testMode: process.env.NODE_ENV === 'development',
            },
          },
          $setOnInsert: {
            email: body.email,
            campaignId,
            isVerified: true, // Auto-verified since they're receiving their coloring page
            submittedAt: new Date(),
            metadata: {
              source: 'photo_to_coloring',
              feature: 'ai_coloring_page',
            },
          },
          $set: {
            lastEmailSentAt: new Date(),
          },
        },
        { upsert: true }
      );

      console.log('[send-coloring-page] Email tracked in lead_submissions');
    } catch (dbError) {
      // Don't fail the request if tracking fails
      console.error('[send-coloring-page] Failed to track email in database:', dbError);
    }

    return NextResponse.json({
      success: true,
      message: 'Fargeleggingsbildet er sendt til e-posten din!',
    });

  } catch (error) {
    console.error('[send-coloring-page] Error:', error);

    return NextResponse.json(
      { error: 'Noe gikk galt. Vennligst prøv igjen.' },
      { status: 500 }
    );
  }
}

// ============================================================================
// CONFIG
// ============================================================================

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb', // Allow larger images
    },
  },
};
