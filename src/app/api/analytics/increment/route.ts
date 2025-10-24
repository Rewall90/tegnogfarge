import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/**
 * API Route: Increment download counter for an image
 *
 * This keeps real-time download counts in MongoDB while
 * full analytics details are tracked in Google Analytics.
 */
export async function POST(request: Request) {
  try {
    const { imageId, eventType = 'download' } = await request.json();

    if (!imageId) {
      return NextResponse.json(
        { error: 'imageId is required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Use a dedicated counters collection for simplicity
    // This works regardless of whether drawings exist in MongoDB
    const result = await db.collection('analytics_counters').updateOne(
      { imageId, eventType },
      {
        $inc: { count: 1 },
        $set: { lastUpdated: new Date() }
      },
      { upsert: true } // Create if doesn't exist
    );

    return NextResponse.json({
      success: true,
      count: result.upsertedCount ? 1 : undefined
    });
  } catch (error) {
    console.error('Error incrementing download count:', error);
    // Don't fail the request - analytics shouldn't break user experience
    return NextResponse.json(
      { error: 'Failed to increment counter' },
      { status: 500 }
    );
  }
}

/**
 * API Route: Get download count for an image
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');
    const eventType = searchParams.get('eventType') || 'download';

    if (!imageId) {
      return NextResponse.json(
        { error: 'imageId is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const counter = await db.collection('analytics_counters').findOne({
      imageId,
      eventType
    });

    return NextResponse.json({
      imageId,
      eventType,
      count: counter?.count || 0,
      lastUpdated: counter?.lastUpdated || null
    });
  } catch (error) {
    console.error('Error fetching download count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch counter' },
      { status: 500 }
    );
  }
}
