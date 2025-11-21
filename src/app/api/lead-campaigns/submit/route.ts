import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { EmailService } from '@/lib/email-service';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/lead-campaigns/submit
 *
 * Submit email for a lead campaign
 * Creates unverified submission and sends verification email
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      campaignId,
      metadata = {}
    } = body;

    // Validation
    if (!email || !campaignId) {
      return NextResponse.json(
        { message: 'E-post og kampanje-ID er påkrevd' },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { message: 'Ugyldig e-postadresse' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const submissionsCollection = db.collection('lead_submissions');

    // Check if already submitted for this campaign
    const existingSubmission = await submissionsCollection.findOne({
      email,
      campaignId
    });

    if (existingSubmission) {
      if (existingSubmission.isVerified) {
        return NextResponse.json(
          { message: 'Du har allerede registrert deg for denne kampanjen' },
          { status: 400 }
        );
      } else {
        // Resend verification email
        try {
          await EmailService.sendLeadCampaignVerificationEmail({
            email,
            campaignId,
            metadata: existingSubmission.metadata
          });
          return NextResponse.json(
            { message: 'Bekreftelse e-post sendt på nytt. Sjekk innboksen din.' },
            { status: 200 }
          );
        } catch (emailError: unknown) {
          const typedError = emailError as Error;
          console.error('Failed to resend verification email:', typedError);
          return NextResponse.json(
            { message: 'Kunne ikke sende bekreftelse e-post' },
            { status: 500 }
          );
        }
      }
    }

    // Get campaign details
    const campaignsCollection = db.collection('lead_campaigns');
    const campaign = await campaignsCollection.findOne({
      campaignId,
      deleted: { $ne: true }
    });

    if (!campaign) {
      return NextResponse.json(
        { message: 'Kampanje ikke funnet' },
        { status: 404 }
      );
    }

    // Create new submission
    const unsubscribeToken = uuidv4();
    const newSubmission = {
      email,
      campaignId,
      isVerified: false,
      submittedAt: new Date(),
      verifiedAt: null,
      unsubscribedAt: null,
      unsubscribeToken,
      metadata: {
        ...metadata,
        userAgent: req.headers.get('user-agent') || null,
        campaignName: campaign.name,
        trigger: campaign.trigger,
      }
    };

    console.log('[Lead Submit API] About to insert submission:', {
      email,
      campaignId,
      submittedAt: newSubmission.submittedAt
    });

    const insertResult = await submissionsCollection.insertOne(newSubmission);

    console.log('[Lead Submit API] Insert result:', {
      acknowledged: insertResult.acknowledged,
      insertedId: insertResult.insertedId?.toString()
    });

    // Verify the insert actually worked
    const verifyInsert = await submissionsCollection.findOne({ _id: insertResult.insertedId });
    console.log('[Lead Submit API] Verification check:', {
      found: !!verifyInsert,
      email: verifyInsert?.email
    });

    // Send verification email
    try {
      console.log('[Lead Submit API] Attempting to send verification email to:', email);

      await EmailService.sendLeadCampaignVerificationEmail({
        email,
        campaignId,
        metadata: newSubmission.metadata
      });

      console.log('[Lead Submit API] Verification email sent successfully');

      return NextResponse.json(
        {
          message: 'Takk! Sjekk e-posten din for å bekrefte og få tilgang.',
          success: true
        },
        { status: 201 }
      );
    } catch (emailError: unknown) {
      const typedError = emailError as Error;
      console.error('[Lead Submit API] ERROR - Failed to send lead verification:', {
        email,
        campaignId,
        error: typedError.message,
        stack: typedError.stack
      });
      return NextResponse.json(
        { message: 'Registrering vellykket, men kunne ikke sende bekreftelse e-post' },
        { status: 201 }
      );
    }
  } catch (error: unknown) {
    const typedError = error as Error;
    console.error('Lead submission error:', typedError);
    return NextResponse.json(
      { message: 'Intern serverfeil' },
      { status: 500 }
    );
  }
}
