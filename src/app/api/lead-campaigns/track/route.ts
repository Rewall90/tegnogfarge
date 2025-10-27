import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * API Route: Track lead campaign events
 *
 * Logs popup shown, email submitted, and dismissed events to MongoDB
 * for dashboard analytics (opt-in vs opt-out rates, conversion metrics, etc.)
 */

export async function POST(request: Request) {
  try {
    const { campaignId, eventType, email, metadata } = await request.json();

    // Validation
    if (!campaignId || !eventType) {
      return NextResponse.json(
        { error: 'campaignId and eventType are required' },
        { status: 400 }
      );
    }

    if (!['shown', 'submitted', 'dismissed'].includes(eventType)) {
      return NextResponse.json(
        { error: 'eventType must be one of: shown, submitted, dismissed' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Store full event log in lead_campaign_events collection
    const eventDoc = {
      campaignId,
      eventType,
      email: email || null, // Only for 'submitted' events
      metadata: metadata || {},
      timestamp: new Date(),
      userAgent: request.headers.get('user-agent') || null,
    };

    await db.collection('lead_campaign_events').insertOne(eventDoc);

    // Also update aggregate counters for fast dashboard queries
    await db.collection('lead_campaign_stats').updateOne(
      { campaignId },
      {
        $inc: {
          [`${eventType}Count`]: 1,
          totalEvents: 1,
        },
        $set: {
          lastUpdated: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      logged: true,
    });
  } catch (error) {
    console.error('[API] Error tracking lead campaign event:', error);

    // Don't fail the request - tracking shouldn't break user experience
    return NextResponse.json(
      { error: 'Failed to track event', success: false },
      { status: 500 }
    );
  }
}

/**
 * API Route: Get lead campaign stats
 *
 * GET /api/lead-campaigns/track?campaignId=xxx
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');

    if (!campaignId) {
      return NextResponse.json(
        { error: 'campaignId is required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Get aggregated stats
    const stats = await db.collection('lead_campaign_stats').findOne({
      campaignId
    });

    if (!stats) {
      return NextResponse.json({
        campaignId,
        shownCount: 0,
        submittedCount: 0,
        dismissedCount: 0,
        totalEvents: 0,
        conversionRate: 0,
        dismissRate: 0,
      });
    }

    // Calculate rates
    const shownCount = stats.shownCount || 0;
    const submittedCount = stats.submittedCount || 0;
    const dismissedCount = stats.dismissedCount || 0;

    const conversionRate = shownCount > 0 ? (submittedCount / shownCount) * 100 : 0;
    const dismissRate = shownCount > 0 ? (dismissedCount / shownCount) * 100 : 0;

    return NextResponse.json({
      campaignId,
      shownCount,
      submittedCount,
      dismissedCount,
      totalEvents: stats.totalEvents || 0,
      conversionRate: Math.round(conversionRate * 100) / 100, // 2 decimal places
      dismissRate: Math.round(dismissRate * 100) / 100,
      lastUpdated: stats.lastUpdated,
    });
  } catch (error) {
    console.error('[API] Error fetching lead campaign stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
