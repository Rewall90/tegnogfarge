import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getDb } from '@/lib/db';

/**
 * GET /api/analytics/overview
 *
 * Returns aggregate analytics statistics:
 * - Total PDF downloads
 * - Total online coloring completions
 * - Total unique images with analytics
 */
export async function GET() {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const db = await getDb();
    const collection = db.collection('analytics_counters');

    // Aggregate statistics
    const stats = await collection
      .aggregate([
        {
          $group: {
            _id: null,
            totalDownloads: {
              $sum: {
                $cond: [{ $eq: ['$eventType', 'pdf_download'] }, '$count', 0],
              },
            },
            totalCompletions: {
              $sum: {
                $cond: [{ $eq: ['$eventType', 'coloring_complete'] }, '$count', 0],
              },
            },
            uniqueImages: { $addToSet: '$imageId' },
          },
        },
        {
          $project: {
            _id: 0,
            totalDownloads: 1,
            totalCompletions: 1,
            uniqueImages: { $size: '$uniqueImages' },
          },
        },
      ])
      .toArray();

    const overview = stats[0] || {
      totalDownloads: 0,
      totalCompletions: 0,
      uniqueImages: 0,
    };

    // For now, views are tracked in GA4 only, so we don't have them in MongoDB
    const response = {
      totalDownloads: overview.totalDownloads,
      totalCompletions: overview.totalCompletions,
      totalViews: 0, // Will be populated from GA4 in Phase 2B
      uniqueImages: overview.uniqueImages,
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
