import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { EmailService } from '@/lib/email-service';
import clientPromise from '@/lib/db';

// Handle GET requests (from email link clicks)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      // Redirect to error page
      return NextResponse.redirect(new URL('/?error=missing-token', request.url));
    }

    const verification = await EmailService.verifyToken(token, 'newsletter_verification');

    if (!verification.valid || !verification.email) {
      // Redirect to error page
      return NextResponse.redirect(new URL('/?error=invalid-token', request.url));
    }

    // Update newsletter subscriber as verified
    const client = await clientPromise;
    const db = client.db('newsletter');

    const result = await db.collection('subscribers').updateOne(
      { email: verification.email },
      {
        $set: {
          isVerified: true,
          verifiedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      // Redirect to error page
      return NextResponse.redirect(new URL('/?error=subscriber-not-found', request.url));
    }

    // Redirect to success page
    return NextResponse.redirect(new URL('/?verified=success', request.url));
  } catch (error: unknown) {
    const typedError = error as Error;
    console.error('Newsletter verification error:', typedError);
    // Redirect to error page
    return NextResponse.redirect(new URL('/?error=server-error', request.url));
  }
}

// Keep POST for backward compatibility (if needed)
export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { message: 'Token er påkrevd' },
        { status: 400 }
      );
    }

    const verification = await EmailService.verifyToken(token, 'newsletter_verification');

    if (!verification.valid || !verification.email) {
      return NextResponse.json(
        { message: 'Ugyldig eller utløpt token' },
        { status: 400 }
      );
    }

    // Update newsletter subscriber as verified
    const client = await clientPromise;
    const db = client.db('newsletter');

    const result = await db.collection('subscribers').updateOne(
      { email: verification.email },
      {
        $set: {
          isVerified: true,
          verifiedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Abonnent ikke funnet' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Nyhetsbrev-abonnement bekreftet! Du vil nå motta våre oppdateringer.' },
      { status: 200 }
    );
  } catch (error: unknown) {
    const typedError = error as Error;
    console.error('Newsletter verification error:', typedError);
    return NextResponse.json(
      { message: 'Intern serverfeil' },
      { status: 500 }
    );
  }
} 