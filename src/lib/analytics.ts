/**
 * Google Analytics Event Tracking
 *
 * This module provides type-safe wrapper functions for tracking user interactions
 * with Google Analytics. All events respect user cookie consent preferences.
 */

// Extend Window interface to include gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Check if analytics is available and user has consented
 */
function isAnalyticsAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  if (!window.gtag) return false;

  // Check for cookie consent - analytics should only run if user has consented
  // The GoogleAnalytics component from @next/third-parties handles consent automatically
  return true;
}

/**
 * Wait for Google Analytics to be ready
 */
function waitForGtag(maxWaitTime = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    // If gtag already exists, resolve immediately
    if (typeof window !== 'undefined' && window.gtag) {
      resolve(true);
      return;
    }

    // Otherwise, wait for it with a timeout
    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (typeof window !== 'undefined' && window.gtag) {
        clearInterval(checkInterval);
        resolve(true);
      } else if (Date.now() - startTime > maxWaitTime) {
        clearInterval(checkInterval);
        resolve(false); // Timeout
      }
    }, 100); // Check every 100ms
  });
}

/**
 * Send a custom event to Google Analytics
 */
async function trackEvent(eventName: string, eventParams?: Record<string, any>): Promise<void> {
  // Always log in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', eventName, eventParams);
  }

  // Skip if not in browser
  if (typeof window === 'undefined') return;

  // Wait for gtag to be available (with 5 second timeout)
  const gtagReady = await waitForGtag(5000);

  if (!gtagReady || !window.gtag) {
    console.warn('[Analytics] Google Analytics not loaded after 5 seconds, event not tracked:', eventName);
    return;
  }

  try {
    window.gtag('event', eventName, eventParams);
    console.log('[Analytics] Event tracked:', eventName);
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
}

/**
 * Increment download counter in database (for real-time display)
 * This runs alongside GA4 tracking for the hybrid approach
 */
async function incrementCounter(imageId: string, eventType: string = 'download'): Promise<void> {
  const startTime = performance.now();
  console.log('[Analytics] incrementCounter called', {
    imageId,
    eventType,
    timestamp: new Date().toISOString()
  });

  // Skip if not in browser
  if (typeof window === 'undefined') {
    console.warn('[Analytics] incrementCounter: Not in browser environment, skipping');
    return;
  }

  try {
    console.log('[Analytics] Sending POST to /api/analytics/increment', {
      imageId,
      eventType,
      elapsed: `${(performance.now() - startTime).toFixed(2)}ms`
    });

    const response = await fetch('/api/analytics/increment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageId, eventType }),
    });

    const data = await response.json();
    console.log('[Analytics] Counter incremented successfully', {
      imageId,
      response: data,
      elapsed: `${(performance.now() - startTime).toFixed(2)}ms`
    });
  } catch (error) {
    // Fail silently - don't break user experience
    console.error('[Analytics] Failed to increment counter:', {
      error,
      imageId,
      eventType,
      elapsed: `${(performance.now() - startTime).toFixed(2)}ms`
    });
  }
}

/**
 * Get download count for an image (server-side helper)
 * Use this in Server Components to display download counts
 */
export async function getDownloadCount(imageId: string, eventType: string = 'pdf_download'): Promise<number> {
  // Return 0 if no imageId provided
  if (!imageId) {
    console.warn('[Analytics] getDownloadCount: No imageId provided');
    return 0;
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/analytics/increment?imageId=${encodeURIComponent(imageId)}&eventType=${encodeURIComponent(eventType)}`;

    console.log('[Analytics] Fetching download count:', { imageId, eventType, url });

    const response = await fetch(url, {
      next: { revalidate: 60 } // Cache for 1 minute
    });

    if (!response.ok) {
      console.error('[Analytics] Failed to fetch download count:', {
        status: response.status,
        statusText: response.statusText,
        imageId
      });
      return 0;
    }

    const data = await response.json();
    console.log('[Analytics] Download count fetched:', { imageId, count: data.count });
    return data.count || 0;
  } catch (error) {
    console.error('[Analytics] Error fetching download count:', { error, imageId });
    return 0;
  }
}

/**
 * Get coloring completion count for an image (server-side helper)
 * Tracks ONLINE/DIGITAL coloring completions (not physical PDF coloring)
 * Use this in Server Components to display completion counts
 */
export async function getCompletionCount(imageId: string): Promise<number> {
  // Return 0 if no imageId provided
  if (!imageId) {
    console.warn('[Analytics] getCompletionCount: No imageId provided');
    return 0;
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/analytics/increment?imageId=${encodeURIComponent(imageId)}&eventType=coloring_complete`;

    console.log('[Analytics] Fetching completion count:', { imageId, url });

    const response = await fetch(url, {
      next: { revalidate: 60 } // Cache for 1 minute
    });

    if (!response.ok) {
      console.error('[Analytics] Failed to fetch completion count:', {
        status: response.status,
        statusText: response.statusText,
        imageId
      });
      return 0;
    }

    const data = await response.json();
    console.log('[Analytics] Completion count fetched:', { imageId, count: data.count });
    return data.count || 0;
  } catch (error) {
    console.error('[Analytics] Error fetching completion count:', { error, imageId });
    return 0;
  }
}

