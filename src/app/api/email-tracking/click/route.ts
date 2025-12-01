import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * GET /api/email-tracking/click?trackingId=xxx&url=xxx
 *
 * Track email link clicks and redirect to destination
 */
export async function GET(request: NextRequest) {
  try {
    const trackingId = request.nextUrl.searchParams.get('trackingId');
    const destinationUrl = request.nextUrl.searchParams.get('url');

    if (!destinationUrl) {
      return NextResponse.json(
        { error: 'Destination URL is required' },
        { status: 400 }
      );
    }

    if (trackingId) {
      // Log the click event asynchronously
      logEmailClick(trackingId, destinationUrl, request).catch(error => {
        console.error('[Email Tracking] Error logging click:', error);
      });
    }

    // Redirect to the destination URL
    return NextResponse.redirect(destinationUrl, 302);
  } catch (error) {
    console.error('[Email Tracking] Error in click endpoint:', error);

    // Still redirect even if tracking fails
    const destinationUrl = request.nextUrl.searchParams.get('url');
    if (destinationUrl) {
      return NextResponse.redirect(destinationUrl, 302);
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function logEmailClick(trackingId: string, destinationUrl: string, request: NextRequest) {
  try {
    const db = await getDb();
    const collection = db.collection('email_tracking_events');

    // Parse trackingId: format is "campaignId:email:timestamp"
    const [campaignId, email, timestamp] = trackingId.split(':');

    if (!campaignId || !email) {
      console.error('[Email Tracking] Invalid trackingId format:', trackingId);
      return;
    }

    // Log the click event
    const event = {
      trackingId,
      campaignId,
      email,
      eventType: 'click',
      destinationUrl,
      clickedAt: new Date(),
      userAgent: request.headers.get('user-agent') || null,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
    };

    await collection.insertOne(event);

    // Update the lead submission to track clicks
    await db.collection('lead_submissions').updateOne(
      { email, campaignId },
      {
        $set: {
          lastEmailClickedAt: new Date(),
        },
        $inc: {
          emailClickCount: 1,
        },
        $push: {
          clickedLinks: {
            url: destinationUrl,
            clickedAt: new Date(),
          },
        } as any,
      }
    );

    console.log('[Email Tracking] Email link clicked:', { email, campaignId, destinationUrl });
  } catch (error) {
    console.error('[Email Tracking] Error logging email click:', error);
  }
}
