/**
 * Analytics API Client
 *
 * Client-side functions for fetching analytics data from MongoDB.
 * Used by the admin dashboard to display real-time metrics.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface OverviewStats {
  totalDownloads: number;
  totalCompletions: number;
  totalViews: number;
  uniqueImages: number;
  uniqueUsers: number; // NEW: Unique users who downloaded in period
}

export interface TopDrawing {
  imageId: string;
  title: string;
  downloads: number;
  completions: number;
  category?: string;
  subcategory?: string;
}

export interface CategoryStats {
  category: string;
  downloads: number;
  completions: number;
  imageCount: number;
}

export interface DateRange {
  startDate: string | null; // ISO date string (YYYY-MM-DD)
  endDate: string | null;   // ISO date string (YYYY-MM-DD)
}

// ============================================================================
// API CLIENT FUNCTIONS
// ============================================================================

/**
 * Fetch overview statistics with optional date filtering
 */
export async function fetchOverviewStats(dateRange?: DateRange): Promise<OverviewStats> {
  try {
    let url = '/api/analytics/overview';

    // Add date parameters if provided
    if (dateRange?.startDate || dateRange?.endDate) {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      url += `?${params.toString()}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch overview stats: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[Analytics API] Error fetching overview stats:', error);
    throw error;
  }
}

/**
 * Fetch top drawings by metric with optional date filtering
 */
export async function fetchTopDrawings(
  metric: 'downloads' | 'completions' = 'downloads',
  limit: number = 10,
  dateRange?: DateRange
): Promise<TopDrawing[]> {
  try {
    const params = new URLSearchParams({
      metric,
      limit: limit.toString(),
    });

    // Add date parameters if provided
    if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
    if (dateRange?.endDate) params.append('endDate', dateRange.endDate);

    const response = await fetch(`/api/analytics/top-drawings?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch top drawings: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[Analytics API] Error fetching top drawings:', error);
    throw error;
  }
}

/**
 * Fetch category breakdown statistics
 */
export async function fetchCategoryStats(): Promise<CategoryStats[]> {
  try {
    const response = await fetch('/api/analytics/by-category');

    if (!response.ok) {
      throw new Error(`Failed to fetch category stats: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[Analytics API] Error fetching category stats:', error);
    throw error;
  }
}
