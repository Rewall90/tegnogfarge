/**
 * PostHog Configuration
 *
 * Environment variables are replaced at build time by Next.js.
 * They MUST start with NEXT_PUBLIC_ to be available in the browser.
 */

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.posthog.com';

// Validate configuration
if (typeof window === 'undefined') {
  // Server-side validation
  if (!POSTHOG_KEY) {
    console.warn('[PostHog Config] NEXT_PUBLIC_POSTHOG_KEY is not set');
  }
}
