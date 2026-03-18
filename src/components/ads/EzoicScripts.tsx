'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function EzoicScripts() {
  const pathname = usePathname();
  const isFirstLoad = useRef(true);

  // Re-trigger Ezoic ad pipeline on SPA route changes
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    const ez = (window as any).ezstandalone;
    if (!ez || !ez.enabled) return;

    ez.cmd = ez.cmd || [];
    ez.cmd.push(function () {
      if (typeof ez.showAds === 'function') {
        ez.showAds();
      }
      if (typeof ez.initRewardedAds === 'function') {
        ez.initRewardedAds();
      }
    });

    // Trigger re-prefetch of rewarded ad for the new page
    window.dispatchEvent(new Event('ezRewardedAdsPrefetch'));
  }, [pathname]);

  return (
    <>
      {/* Initialize _ezconsent from stored preferences for returning users.
          First-time visitors: leave unset so Gatekeeper can handle consent natively.
          Setting _ezconsent to false before Gatekeeper loads causes a deadlock. */}
      <Script
        id="ezoic-consent-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var stored = localStorage.getItem('tegnogfarge-cookie-consent');
                if (stored) {
                  var prefs = JSON.parse(stored);
                  if (prefs.consentGiven) {
                    window._ezconsent = {
                      consent: true,
                      analytics: !!(prefs.categories && prefs.categories.analytics),
                      advertising: !!(prefs.categories && prefs.categories.advertising),
                      functional: !!(prefs.categories && prefs.categories.functional)
                    };
                  }
                }
              } catch(e) {}
            })();
          `,
        }}
      />

      {/* Ezoic Gatekeeper Consent Scripts - Required for rewarded ads pipeline */}
      <Script
        src="https://the.gatekeeperconsent.com/cmp.min.js"
        data-cfasync="false"
        strategy="beforeInteractive"
      />
      <Script
        async
        src="https://the.gatekeeperconsent.com/ccpa/v2/standalone.js"
        strategy="afterInteractive"
      />

      {/* Ezoic Header Script - Loads asynchronously */}
      <Script
        async
        src="//www.ezojs.com/ezoic/sa.min.js"
        strategy="afterInteractive"
      />

      {/* Ezoic Standalone Initialization + Rewarded Ads */}
      <Script
        id="ezoic-standalone-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.ezstandalone = window.ezstandalone || {};
            ezstandalone.cmd = ezstandalone.cmd || [];
            window.ezRewardedAds = window.ezRewardedAds || {};
            window.ezRewardedAds.cmd = window.ezRewardedAds.cmd || [];
            ezstandalone.cmd.push(function () {
              ezstandalone.setIsSinglePageApplication(true);
              ezstandalone.initRewardedAds();
            });
          `,
        }}
      />
    </>
  );
}
