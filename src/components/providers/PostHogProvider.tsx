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
    // Initialize PostHog on first mount (following official PostHog docs)
    if (typeof window !== 'undefined' && !posthog.__loaded && POSTHOG_KEY) {
      console.log('[PostHog] Initializing with key:', POSTHOG_KEY.substring(0, 10) + '...');

      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        person_profiles: 'always',
        capture_pageview: false,
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
