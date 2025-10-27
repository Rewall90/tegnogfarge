/**
 * PostHog Analytics - Lazy Loaded
 *
 * This module provides lazy-loaded PostHog tracking to minimize performance impact.
 * PostHog is only loaded when the first event is tracked.
 *
 * PERFORMANCE:
 * - Zero impact on initial page load
 * - Lazy loaded on first user interaction
 * - Non-blocking, async operations
 */

import type posthog from 'posthog-js';

// Lazy-loaded PostHog instance
let _posthog: typeof posthog | null = null;
let _isLoading = false;
let _loadingPromise: Promise<typeof posthog> | null = null;

/**
 * Lazy load PostHog SDK
 * Only loads when first event is tracked
 */
async function loadPostHog(): Promise<typeof posthog> {
  // Return cached instance if already loaded
  if (_posthog) return _posthog;

  // Return existing loading promise if already loading
  if (_isLoading && _loadingPromise) return _loadingPromise;

  // Start loading
  _isLoading = true;
  _loadingPromise = (async () => {
    try {
      // Dynamic import - only loads when needed
      const { default: ph } = await import('posthog-js');

      // Initialize PostHog
      const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
      const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

      if (!apiKey) {
        console.warn('[PostHog] API key not found. Set NEXT_PUBLIC_POSTHOG_KEY in .env');
        return ph; // Return uninitialized to prevent errors
      }

      ph.init(apiKey, {
        api_host: apiHost,
        autocapture: false, // We track manually for consistency with GA4
        capture_pageview: false, // We handle pageviews manually
        disable_session_recording: false, // Enable session replay
        session_recording: {
          maskAllInputs: false,
          maskTextSelector: '.ph-no-capture', // Mask elements with this class
        },
        // IMPORTANT: Track ALL users (anonymous + identified)
        person_profiles: 'always', // Default is 'identified_only' which drops anonymous events!
        persistence: 'localStorage+cookie',
        loaded: (posthog) => {
          // CRITICAL FIX: Identify anonymous users so events are tracked
          // (PostHog project is set to "identified users only")
          if (!posthog.get_property('$identified')) {
            const anonymousId = posthog.get_distinct_id();
            posthog.identify(anonymousId);
            console.log('[PostHog] Anonymous user identified:', anonymousId);
          }

          if (process.env.NODE_ENV === 'development') {
            console.log('[PostHog] ✅ Loaded and initialized');
            console.log('[PostHog] Config:', posthog.config);
            // Enable debug mode in development
            posthog.debug();
            // Expose to window for debugging
            (window as any).posthog = posthog;
          }
        },
      });

      _posthog = ph;
      _isLoading = false;

      console.log('[PostHog] SDK loaded successfully');
      return ph;
    } catch (error) {
      console.error('[PostHog] Failed to load SDK:', error);
      _isLoading = false;
      throw error;
    }
  })();

  return _loadingPromise;
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

  // Skip in development if you want (optional)
  // if (process.env.NODE_ENV === 'development') return;

  try {
    // Load PostHog (lazy)
    const ph = await loadPostHog();

    // Track event
    if (ph && ph.capture) {
      ph.capture(eventName, {
        ...properties,
        // Add default properties
        $source: 'tegnogfarge.no',
        timestamp: new Date().toISOString(),
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('[PostHog] Event tracked:', eventName, properties);
      }
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
    const ph = await loadPostHog();

    if (ph && ph.identify) {
      ph.identify(userId, properties);

      if (process.env.NODE_ENV === 'development') {
        console.log('[PostHog] User identified:', userId);
      }
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
    const ph = await loadPostHog();

    if (ph && ph.reset) {
      ph.reset();

      if (process.env.NODE_ENV === 'development') {
        console.log('[PostHog] User reset');
      }
    }
  } catch (error) {
    console.error('[PostHog] Reset error:', error);
  }
}

/**
 * Get PostHog instance (for advanced usage)
 * WARNING: This will load PostHog if not already loaded
 */
export async function getPostHog(): Promise<typeof posthog | null> {
  if (typeof window === 'undefined') return null;

  try {
    return await loadPostHog();
  } catch (error) {
    console.error('[PostHog] Failed to get instance:', error);
    return null;
  }
}
