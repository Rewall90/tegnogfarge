/**
 * Utility functions for viewport detection and above-the-fold calculations
 */

/**
 * Breakpoint definitions for responsive grid layouts
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * Grid layout configurations for different viewport sizes
 * These represent the number of items visible per row at each breakpoint
 */
export const GRID_LAYOUTS = {
  standard: {
    mobile: 1, // Items per row on mobile
    tablet: 2, // Items per row on tablet
    desktop: 3, // Items per row on desktop
    wide: 4, // Items per row on wide screens
  },
  compact: {
    mobile: 2,
    tablet: 3,
    desktop: 4,
    wide: 6,
  },
};

/**
 * Default number of rows to consider as "above the fold"
 * This is used to determine which items should be loaded with priority
 */
export const DEFAULT_ABOVE_FOLD_ROWS = 2;

/**
 * Interface for the result of getAboveFoldItems function
 */
export interface AboveFoldResult {
  /**
   * Number of items that should be considered above the fold
   */
  count: number;
  
  /**
   * Function to check if an item is above the fold based on its index
   */
  isAboveFold: (index: number) => boolean;
}

/**
 * Get the number of items that should be considered "above the fold"
 * based on the current viewport and grid layout
 * 
 * @param options Configuration options
 * @returns Object with count and isAboveFold function
 */
export function getAboveFoldItems({
  windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024,
  rows = DEFAULT_ABOVE_FOLD_ROWS,
  gridLayout = GRID_LAYOUTS.standard,
}: {
  windowWidth?: number;
  rows?: number;
  gridLayout?: typeof GRID_LAYOUTS.standard;
}): AboveFoldResult {
  // Determine current grid configuration based on viewport width
  let itemsPerRow: number;
  
  if (windowWidth < BREAKPOINTS.sm) {
    itemsPerRow = gridLayout.mobile;
  } else if (windowWidth < BREAKPOINTS.lg) {
    itemsPerRow = gridLayout.tablet;
  } else if (windowWidth < BREAKPOINTS.xl) {
    itemsPerRow = gridLayout.desktop;
  } else {
    itemsPerRow = gridLayout.wide;
  }
  
  // Calculate total items above the fold
  const count = itemsPerRow * rows;
  
  return {
    count,
    isAboveFold: (index: number) => index < count,
  };
}

/**
 * Check if an element is likely to be above the fold
 * 
 * @param element Element to check
 * @returns Boolean indicating if element is above the fold
 */
export function isElementLikelyAboveFold(element: HTMLElement): boolean {
  // Skip checking if not in browser environment
  if (typeof window === 'undefined') return false;
  
  const viewportHeight = window.innerHeight;
  const rect = element.getBoundingClientRect();
  
  // Element is above the fold if its top is within the viewport
  return rect.top < viewportHeight;
}

/**
 * Get priority loading configuration for a list of items
 * 
 * @param totalItems Total number of items in the list
 * @param viewportWidth Current viewport width
 * @returns Configuration for priority loading
 */
export function getPriorityConfig(totalItems: number, viewportWidth: number = 1024): {
  priorityCount: number;
  mobileBreakpoint: number;
  tabletBreakpoint: number;
} {
  // Default configuration
  let priorityCount = 6; // Default for desktop
  const mobileBreakpoint = BREAKPOINTS.sm;
  const tabletBreakpoint = BREAKPOINTS.lg;
  
  // Adjust based on viewport width
  if (viewportWidth < mobileBreakpoint) {
    // Mobile: typically 2-3 items visible
    priorityCount = Math.min(3, totalItems);
  } else if (viewportWidth < tabletBreakpoint) {
    // Tablet: typically 4-6 items visible
    priorityCount = Math.min(6, totalItems);
  } else {
    // Desktop: typically 6-8 items visible
    priorityCount = Math.min(8, totalItems);
  }
  
  return {
    priorityCount,
    mobileBreakpoint,
    tabletBreakpoint,
  };
} 