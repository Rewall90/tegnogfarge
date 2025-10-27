import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getDb } from '@/lib/db';

/**
 * GET /api/analytics/overview
 *
 * Returns aggregate analytics statistics with optional date filtering:
 * - Total unique downloads (per user per image)
 * - Total unique users who downloaded
 * - Total online coloring completions
 * - Total unique images with analytics
 *
 * Query params:
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

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const db = await getDb();

    // Build date filter for unique_downloads collection
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.downloadedAt = {};
      if (startDate) {
        dateFilter.downloadedAt.$gte = new Date(startDate + 'T00:00:00.000Z');
      }
      if (endDate) {
        dateFilter.downloadedAt.$lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    // Query unique_downloads collection for date-filtered stats
    const uniqueDownloadsCollection = db.collection('unique_downloads');

    // Get downloads (pdf_download events)
    const downloadFilter = { ...dateFilter, eventType: 'pdf_download' };
    const totalDownloads = await uniqueDownloadsCollection.countDocuments(downloadFilter);

    // Get unique users who downloaded
    const uniqueUsersResult = await uniqueDownloadsCollection
      .aggregate([
        { $match: downloadFilter },
        { $group: { _id: '$userIdentifier' } },
        { $count: 'uniqueUsers' }
      ])
      .toArray();
    const uniqueUsers = uniqueUsersResult[0]?.uniqueUsers || 0;

    // Get unique images that were downloaded
    const uniqueImagesResult = await uniqueDownloadsCollection
      .aggregate([
        { $match: downloadFilter },
        { $group: { _id: '$imageId' } },
        { $count: 'uniqueImages' }
      ])
      .toArray();
    const uniqueImages = uniqueImagesResult[0]?.uniqueImages || 0;

    // Get completions (coloring_complete events)
    const completionFilter = { ...dateFilter, eventType: 'coloring_complete' };
    const totalCompletions = await uniqueDownloadsCollection.countDocuments(completionFilter);

    // For now, views are tracked in GA4 only
    const response = {
      totalDownloads,
      totalCompletions,
      totalViews: 0, // Will be populated from GA4 in Phase 2B
      uniqueImages,
      uniqueUsers, // NEW: Unique users who downloaded in period
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Analytics API] Error fetching overview stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch overview statistics' },
      { status: 500 }
    );
  }
}
