import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { EmailService } from '@/lib/email-service';
import { getDb } from '@/lib/db';

/**
 * GET /api/lead-campaigns/verify?token=xxx
 *
 * Verify lead campaign email from link click
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/?error=missing-token', request.url));
    }

    const verification = await EmailService.verifyToken(token, 'lead_campaign_verification');

    if (!verification.valid || !verification.email || !verification.metadata?.campaignId) {
      return NextResponse.redirect(new URL('/?error=invalid-token', request.url));
    }

    // Update lead submission as verified
    const db = await getDb();
    const submissionsCollection = db.collection('lead_submissions');

    const result = await submissionsCollection.updateOne(
      {
        email: verification.email,
        campaignId: verification.metadata.campaignId
      },
      {
        $set: {
          isVerified: true,
          verifiedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.redirect(new URL('/?error=submission-not-found', request.url));
    }

    // Redirect to success page with download URL if available
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('lead-verified', 'success');
    redirectUrl.searchParams.set('email', verification.email);

    if (verification.metadata.downloadUrl) {
      redirectUrl.searchParams.set('download', verification.metadata.downloadUrl);
    }

    return NextResponse.redirect(redirectUrl);
  } catch (error: unknown) {
    const typedError = error as Error;
    console.error('Lead verification error:', typedError);
    return NextResponse.redirect(new URL('/?error=server-error', request.url));
  }
}

/**
 * POST /api/lead-campaigns/verify
 *
 * Verify lead campaign email (for backward compatibility)
 */
export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { message: 'Token er påkrevd' },
        { status: 400 }
      );
    }

    const verification = await EmailService.verifyToken(token, 'lead_campaign_verification');

    if (!verification.valid || !verification.email || !verification.metadata?.campaignId) {
      return NextResponse.json(
        { message: 'Ugyldig eller utløpt token' },
        { status: 400 }
      );
    }

    // Update lead submission as verified
    const db = await getDb();
    const submissionsCollection = db.collection('lead_submissions');

    const result = await submissionsCollection.updateOne(
      {
        email: verification.email,
        campaignId: verification.metadata.campaignId
      },
      {
        $set: {
          isVerified: true,
          verifiedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Registrering ikke funnet' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'E-post bekreftet! Du vil nå motta oppdateringer fra oss.',
        downloadUrl: verification.metadata.downloadUrl || null
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const typedError = error as Error;
    console.error('Lead verification error:', typedError);
    return NextResponse.json(
      { message: 'Intern serverfeil' },
      { status: 500 }
    );
  }
}
