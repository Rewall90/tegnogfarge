'use client';

/**
 * Utility for tracking and measuring image loading performance
 * 
 * This module provides tools to measure Largest Contentful Paint (LCP),
 * track image loading times, and report performance metrics.
 */

// Type definitions for the Performance API
interface LargestContentfulPaintEntry extends PerformanceEntry {
  element: Element;
  renderTime: number;
  size: number;
}

interface PerformanceResourceTiming extends PerformanceEntry {
  initiatorType: string;
  responseEnd: number;
}

/**
 * Interface for image loading metrics
 */
interface ImageLoadMetrics {
  /**
   * URL of the image
   */
  url: string | null;
  
  /**
   * Time it took to start loading the image (ms)
   */
  startTime: number;
  
  /**
   * Time it took to render the image (ms)
   */
  renderTime: number;
  
  /**
   * Size of the image in pixels (width x height)
   */
  size: number;
  
  /**
   * Type of the element ('img', 'bg', etc.)
   */
  elementType: string;
  
  /**
   * Whether this was the LCP element
   */
  isLCP: boolean;
}

/**
 * Configuration options for the performance tracking
 */
interface PerformanceTrackingOptions {
  /**
   * Whether to enable debug logging
   * @default false
   */
  debug?: boolean;
  
  /**
   * Whether to track all images or just LCP
   * @default false
   */
  trackAllImages?: boolean;
  
  /**
   * Callback function to execute when metrics are collected
   */
  onMetricsCollected?: (metrics: ImageLoadMetrics) => void;
}

/**
 * Default configuration for performance tracking
 */
const DEFAULT_OPTIONS: PerformanceTrackingOptions = {
  debug: false,
  trackAllImages: false,
};

/**
 * Track Largest Contentful Paint (LCP) metrics
 * 
 * @param options Configuration options
 * @returns Cleanup function to stop tracking
 */
export function trackLCP(options: PerformanceTrackingOptions = DEFAULT_OPTIONS): () => void {
  // Skip if not in browser environment
  if (typeof window === 'undefined' || !window.PerformanceObserver) {
    return () => {};
  }
  
  const { debug, onMetricsCollected } = { ...DEFAULT_OPTIONS, ...options };
  
  // Create performance observer for LCP
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1] as LargestContentfulPaintEntry;
    
    if (lastEntry && lastEntry.element?.tagName === 'IMG') {
      const metrics: ImageLoadMetrics = {
        url: lastEntry.element.getAttribute('src'),
        startTime: lastEntry.startTime,
        renderTime: lastEntry.renderTime || lastEntry.startTime,
        size: lastEntry.size,
        elementType: lastEntry.element.tagName.toLowerCase(),
        isLCP: true,
      };
      
      if (debug) {
        console.log('[ImageMetrics] LCP Image:', metrics);
      }
      
      if (onMetricsCollected) {
        onMetricsCollected(metrics);
      }
    }
  });
  
  // Start observing LCP
  lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  
  // Return cleanup function
  return () => {
    lcpObserver.disconnect();
  };
}

/**
 * Track loading performance for all images on the page
 * 
 * @param options Configuration options
 * @returns Cleanup function to stop tracking
 */
export function trackAllImages(options: PerformanceTrackingOptions = DEFAULT_OPTIONS): () => void {
  // Skip if not in browser environment
  if (typeof window === 'undefined') {
    return () => {};
  }
  
  const { debug, onMetricsCollected } = { ...DEFAULT_OPTIONS, ...options };
  
  // Track resource timing for image loading
  const resourceObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    
    entries.forEach(entry => {
      // Only process image resources
      const resourceEntry = entry as PerformanceResourceTiming;
      if (resourceEntry.initiatorType === 'img') {
        const metrics: ImageLoadMetrics = {
          url: resourceEntry.name,
          startTime: resourceEntry.startTime,
          renderTime: resourceEntry.responseEnd,
          size: 0, // Resource timing doesn't provide size info
          elementType: 'img',
          isLCP: false,
        };
        
        if (debug) {
          console.log('[ImageMetrics] Image loaded:', metrics);
        }
        
        if (onMetricsCollected) {
          onMetricsCollected(metrics);
        }
      }
    });
  });
  
  // Start observing resource timing
  resourceObserver.observe({ type: 'resource', buffered: true });
  
  // Return cleanup function
  return () => {
    resourceObserver.disconnect();
  };
}

/**
 * Create a hook for tracking image loading performance in React components
 * 
 * This is a simple implementation - in a real app, you might want to use
 * a more sophisticated approach like a custom React hook.
 * 
 * @example
 * ```tsx
 * useEffect(() => {
 *   const cleanup = trackImagePerformance({
 *     debug: true,
 *     trackAllImages: true,
 *     onMetricsCollected: (metrics) => {
 *       // Send to analytics service
 *       analyticsService.trackImagePerformance(metrics);
 *     }
 *   });
 *   
 *   return cleanup;
 * }, []);
 * ```
 */
export function trackImagePerformance(options: PerformanceTrackingOptions = DEFAULT_OPTIONS): () => void {
  const lcpCleanup = trackLCP(options);
  
  // Only track all images if explicitly requested
  const allImagesCleanup = options.trackAllImages ? trackAllImages(options) : () => {};
  
  // Return combined cleanup function
  return () => {
    lcpCleanup();
    allImagesCleanup();
  };
} 