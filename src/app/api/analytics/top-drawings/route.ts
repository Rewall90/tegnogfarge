import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getDb } from '@/lib/db';
import { getColoringImage } from '@/lib/sanity';

/**
 * GET /api/analytics/top-drawings
 *
 * Returns top performing drawings sorted by specified metric.
 * Query params:
 * - metric: 'downloads' | 'completions' (default: 'downloads')
 * - limit: number (default: 10, max: 50)
 */
export async function GET(request: Request) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric') || 'downloads';
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

    // Determine event type based on metric
    const eventType = metric === 'completions' ? 'coloring_complete' : 'pdf_download';

    const db = await getDb();
    const collection = db.collection('analytics_counters');

    // Get top images by count
    const topCounters = await collection
      .find({ eventType })
      .sort({ count: -1 })
      .limit(limit)
      .toArray();

    // Fetch drawing details from Sanity for each image
    const topDrawings = await Promise.all(
      topCounters.map(async (counter) => {
        try {
          const drawing = await getColoringImage(counter.imageId);

          return {
            imageId: counter.imageId,
            title: drawing?.title || 'Unknown Drawing',
            downloads:
              eventType === 'pdf_download'
                ? counter.count
                : await getCountForImage(counter.imageId, 'pdf_download'),
            completions:
              eventType === 'coloring_complete'
                ? counter.count
                : await getCountForImage(counter.imageId, 'coloring_complete'),
            category: drawing?.category?.title || undefined,
            subcategory: drawing?.subcategory?.title || undefined,
          };
        } catch (error) {
          console.error(`Failed to fetch drawing ${counter.imageId}:`, error);
          return {
            imageId: counter.imageId,
            title: 'Unknown Drawing',
            downloads: eventType === 'pdf_download' ? counter.count : 0,
            completions: eventType === 'coloring_complete' ? counter.count : 0,
          };
        }
      })
    );

    return NextResponse.json(topDrawings);
  } catch (error) {
    console.error('[Analytics API] Error fetching top drawings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top drawings' },
      { status: 500 }
    );
  }
}

/**
 * Helper: Get count for a specific image and event type
 */
async function getCountForImage(imageId: string, eventType: string): Promise<number> {
  try {
    const db = await getDb();
    const counter = await db.collection('analytics_counters').findOne({
      imageId,
      eventType,
    });
    return counter?.count || 0;
  } catch (error) {
    console.error(`Failed to get count for ${imageId}:`, error);
    return 0;
  }
}
