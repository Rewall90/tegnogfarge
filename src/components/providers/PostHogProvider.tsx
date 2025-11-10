'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useCookieConsent } from '@/components/cookie-consent';
import { POSTHOG_KEY, POSTHOG_HOST } from '@/lib/posthog-config';

/**
 * PageView Tracker Component
 */
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { hasConsent } = useCookieConsent();

  useEffect(() => {
    // Defer PostHog initialization until after page is interactive for better performance
    const initializePostHog = () => {
      if (typeof window !== 'undefined' && !posthog.__loaded && POSTHOG_KEY) {
        console.log('[PostHog] Initializing with key:', POSTHOG_KEY.substring(0, 10) + '...');

        posthog.init(POSTHOG_KEY, {
          api_host: POSTHOG_HOST,
          person_profiles: 'always',
          capture_pageview: false,
          // Disable feature flags to prevent 401 errors
          // Feature flags require server-side authentication
          advanced_disable_feature_flags: true,
          advanced_disable_feature_flags_on_first_load: true,
          autocapture: {
            dom_event_allowlist: ['click', 'change', 'submit'],
            url_allowlist: [window.location.origin],
            element_allowlist: ['button', 'a'],
          },
          session_recording: {
            maskAllInputs: true,
            maskTextSelector: '.ph-no-capture',
          },
          loaded: (ph) => {
            console.log('[PostHog] ✅ Initialized');
            ph.debug();
            (window as any).posthog = ph;
          },
        });
      } else if (!POSTHOG_KEY && typeof window !== 'undefined') {
        console.warn('[PostHog] API key not found. Set NEXT_PUBLIC_POSTHOG_KEY in .env.local');
      }
    };

    // Defer PostHog loading until browser is idle or after 2 seconds
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(initializePostHog, { timeout: 2000 });
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(initializePostHog, 1000);
    }
  }, []);

  useEffect(() => {
    if (hasConsent('analytics') && pathname && posthog.__loaded) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      posthog.capture('$pageview', {
        $current_url: window.location.origin + url,
      });
      console.log('[PostHog] Pageview tracked:', url);
    }
  }, [pathname, searchParams, hasConsent]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <PageViewTracker />
      {children}
    </PHProvider>
  );
}