// ============================================================================
// DOWNLOAD TRACKING
// ============================================================================

/**
 * Track PDF download events
 */
export function trackPdfDownload(params: {
  imageId: string;
  imageTitle: string;
  category: string;
  subcategory: string;
}): void {
  const startTime = performance.now();
  console.log('[Analytics] trackPdfDownload started', {
    imageId: params.imageId,
    imageTitle: params.imageTitle,
    category: params.category,
    subcategory: params.subcategory,
    timestamp: new Date().toISOString()
  });

  // Track in Google Analytics (full details)
  console.log('[Analytics] Calling trackEvent for download_pdf', {
    elapsed: `${(performance.now() - startTime).toFixed(2)}ms`
  });

  trackEvent('download_pdf', {
    event_category: 'Downloads',
    event_label: params.imageTitle,
    image_id: params.imageId,
    category: params.category,
    subcategory: params.subcategory,
    value: 1,
  });

  console.log('[Analytics] trackEvent called, now calling incrementCounter', {
    elapsed: `${(performance.now() - startTime).toFixed(2)}ms`
  });

  // Increment counter in database (for real-time display)
  incrementCounter(params.imageId, 'pdf_download');

  console.log('[Analytics] trackPdfDownload completed (synchronous part)', {
    elapsed: `${(performance.now() - startTime).toFixed(2)}ms`
  });
}

/**
 * Track colored image download from coloring app
 */
export function trackColoredImageDownload(params: {
  imageId: string;
  imageTitle: string;
  category: string;
  subcategory: string;
  format: 'png' | 'jpg';
}): void {
  // Track in Google Analytics (full details)
  trackEvent('download_colored_image', {
    event_category: 'Downloads',
    event_label: params.imageTitle,
    image_id: params.imageId,
    category: params.category,
    subcategory: params.subcategory,
    file_format: params.format,
    value: 1,
  });

  // Increment counter in database (for real-time display)
  incrementCounter(params.imageId, 'colored_download');
}

// ============================================================================
// COLORING APP TRACKING
// ============================================================================

/**
 * Track when user starts coloring an image
 */
export function trackStartColoring(params: {
  imageId: string;
  imageTitle: string;
  category: string;
  subcategory: string;
}): void {
  trackEvent('start_coloring', {
    event_category: 'Engagement',
    event_label: params.imageTitle,
    image_id: params.imageId,
    category: params.category,
    subcategory: params.subcategory,
  });
}

/**
 * Track coloring session completion (when user downloads their work)
 * This tracks ONLINE/DIGITAL coloring completions (not physical PDF coloring)
 */
export function trackColoringComplete(params: {
  imageId: string;
  imageTitle: string;
  timeSpentSeconds: number;
}): void {
  // Track in Google Analytics (full details)
  trackEvent('coloring_complete', {
    event_category: 'Engagement',
    event_label: params.imageTitle,
    image_id: params.imageId,
    time_spent: params.timeSpentSeconds,
    value: Math.round(params.timeSpentSeconds / 60), // Value in minutes
  });

  // Increment counter in database (for real-time display)
  incrementCounter(params.imageId, 'coloring_complete');
}

/**
 * Track tool usage in coloring app
 */
export function trackToolUsage(tool: 'pencil' | 'eraser' | 'fill' | 'eyedropper'): void {
  trackEvent('tool_usage', {
    event_category: 'Coloring Tools',
    event_label: tool,
    tool_name: tool,
  });
}

// ============================================================================
// PAGE VIEW TRACKING
// ============================================================================

/**
 * Track category page views
 */
