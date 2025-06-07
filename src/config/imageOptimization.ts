/**
 * Image optimization configuration for the application
 * 
 * This file contains constants and configurations for optimizing
 * image loading throughout the application.
 */

/**
 * Root margin values for different contexts
 * 
 * These define how far outside the viewport to start loading images.
 * Larger values mean earlier preloading but potentially more bandwidth usage.
 */
export const ROOT_MARGINS = {
  /**
   * Standard root margin for most content
   * 200px is a good balance of performance and bandwidth
   */
  DEFAULT: '200px 0px',
  
  /**
   * Aggressive preloading for important grids
   * Use for main content areas that users are likely to scroll to
   */
  AGGRESSIVE: '300px 0px',
  
  /**
   * Conservative preloading for less important content
   * Use for content that might not be viewed, or for bandwidth-sensitive scenarios
   */
  CONSERVATIVE: '100px 0px',
  
  /**
   * Very aggressive preloading for critical content
   * Use sparingly for content that users are very likely to scroll to
   */
  VERY_AGGRESSIVE: '500px 0px',
  
  /**
   * Minimal preloading for low-priority content
   * Use for content far down the page that might not be viewed
   */
  MINIMAL: '50px 0px',
};

/**
 * Number of items to consider above the fold by default
 * for different layout contexts
 */
export const ABOVE_FOLD_ITEM_COUNTS = {
  /**
   * Default number of items to prioritize (standard grid)
   */
  DEFAULT: 6,
  
  /**
   * Number of items to prioritize on mobile devices
   */
  MOBILE: 4,
  
  /**
   * Number of items to prioritize on tablet devices
   */
  TABLET: 6,
  
  /**
   * Number of items to prioritize on desktop devices
   */
  DESKTOP: 8,
  
  /**
   * Number of items to prioritize on large screens
   */
  LARGE_DESKTOP: 12,
};

/**
 * Default quality settings for different image types
 */
export const IMAGE_QUALITY = {
  /**
   * High quality for hero and detail images
   */
  HIGH: 85,
  
  /**
   * Medium quality for general content images
   */
  MEDIUM: 75,
  
  /**
   * Lower quality for thumbnails and previews
   */
  LOW: 65,
};

/**
 * Configuration for fade-in animation durations
 */
export const FADE_DURATIONS = {
  /**
   * Fast fade-in for better perceived performance
   */
  FAST: 200,
  
  /**
   * Standard fade-in for most images
   */
  STANDARD: 300,
  
  /**
   * Slow fade-in for hero images or special effects
   */
  SLOW: 500,
};

/**
 * Determine if an image should be loaded with priority based on its position
 * 
 * @param index Position of the image in a list
 * @param threshold Number of items to prioritize
 * @returns Whether the image should be loaded with priority
 */
export function shouldPrioritize(index: number, threshold = ABOVE_FOLD_ITEM_COUNTS.DEFAULT): boolean {
  return index < threshold;
}

/**
 * Get the appropriate root margin based on image importance
 * 
 * @param importance Importance level of the image
 * @returns Appropriate root margin
 */
export function getRootMarginByImportance(
  importance: 'high' | 'medium' | 'low' = 'medium'
): string {
  switch (importance) {
    case 'high':
      return ROOT_MARGINS.AGGRESSIVE;
    case 'medium':
      return ROOT_MARGINS.DEFAULT;
    case 'low':
      return ROOT_MARGINS.CONSERVATIVE;
    default:
      return ROOT_MARGINS.DEFAULT;
  }
} 