/**
 * PostHog Analytics Helper
 *
 * This module provides helper functions for PostHog tracking.
 * PostHog is initialized in PostHogProvider.tsx - this module just
 * uses the already-initialized instance.
 *
 * PERFORMANCE:
 * - Uses shared PostHog instance from PostHogProvider
 * - Non-blocking, async operations
 * - No duplicate initialization
 */

import posthog from 'posthog-js';

/**
 * Get PostHog instance (already initialized by PostHogProvider)
 */
function getPostHogInstance() {
  if (typeof window === 'undefined') return null;
  if (!posthog.__loaded) {
    console.warn('[PostHog] PostHog not yet initialized. Make sure PostHogProvider is mounted.');
    return null;
  }
  return posthog;
}

/**
 * Track event to PostHog
 *
 * @param eventName - Name of the event (e.g., 'download_pdf')
 * @param properties - Event properties (metadata)
 */
export async function trackPostHogEvent(
  eventName: string,
  properties?: Record<string, any>
): Promise<void> {
  // Skip if not in browser
  if (typeof window === 'undefined') return;

  try {
    // Get already-initialized PostHog instance
    const ph = getPostHogInstance();

    if (!ph) return;

    // Track event
    ph.capture(eventName, {
      ...properties,
      // Add default properties
      $source: 'tegnogfarge.no',
      timestamp: new Date().toISOString(),
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('[PostHog] Event tracked:', eventName, properties);
    }
  } catch (error) {
    // Fail silently - don't break user experience
    console.error('[PostHog] Tracking error:', error);
  }
}

/**
 * Identify user in PostHog
 * Call this when user submits email or logs in
 */
export async function identifyPostHogUser(
  userId: string,
  properties?: Record<string, any>
): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const ph = getPostHogInstance();
    if (!ph) return;

    ph.identify(userId, properties);

    if (process.env.NODE_ENV === 'development') {
      console.log('[PostHog] User identified:', userId);
    }
  } catch (error) {
    console.error('[PostHog] Identify error:', error);
  }
}

/**
 * Reset PostHog user (call on logout)
 */
export async function resetPostHogUser(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const ph = getPostHogInstance();
    if (!ph) return;

    ph.reset();

    if (process.env.NODE_ENV === 'development') {
      console.log('[PostHog] User reset');
    }
  } catch (error) {
    console.error('[PostHog] Reset error:', error);
  }
}

/**
 * Get PostHog instance (for advanced usage)
 * Returns the already-initialized instance from PostHogProvider
 */
export async function getPostHog() {
  if (typeof window === 'undefined') return null;
  return getPostHogInstance();
}
