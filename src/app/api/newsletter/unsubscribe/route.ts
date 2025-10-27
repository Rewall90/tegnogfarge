import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import clientPromise from '@/lib/db';

// Handle GET requests (from email link clicks)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      // Redirect to error page
      return NextResponse.redirect(new URL('/unsubscribe-confirmation?status=missing-token', request.url));
    }

    // Find subscriber with this unsubscribe token
    const client = await clientPromise;
    const db = client.db('newsletter');

    const subscriber = await db.collection('subscribers').findOne({
      unsubscribeToken: token
    });

    if (!subscriber) {
      // Redirect to error page - token not found
      return NextResponse.redirect(new URL('/unsubscribe-confirmation?status=invalid-token', request.url));
    }

    // Mark subscriber as unsubscribed
    const result = await db.collection('subscribers').updateOne(
      { unsubscribeToken: token },
      {
        $set: {
          isVerified: false,
          unsubscribedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      // Redirect to error page
      return NextResponse.redirect(new URL('/unsubscribe-confirmation?status=not-found', request.url));
    }

    // Redirect to success page
    return NextResponse.redirect(new URL('/unsubscribe-confirmation?status=success', request.url));
  } catch (error: unknown) {
    const typedError = error as Error;
    console.error('Newsletter unsubscribe error:', typedError);
    // Redirect to error page
    return NextResponse.redirect(new URL('/unsubscribe-confirmation?status=error', request.url));
  }
}

// Handle POST requests (for one-click unsubscribe from email clients)
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

    // Find subscriber with this unsubscribe token
    const client = await clientPromise;
    const db = client.db('newsletter');

    const subscriber = await db.collection('subscribers').findOne({
      unsubscribeToken: token
    });

    if (!subscriber) {
      return NextResponse.json(
        { message: 'Ugyldig token' },
        { status: 400 }
      );
    }

    // Mark subscriber as unsubscribed
    const result = await db.collection('subscribers').updateOne(
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
        { message: 'Abonnent ikke funnet' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Du er nå avmeldt fra vårt nyhetsbrev' },
      { status: 200 }
    );
  } catch (error: unknown) {
    const typedError = error as Error;
    console.error('Newsletter unsubscribe error:', typedError);
    return NextResponse.json(
      { message: 'Intern serverfeil' },
      { status: 500 }
    );
  }
}
