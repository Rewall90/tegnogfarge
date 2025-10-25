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

// ============================================================================
// API CLIENT FUNCTIONS
// ============================================================================

/**
 * Fetch overview statistics
 */
export async function fetchOverviewStats(): Promise<OverviewStats> {
  try {
    const response = await fetch('/api/analytics/overview');

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
 * Fetch top drawings by metric
 */
export async function fetchTopDrawings(
  metric: 'downloads' | 'completions' = 'downloads',
  limit: number = 10
): Promise<TopDrawing[]> {
  try {
    const response = await fetch(`/api/analytics/top-drawings?metric=${metric}&limit=${limit}`);

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
