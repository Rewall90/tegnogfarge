import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * GET /api/lead-campaigns/unsubscribe?token=xxx
 *
 * Unsubscribe from lead campaign emails via link click
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/unsubscribe-confirmation?status=missing-token', request.url));
    }

    // Find submission with this unsubscribe token
    const db = await getDb();
    const submissionsCollection = db.collection('lead_submissions');

    const submission = await submissionsCollection.findOne({
      unsubscribeToken: token
    });

    if (!submission) {
      return NextResponse.redirect(new URL('/unsubscribe-confirmation?status=invalid-token', request.url));
    }

    // Mark submission as unsubscribed
    const result = await submissionsCollection.updateOne(
      { unsubscribeToken: token },
      {
        $set: {
          isVerified: false,
          unsubscribedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.redirect(new URL('/unsubscribe-confirmation?status=not-found', request.url));
    }

    // Redirect to success page
    return NextResponse.redirect(new URL('/unsubscribe-confirmation?status=success', request.url));
  } catch (error: unknown) {
    const typedError = error as Error;
    console.error('Lead unsubscribe error:', typedError);
    return NextResponse.redirect(new URL('/unsubscribe-confirmation?status=error', request.url));
  }
}

/**
 * POST /api/lead-campaigns/unsubscribe?token=xxx
 *
 * One-click unsubscribe (for email clients)
 */
export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { message: 'Token er påkrevd' },
        { status: 400 }
      );
    }

    // Find submission with this unsubscribe token
    const db = await getDb();
    const submissionsCollection = db.collection('lead_submissions');

    const submission = await submissionsCollection.findOne({
      unsubscribeToken: token
    });

    if (!submission) {
      return NextResponse.json(
        { message: 'Ugyldig token' },
        { status: 400 }
      );
    }

    // Mark submission as unsubscribed
    const result = await submissionsCollection.updateOne(
      { unsubscribeToken: token },
      {
        $set: {
          isVerified: false,
          unsubscribedAt: new Date()
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
      { message: 'Du er nå avmeldt fra denne kampanjen' },
      { status: 200 }
    );
  } catch (error: unknown) {
    const typedError = error as Error;
    console.error('Lead unsubscribe error:', typedError);
    return NextResponse.json(
      { message: 'Intern serverfeil' },
      { status: 500 }
    );
  }
}