export function trackCategoryView(params: {
  categorySlug: string;
  categoryTitle: string;
}): void {
  trackEvent('view_category', {
    event_category: 'Navigation',
    event_label: params.categoryTitle,
    category_slug: params.categorySlug,
  });
}

/**
 * Track subcategory page views
 */
export function trackSubcategoryView(params: {
  categorySlug: string;
  subcategorySlug: string;
  subcategoryTitle: string;
}): void {
  trackEvent('view_subcategory', {
    event_category: 'Navigation',
    event_label: params.subcategoryTitle,
    category_slug: params.categorySlug,
    subcategory_slug: params.subcategorySlug,
  });
}

/**
 * Track individual drawing page views
 */
export function trackDrawingView(params: {
  imageId: string;
  imageTitle: string;
  category: string;
  subcategory: string;
}): void {
  trackEvent('view_drawing', {
    event_category: 'Content',
    event_label: params.imageTitle,
    image_id: params.imageId,
    category: params.category,
    subcategory: params.subcategory,
  });
}

// ============================================================================
// SEARCH TRACKING
// ============================================================================

/**
 * Track search queries
 */
export function trackSearch(params: {
  searchQuery: string;
  resultsCount: number;
}): void {
  trackEvent('search', {
    event_category: 'Search',
    search_term: params.searchQuery,
    results_count: params.resultsCount,
  });
}

/**
 * Track searches with no results
 * This helps identify content gaps - what users want that you don't have
 */
export function trackSearchNoResults(params: {
  searchQuery: string;
  searchContext?: 'autocomplete' | 'search_page';
}): void {
  trackEvent('search_no_results', {
    event_category: 'Search',
    event_label: 'No Results',
    search_term: params.searchQuery,
    search_context: params.searchContext || 'search_page',
    value: 0,
  });
}

// ============================================================================
// RELATED CONTENT TRACKING
// ============================================================================

/**
 * Track clicks on related drawings
 * This helps optimize recommendation algorithms and understand user navigation patterns
 */
export function trackRelatedDrawingClick(params: {
  fromDrawingId: string;
  fromDrawingTitle: string;
  toDrawingId: string;
  toDrawingTitle: string;
  position: number;
  subcategory: string;
}): void {
  trackEvent('click_related_drawing', {
    event_category: 'Navigation',
    event_label: `${params.fromDrawingTitle} → ${params.toDrawingTitle}`,
    from_drawing_id: params.fromDrawingId,
    from_drawing_title: params.fromDrawingTitle,
    to_drawing_id: params.toDrawingId,
    to_drawing_title: params.toDrawingTitle,
    position: params.position,
    subcategory: params.subcategory,
    value: params.position, // Lower position = higher value (1st item is most valuable)
  });
}

// ============================================================================
// USER ENGAGEMENT
// ============================================================================

/**
 * Track newsletter signups
 */
export function trackNewsletterSignup(source: string): void {
  trackEvent('newsletter_signup', {
    event_category: 'Engagement',
    event_label: source,
    signup_source: source,
    value: 1,
  });
}

/**
 * Track when user adds image to favorites
 */
export function trackAddFavorite(params: {
  imageId: string;
  imageTitle: string;
}): void {
  trackEvent('add_favorite', {
    event_category: 'Engagement',
    event_label: params.imageTitle,
    image_id: params.imageId,
  });
}

/**
 * Track when user removes image from favorites
 */
export function trackRemoveFavorite(params: {
  imageId: string;
  imageTitle: string;
}): void {
  trackEvent('remove_favorite', {
    event_category: 'Engagement',
    event_label: params.imageTitle,
    image_id: params.imageId,
  });
}

// ============================================================================
// SOCIAL SHARING
// ============================================================================

/**
 * Track social media shares
 */
export function trackShare(params: {
  platform: 'facebook' | 'twitter' | 'pinterest' | 'copy_link';
  contentType: 'drawing' | 'category' | 'blog_post';
  contentTitle: string;
}): void {
  trackEvent('share', {
    event_category: 'Social',
    method: params.platform,
    content_type: params.contentType,
    item_id: params.contentTitle,
  });
}

// ============================================================================
// ERROR TRACKING
// ============================================================================

/**
 * Track errors and issues
 */
export function trackError(params: {
  errorType: string;
  errorMessage: string;
  page?: string;
}): void {
  trackEvent('error', {
    event_category: 'Errors',
    error_type: params.errorType,
    error_message: params.errorMessage,
    page: params.page || window.location.pathname,
  });
}
