import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getDb } from '@/lib/db';
import { sendSmtpEmail, isSmtpConfigured } from '@/lib/smtp-email-service';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/admin/send-campaign
 *
 * Send email campaign to lead submissions
 * Admin only
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      campaignId,
      collectionSlug, // Optional: slug of the weekly collection to link in email
      filters = {
        includeVerified: true,
        includePending: false,
        testMode: false,
        excludeAlreadySent: true, // NEW: Exclude users who already received this collection
      },
      dryRun = false,
    } = body;

    // Validation
    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    // Check if SMTP is configured
    if (!isSmtpConfigured()) {
      return NextResponse.json(
        { error: 'SMTP is not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in environment variables.' },
        { status: 500 }
      );
    }

    const db = await getDb();
    const submissionsCollection = db.collection('lead_submissions');

    // Build query to fetch recipients
    const query: any = {
      campaignId,
      unsubscribedAt: null, // Never send to unsubscribed users
    };

    // Add status filter (skip if test mode - we'll use admin email instead)
    if (!filters.testMode) {
      if (filters.includeVerified && filters.includePending) {
        // Include both verified and pending
      } else if (filters.includeVerified) {
        query.isVerified = true;
      } else if (filters.includePending) {
        query.isVerified = false;
      } else {
        // No recipients selected
        return NextResponse.json(
          { error: 'No recipient filters selected' },
          { status: 400 }
        );
      }
    }

    // Test mode: Only send to specific test email
    let emailsToSend: { email: string; metadata?: any }[] = [];
    if (filters.testMode) {
      const testEmail = 'petter@golfkart.no';

      // Ensure test submission exists in database for tracking
      const existingTestSubmission = await submissionsCollection.findOne({
        email: testEmail,
        campaignId,
      });

      if (!existingTestSubmission) {
        // Create a test submission record with unsubscribe token
        await submissionsCollection.insertOne({
          email: testEmail,
          campaignId,
          isVerified: true,
          submittedAt: new Date(),
          verifiedAt: new Date(),
          unsubscribedAt: null,
          unsubscribeToken: uuidv4(), // Generate unsubscribe token for testing
          metadata: {
            isTestAccount: true,
            campaignName: 'Test Campaign',
          },
          emailHistory: [],
        });
      } else if (!existingTestSubmission.unsubscribeToken) {
        // Update existing test submission to add unsubscribe token if missing
        await submissionsCollection.updateOne(
          { email: testEmail, campaignId },
          { $set: { unsubscribeToken: uuidv4() } }
        );
      }

      emailsToSend = [{
        email: testEmail,
        metadata: { testMode: true }
      }];
    } else {
      // Fetch recipients
      console.log('[Send Campaign] Query:', JSON.stringify(query));
      let recipients = await submissionsCollection.find(query).toArray();
      console.log('[Send Campaign] Recipients found (before filtering):', recipients.length);

      // Filter out users who already received this specific collection (if collectionSlug provided and excludeAlreadySent is true)
      if (collectionSlug && filters.excludeAlreadySent) {
        recipients = recipients.filter(recipient => {
          // Check if emailHistory exists and if this collectionSlug was already sent
          const alreadyReceived = recipient.emailHistory?.some(
            (email: any) => email.collectionSlug === collectionSlug && !email.testMode
          );
          return !alreadyReceived;
        });
        console.log('[Send Campaign] Recipients after filtering already-sent:', recipients.length);
      }

      if (recipients.length === 0) {
        // Debug: Check what's in the database
        const totalInCampaign = await submissionsCollection.countDocuments({ campaignId });
        const pendingTotal = await submissionsCollection.countDocuments({ campaignId, isVerified: false });
        const verifiedTotal = await submissionsCollection.countDocuments({ campaignId, isVerified: true });

        console.log('[Send Campaign] Debug - Total in campaign:', totalInCampaign);
        console.log('[Send Campaign] Debug - Pending total:', pendingTotal);
        console.log('[Send Campaign] Debug - Verified total:', verifiedTotal);

        return NextResponse.json({
          message: 'Ingen mottakere funnet med de valgte filtrene',
          sent: 0,
          failed: 0,
          debug: {
            query,
            totalInCampaign,
            pendingTotal,
            verifiedTotal,
          }
        });
      }

      emailsToSend = recipients.map(r => ({
        email: r.email,
        metadata: r.metadata
      }));
    }

    // Dry run: Return what would be sent without actually sending
    if (dryRun) {
      return NextResponse.json({
        message: `Tørrkjøring: ${emailsToSend.length} e-poster ville blitt sendt`,
        sent: 0,
        failed: 0,
        dryRun: true,
        recipients: emailsToSend.map(r => r.email),
      });
    }

    // Send emails
    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

    for (const recipient of emailsToSend) {
      try {
        // Get unsubscribe token
        const submission = await submissionsCollection.findOne({
          email: recipient.email,
          campaignId,
        });

        const unsubscribeUrl = submission?.unsubscribeToken
          ? `${baseUrl}/api/lead-campaigns/unsubscribe?token=${submission.unsubscribeToken}`
          : '';

        // Create tracking ID for this email: campaignId:email:timestamp
        const trackingId = `${campaignId}:${recipient.email}:${Date.now()}`;
        const trackingPixelUrl = `${baseUrl}/api/email-tracking/open?trackingId=${encodeURIComponent(trackingId)}`;

        // Wrap links with click tracking
        const trackLink = (url: string) => {
          return `${baseUrl}/api/email-tracking/click?trackingId=${encodeURIComponent(trackingId)}&url=${encodeURIComponent(url)}`;
        };

        // Email template - conditional based on whether it's a collection email or welcome email
        const emailHtml = collectionSlug ? `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333;">
            <h1 style="color: #264653; font-size: 24px; margin-bottom: 20px;">Dine ukentlige fargebilder er klare! 🎨</h1>

            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Hei!
            </p>

            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Vi har en ny samling med fargebilder klare til deg!
              Klikk på knappen under for å se alle bildene og laste dem ned.
            </p>

            <div style="text-align: center; margin: 40px 0;">
              <a href="${trackLink(`${baseUrl}/ukentlige-fargebilder/${collectionSlug}`)}"
                 style="display: inline-block; background-color: #2EC4B6; color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 18px; font-weight: bold;">
                Se alle bildene
              </a>
            </div>

            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px; text-align: center; color: #666;">
              God fornøyelse med fargeleggingen! 🖍️
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

            <div style="text-align: center;">
              <p style="color: #999; font-size: 12px; margin-bottom: 5px;">
                © 2025 TegnOgFarge.no. Alle rettigheter reservert.
              </p>
              ${unsubscribeUrl ? `
              <p style="color: #999; font-size: 11px; margin-top: 5px;">
                <a href="${unsubscribeUrl}" style="color: #999; text-decoration: underline;">Meld deg av</a>
              </p>
              ` : ''}
            </div>

            <!-- Tracking pixel for email opens -->
            <img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:block; border:0; opacity:0;">
          </div>
        ` : `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333;">
            <h1 style="color: #264653; font-size: 24px; margin-bottom: 20px;">Velkommen! 🎨</h1>

            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Hei!
            </p>

            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Takk for at du meldte deg på for å motta gratis fargebilder ukentlig!
              Vi gleder oss til å dele fantastiske tegninger med deg.
            </p>

            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Du vil motta nye tegninger hver uke direkte i innboksen din.
              Hold utkikk etter neste sending!
            </p>

            <div style="text-align: center; margin: 40px 0;">
              <a href="${trackLink(baseUrl)}"
                 style="display: inline-block; background-color: #2EC4B6; color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 18px; font-weight: bold;">
                Besøk TegnOgFarge.no
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

            <div style="text-align: center;">
              <p style="color: #999; font-size: 12px; margin-bottom: 5px;">
                © 2025 TegnOgFarge.no. Alle rettigheter reservert.
              </p>
              ${unsubscribeUrl ? `
              <p style="color: #999; font-size: 11px; margin-top: 5px;">
                <a href="${unsubscribeUrl}" style="color: #999; text-decoration: underline;">Meld deg av</a>
              </p>
              ` : ''}
            </div>

            <!-- Tracking pixel for email opens -->
            <img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:block; border:0; opacity:0;">
          </div>
        `;

        // Send email via SMTP
        const emailSubject = collectionSlug
          ? 'Dine ukentlige fargebilder er klare! 🎨'
          : 'Velkommen til ukentlige fargebilder! 🎨';

        const result = await sendSmtpEmail({
          to: recipient.email,
          subject: filters.testMode
            ? `[TEST] ${emailSubject}`
            : emailSubject,
          html: emailHtml,
          headers: unsubscribeUrl ? {
            'List-Unsubscribe': `<${unsubscribeUrl}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
          } : undefined
        });

        if (result.success) {
          results.sent++;

          // Log the send to database (track email history)
          await submissionsCollection.updateOne(
            { email: recipient.email, campaignId },
            {
              $push: {
                emailHistory: {
                  sentAt: new Date(),
                  type: collectionSlug ? 'collection' : 'welcome',
                  collectionSlug: collectionSlug || undefined,
                  messageId: result.messageId,
                  testMode: filters.testMode || false,
                  sentVia: 'smtp',
                  trackingId, // Store tracking ID for reference
                }
              } as any
            }
          );
        } else {
          results.failed++;
          results.errors.push(`${recipient.email}: ${result.error}`);
        }

        // Rate limiting: Wait 100ms between sends to avoid overwhelming SMTP server
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: unknown) {
        const typedError = error as Error;
        console.error(`Error sending to ${recipient.email}:`, typedError);
        results.failed++;
        results.errors.push(`${recipient.email}: ${typedError.message}`);
      }
    }

    // Return results with detailed error info
    const response = {
      message: filters.testMode
        ? results.sent > 0
          ? `Test-e-post sendt til petter@golfkart.no`
          : `Kunne ikke sende test-e-post til petter@golfkart.no`
        : `E-postkampanje sendt til ${results.sent} av ${emailsToSend.length} mottakere`,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors.length > 0 ? results.errors : undefined,
    };

    console.log('[Send Campaign] Results:', response);

    return NextResponse.json(response);
  } catch (error: unknown) {
    const typedError = error as Error;
    console.error('Error sending campaign:', typedError);
    return NextResponse.json(
      { error: 'Internal server error', message: typedError.message },
      { status: 500 }
    );
  }
}
