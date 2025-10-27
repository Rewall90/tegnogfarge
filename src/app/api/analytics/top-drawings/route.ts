import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getDb } from '@/lib/db';
import { getColoringImage } from '@/lib/sanity';

/**
 * GET /api/analytics/top-drawings
 *
 * Returns top performing drawings sorted by specified metric with optional date filtering.
 * Query params:
 * - metric: 'downloads' | 'completions' (default: 'downloads')
 * - limit: number (default: 10, max: 50)
 * - startDate: YYYY-MM-DD (optional, filters from this date)
 * - endDate: YYYY-MM-DD (optional, filters to this date)
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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Determine event type based on metric
    const eventType = metric === 'completions' ? 'coloring_complete' : 'pdf_download';

    const db = await getDb();

    // Build date filter
    const dateFilter: any = { eventType };
    if (startDate || endDate) {
      dateFilter.downloadedAt = {};
      if (startDate) {
        dateFilter.downloadedAt.$gte = new Date(startDate + 'T00:00:00.000Z');
      }
      if (endDate) {
        dateFilter.downloadedAt.$lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    // Aggregate top images from unique_downloads collection
    const uniqueDownloadsCollection = db.collection('unique_downloads');
    const topImages = await uniqueDownloadsCollection
      .aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$imageId',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: limit },
      ])
      .toArray();

    // Fetch drawing details from Sanity and get both download/completion counts
    const topDrawings = await Promise.all(
      topImages.map(async (imageData) => {
        try {
          const drawing = await getColoringImage(imageData._id);

          // Get both metrics for this image
          const downloads = await getCountForImage(
            imageData._id,
            'pdf_download',
            startDate,
            endDate
          );
          const completions = await getCountForImage(
            imageData._id,
            'coloring_complete',
            startDate,
            endDate
          );

          return {
            imageId: imageData._id,
            title: drawing?.title || 'Unknown Drawing',
            downloads,
            completions,
            category: drawing?.category?.title || undefined,
            subcategory: drawing?.subcategory?.title || undefined,
          };
        } catch (error) {
          console.error(`Failed to fetch drawing ${imageData._id}:`, error);
          return {
            imageId: imageData._id,
            title: 'Unknown Drawing',
            downloads: eventType === 'pdf_download' ? imageData.count : 0,
            completions: eventType === 'coloring_complete' ? imageData.count : 0,
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
 * Helper: Get count for a specific image and event type with optional date filter
 */
async function getCountForImage(
  imageId: string,
  eventType: string,
  startDate?: string | null,
  endDate?: string | null
): Promise<number> {
  try {
    const db = await getDb();

    // Build filter with date range if provided
    const filter: any = { imageId, eventType };
    if (startDate || endDate) {
      filter.downloadedAt = {};
      if (startDate) {
        filter.downloadedAt.$gte = new Date(startDate + 'T00:00:00.000Z');
      }
      if (endDate) {
        filter.downloadedAt.$lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    const count = await db.collection('unique_downloads').countDocuments(filter);
    return count;
  } catch (error) {
    console.error(`Failed to get count for ${imageId}:`, error);
    return 0;
  }
}
