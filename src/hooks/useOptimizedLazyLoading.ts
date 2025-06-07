import { useState, useEffect, useRef, RefObject } from 'react';

/**
 * Configuration options for the optimized lazy loading hook
 */
export interface OptimizedLazyLoadingOptions {
  /**
   * The root margin to use for the intersection observer
   * Defines how far outside the viewport to start loading
   * @default '200px 0px' - Start loading 200px before element enters viewport
   */
  rootMargin?: string;

  /**
   * The threshold at which to trigger the intersection
   * 0 = as soon as one pixel is visible, 1 = entire element visible
   * @default 0 - Trigger as soon as element starts becoming visible
   */
  threshold?: number | number[];

  /**
   * The root element to use for intersection
   * @default null - Use the viewport
   */
  root?: Element | null;

  /**
   * Whether to disable the hook and always show the element
   * Useful for priority images or SSR
   * @default false
   */
  disabled?: boolean;
}

/**
 * Hook result returned by useOptimizedLazyLoading
 */
export interface OptimizedLazyLoadingResult {
  /**
   * Ref to attach to the target element being observed
   */
  targetRef: RefObject<HTMLElement>;

  /**
   * Whether the target element is currently intersecting
   */
  isIntersecting: boolean;

  /**
   * Whether the element has ever been intersected
   * Useful for implementing "load once" behavior
   */
  hasIntersected: boolean;
}

/**
 * Custom hook for optimized lazy loading with configurable rootMargin
 * 
 * This hook uses the Intersection Observer API to determine when an element
 * is about to enter the viewport, allowing for preloading before the element
 * is actually visible.
 * 
 * @param options Configuration options for the intersection observer
 * @returns Object containing ref to attach to target element and intersection state
 * 
 * @example
 * ```tsx
 * const { targetRef, isIntersecting } = useOptimizedLazyLoading({
 *   rootMargin: '300px 0px', // Start loading 300px before element enters viewport
 * });
 * 
 * return (
 *   <div ref={targetRef}>
 *     {isIntersecting && <YourContent />}
 *   </div>
 * );
 * ```
 */
export function useOptimizedLazyLoading({
  rootMargin = '200px 0px',
  threshold = 0,
  root = null,
  disabled = false,
}: OptimizedLazyLoadingOptions = {}): OptimizedLazyLoadingResult {
  const [isIntersecting, setIsIntersecting] = useState<boolean>(disabled);
  const [hasIntersected, setHasIntersected] = useState<boolean>(disabled);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If disabled, always consider as intersecting
    if (disabled) {
      setIsIntersecting(true);
      setHasIntersected(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update state based on intersection
        setIsIntersecting(entry.isIntersecting);
        
        // Once intersected, always set hasIntersected to true
        if (entry.isIntersecting) {
          setHasIntersected(true);
        }
      },
      { rootMargin, threshold, root }
    );

    const currentTarget = targetRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    // Cleanup function to unobserve on unmount
    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [rootMargin, threshold, root, disabled]);

  return { targetRef, isIntersecting, hasIntersected };
} 