/**
 * Daily Drawing Feature
 *
 * Fetches the most downloaded drawing from yesterday to display
 * as "Dagens Motiv" (Today's Motif) on the homepage.
 *
 * Features:
 * - Smart fallback chain (yesterday → week → all-time → default)
 * - Timezone-aware (Europe/Oslo)
 * - Filters inactive drawings
 * - Minimum download thresholds
 */

import { getDb } from './db';
import { getDrawingWithFullPath } from './sanity';

// Default fallback drawing if all else fails
const DEFAULT_DRAWING = {
  url: '/dyr/fargelegg-katter/katt-hopper-og-leker-med-ball',
  title: 'Katt hopper og leker med ball',
  fallbackUsed: 'default' as const
};

// Minimum download thresholds for each fallback level
const MIN_DOWNLOADS = {
  yesterday: 3,
  week: 5,
  allTime: 10
};

/**
 * Result interface for daily drawing
 */
export interface DailyDrawingResult {
  url: string;
  title: string;
  fallbackUsed: 'yesterday' | 'week' | 'alltime' | 'default';
}

/**
 * Calculate date range for yesterday in Europe/Oslo timezone
 */
function getYesterdayRange(): { start: Date; end: Date } {
  const now = new Date();

  // Create yesterday's date in Oslo timezone
  const yesterday = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Oslo' }));
  yesterday.setDate(yesterday.getDate() - 1);

  // Start: Yesterday 00:00:00
  const start = new Date(yesterday.toLocaleDateString('en-CA', {
    timeZone: 'Europe/Oslo'
  }) + 'T00:00:00.000Z');

  // End: Yesterday 23:59:59
  const end = new Date(yesterday.toLocaleDateString('en-CA', {
    timeZone: 'Europe/Oslo'
  }) + 'T23:59:59.999Z');

  return { start, end };
}

/**
 * Calculate date range for last N days
 */
function getLastNDaysRange(days: number): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Fetch top drawing from MongoDB for given date range
 */
async function getTopDrawingFromPeriod(
  startDate: Date,
  endDate: Date,
  minDownloads: number = 1
): Promise<string | null> {
  try {
    const db = await getDb();

    // Query unique_downloads collection for pdf_download events
    const result = await db.collection('unique_downloads').aggregate([
      {
        $match: {
          eventType: 'pdf_download',
          downloadedAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: '$imageId',
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gte: minDownloads }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 } // Get top 5 in case some are inactive
    ]).toArray();

    if (!result || result.length === 0) {
      return null;
    }

    // Try each top drawing until we find one that's active
    for (const drawing of result) {
      const imageId = drawing._id;

      // Verify drawing exists and is active in Sanity
      const drawingData = await getDrawingWithFullPath(imageId);

      if (drawingData && drawingData.isActive &&
          drawingData.categorySlug && drawingData.subcategorySlug && drawingData.slug) {
        return imageId;
      }
    }

    return null;
  } catch (error) {
    console.error('[Daily Drawing] Error fetching top drawing from period:', error);
    return null;
  }
}

/**
 * Build URL from drawing data
 */
function buildDrawingUrl(drawingData: any): string {
  const { categorySlug, subcategorySlug, slug } = drawingData;
  return `/${categorySlug}/${subcategorySlug}/${slug}`;
}

/**
 * Main function: Get daily drawing with smart fallback
 *
 * Fallback chain:
 * 1. Yesterday (min 3 downloads)
 * 2. Last 7 days (min 5 downloads)
 * 3. All time (min 10 downloads)
 * 4. Hardcoded default
 */
export async function getDailyDrawing(): Promise<DailyDrawingResult> {
  console.log('[Daily Drawing] Fetching daily drawing...');

  try {
    // TRY 1: Yesterday's top drawing
    console.log('[Daily Drawing] Attempting: Yesterday...');
    const yesterdayRange = getYesterdayRange();
    const yesterdayTopId = await getTopDrawingFromPeriod(
      yesterdayRange.start,
      yesterdayRange.end,
      MIN_DOWNLOADS.yesterday
    );

    if (yesterdayTopId) {
      const drawingData = await getDrawingWithFullPath(yesterdayTopId);
      if (drawingData) {
        const url = buildDrawingUrl(drawingData);
        console.log(`[Daily Drawing] ✓ Success: Yesterday's top - ${drawingData.title}`);
        return {
          url,
          title: drawingData.title,
          fallbackUsed: 'yesterday'
        };
      }
    }

    // TRY 2: Last 7 days
    console.log('[Daily Drawing] Attempting: Last 7 days...');
    const weekRange = getLastNDaysRange(7);
    const weekTopId = await getTopDrawingFromPeriod(
      weekRange.start,
      weekRange.end,
      MIN_DOWNLOADS.week
    );

    if (weekTopId) {
      const drawingData = await getDrawingWithFullPath(weekTopId);
      if (drawingData) {
        const url = buildDrawingUrl(drawingData);
        console.log(`[Daily Drawing] ✓ Success: Week's top - ${drawingData.title}`);
        return {
          url,
          title: drawingData.title,
          fallbackUsed: 'week'
        };
      }
    }

    // TRY 3: All-time top
    console.log('[Daily Drawing] Attempting: All-time...');
    const allTimeRange = getLastNDaysRange(365); // Last year
    const allTimeTopId = await getTopDrawingFromPeriod(
      allTimeRange.start,
      allTimeRange.end,
      MIN_DOWNLOADS.allTime
    );

    if (allTimeTopId) {
      const drawingData = await getDrawingWithFullPath(allTimeTopId);
      if (drawingData) {
        const url = buildDrawingUrl(drawingData);
        console.log(`[Daily Drawing] ✓ Success: All-time top - ${drawingData.title}`);
        return {
          url,
          title: drawingData.title,
          fallbackUsed: 'alltime'
        };
      }
    }

    // TRY 4: Default fallback
    console.log('[Daily Drawing] ⚠ Using default fallback');
    return DEFAULT_DRAWING;

  } catch (error) {
    console.error('[Daily Drawing] Error in getDailyDrawing:', error);
    console.log('[Daily Drawing] ⚠ Using default fallback due to error');
    return DEFAULT_DRAWING;
  }
}
