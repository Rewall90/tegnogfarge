import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * GET /api/email-tracking/open?trackingId=xxx
 *
 * Track email opens via 1x1 transparent pixel
 * Returns a 1x1 transparent GIF
 */
export async function GET(request: NextRequest) {
  try {
    const trackingId = request.nextUrl.searchParams.get('trackingId');

    if (trackingId) {
      // Log the open event asynchronously (don't block the image response)
      logEmailOpen(trackingId, request).catch(error => {
        console.error('[Email Tracking] Error logging open:', error);
      });
    }

    // Return a 1x1 transparent GIF immediately
    const transparentGif = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    return new NextResponse(transparentGif, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Content-Length': transparentGif.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('[Email Tracking] Error in open endpoint:', error);

    // Still return the pixel even if tracking fails
    const transparentGif = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    return new NextResponse(transparentGif, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
      },
    });
  }
}

async function logEmailOpen(trackingId: string, request: NextRequest) {
  try {
    const db = await getDb();
    const collection = db.collection('email_tracking_events');

    // Parse trackingId: format is "campaignId:email:timestamp"
    const [campaignId, email, timestamp] = trackingId.split(':');

    if (!campaignId || !email) {
      console.error('[Email Tracking] Invalid trackingId format:', trackingId);
      return;
    }

    // Check if this open was already tracked (prevent duplicate opens on email client prefetch)
    const existingOpen = await collection.findOne({
      trackingId,
      eventType: 'open',
    });

    if (existingOpen) {
      // Update last opened time instead of creating duplicate
      await collection.updateOne(
        { trackingId, eventType: 'open' },
        {
          $set: {
            lastOpenedAt: new Date(),
            openCount: (existingOpen.openCount || 1) + 1,
          },
        }
      );
      return;
    }

    // Log the open event
    const event = {
      trackingId,
      campaignId,
      email,
      eventType: 'open',
      openedAt: new Date(),
      openCount: 1,
      lastOpenedAt: new Date(),
      userAgent: request.headers.get('user-agent') || null,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
    };

    await collection.insertOne(event);

    // Update the lead submission to mark as opened
    await db.collection('lead_submissions').updateOne(
      { email, campaignId },
      {
        $set: {
          lastEmailOpenedAt: new Date(),
        },
        $inc: {
          emailOpenCount: 1,
        },
      }
    );

    console.log('[Email Tracking] Email opened:', { email, campaignId });
  } catch (error) {
    console.error('[Email Tracking] Error logging email open:', error);
  }
}
