import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getDb } from '@/lib/db';
import { getColoringImage } from '@/lib/sanity';

/**
 * GET /api/analytics/by-category
 *
 * Returns analytics broken down by category.
 * Groups all drawings by their parent category and aggregates stats.
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

    // Get all counters
    const allCounters = await collection.find({}).toArray();

    // Group by category
    const categoryMap = new Map<
      string,
      {
        downloads: number;
        completions: number;
        imageIds: Set<string>;
      }
    >();

    // Fetch category for each image and aggregate
    await Promise.all(
      allCounters.map(async (counter) => {
        try {
          const drawing = await getColoringImage(counter.imageId);
          const categoryName = drawing?.category?.title || 'Ukategorisert';

          if (!categoryMap.has(categoryName)) {
            categoryMap.set(categoryName, {
              downloads: 0,
              completions: 0,
              imageIds: new Set(),
            });
          }

          const categoryData = categoryMap.get(categoryName)!;
          categoryData.imageIds.add(counter.imageId);

          if (counter.eventType === 'pdf_download') {
            categoryData.downloads += counter.count;
          } else if (counter.eventType === 'coloring_complete') {
            categoryData.completions += counter.count;
          }
        } catch (error) {
          console.error(`Failed to process ${counter.imageId}:`, error);
        }
      })
    );

    // Convert map to array format
    const categoryStats = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        downloads: data.downloads,
        completions: data.completions,
        imageCount: data.imageIds.size,
      }))
      .sort((a, b) => b.downloads - a.downloads); // Sort by downloads descending

    return NextResponse.json(categoryStats);
  } catch (error) {
    console.error('[Analytics API] Error fetching category stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category statistics' },
      { status: 500 }
    );
  }
}
