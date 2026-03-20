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
        ez.showAds(118);
      }
      if (typeof ez.initRewardedAds === 'function') {
        ez.initRewardedAds();
      }
    });
  }, [pathname]);

  return (
    <>
      {/* Ezoic Standalone Initialization - MUST BE FIRST (as high as possible in head) */}
      <Script
        id="ezoic-standalone-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            console.log('[Ezoic Init] Starting initialization (beforeInteractive)...');
            window.ezstandalone = window.ezstandalone || {};
            ezstandalone.cmd = ezstandalone.cmd || [];
            window.ezRewardedAds = window.ezRewardedAds || {};
            window.ezRewardedAds.cmd = window.ezRewardedAds.cmd || [];
            console.log('[Ezoic Init] Objects created, ezstandalone type:', typeof window.ezstandalone);
            ezstandalone.cmd.push(function () {
              console.log('[Ezoic Init] ✓ CMD callback executing!');
              console.log('[Ezoic Init] Calling setIsSinglePageApplication(true)');
              ezstandalone.setIsSinglePageApplication(true);
              console.log('[Ezoic Init] Calling showAds(118)');
              ezstandalone.showAds(118);
              console.log('[Ezoic Init] Calling initRewardedAds()');
              ezstandalone.initRewardedAds();
              console.log('[Ezoic Init] All calls complete. ezstandalone.enabled:', window.ezstandalone.enabled);
            });
            console.log('[Ezoic Init] CMD pushed to queue. Queue length:', ezstandalone.cmd.length);
          `,
        }}
      />

      {/* Initialize _ezconsent from stored preferences for returning users */}
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

      {/* Ezoic Gatekeeper Consent Scripts */}
      <Script
        src="https://cmp.gatekeeperconsent.com/min.js"
        data-cfasync="false"
        strategy="beforeInteractive"
      />
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

      {/* Ezoic Header Script */}
      <Script
        async
        src="//www.ezojs.com/ezoic/sa.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('[Ezoic] sa.min.js loaded, initializing...');
        }}
      />

      {/* Ezoic Analytics Script */}
      <Script
        src="//ezoicanalytics.com/analytics.js"
        strategy="afterInteractive"
      />

      {/* Ezoic Rewarded Ads: Matches Ezoic AI-generated pattern */}
      <Script
        id="ezoic-rewarded-download-interceptor"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var L = '[EzReward]';
              var downloadButton = null;

              function findDownloadButton() {
                return document.querySelector('a[aria-label="Last ned Bilde"]');
              }

              function waitForButton(attempts, maxAttempts) {
                if (attempts >= maxAttempts) {
                  console.error(L, 'Download button not found after', maxAttempts, 'attempts');
                  return;
                }
                downloadButton = findDownloadButton();
                if (!downloadButton) {
                  setTimeout(function() {
                    waitForButton(attempts + 1, maxAttempts);
                  }, 500);
                  return;
                }
                setupRewardedAd();
              }

              function setupRewardedAd() {
                if (!downloadButton) {
                  console.error(L, 'Download button is null in setupRewardedAd');
                  return;
                }

                // Fix #1: Add data-google-interstitial attribute (Ezoic backend signal)
                downloadButton.setAttribute('data-google-interstitial', 'false');

                var originalClickHandlers = [];
                var originalHref = downloadButton.getAttribute('href');

                // Fix #3: Handler capture/restore pattern (for analytics tracking)
                function captureOriginalHandlers() {
                  if (downloadButton.onclick) {
                    originalClickHandlers.push({type: 'inline', handler: downloadButton.onclick});
                  }
                }

                function removeOriginalHandlers() {
                  downloadButton.onclick = null;
                }

                function restoreOriginalHandlers() {
                  originalClickHandlers.forEach(function(item) {
                    if (item.type === 'inline') {
                      downloadButton.onclick = item.handler;
                    }
                  });
                }

                function handleDownloadClick(e) {
                  e.preventDefault();
                  e.stopPropagation();

                  if (!window.ezRewardedAds || !window.ezRewardedAds.ready) {
                    console.warn(L, 'API not ready, allowing download');
                    window.open(originalHref, '_blank', 'noopener,noreferrer');
                    return;
                  }

                  try {
                    console.log(L, 'requestWithOverlay: calling...');
                    window.ezRewardedAds.requestWithOverlay(
                      function(result) {
                        console.log(L, 'requestWithOverlay: result:', JSON.stringify(result));
                        if (result.status && result.reward) {
                          console.log(L, 'Ad completed successfully');
                          window.open(originalHref, '_blank', 'noopener,noreferrer');
                          restoreOriginalHandlers();
                        } else {
                          console.log(L, 'User closed ad early');
                        }
                      },
                      {
                        header: "Se annonse for \\u00e5 laste ned!",
                        body: ["For \\u00e5 laste ned fargeleggingsarket m\\u00e5 du se en kort annonse.\\nDette hjelper oss \\u00e5 tilby gratis innhold."],
                        accept: "Se annonse",
                        cancel: "Avbryt"
                      },
                      {
                        rewardName: "PDF Download - Fargeleggingsark",
                        rewardOnNoFill: true
                      }
                    );
                  } catch (error) {
                    console.error(L, 'Error showing rewarded ad:', error);
                    window.open(originalHref, '_blank', 'noopener,noreferrer');
                    restoreOriginalHandlers();
                  }
                }

                captureOriginalHandlers();
                removeOriginalHandlers();
                downloadButton.addEventListener('click', handleDownloadClick, true);
                console.log(L, 'Download button protection initialized');
              }

              // Fix #4: Retry logic (20 attempts = 10 seconds)
              function initRewardedDownloadGate() {
                waitForButton(0, 20);
              }

              if (document.readyState === 'interactive' || document.readyState === 'complete') {
                initRewardedDownloadGate();
              } else {
                document.addEventListener('DOMContentLoaded', initRewardedDownloadGate);
              }

              // Fix #5: Re-initialize on SPA navigation (already handled by parent component)
              // The useEffect in EzoicScripts.tsx will call ezstandalone.initRewardedAds()
              // which should trigger this script to run again
            })();
          `,
        }}
      />
    </>
  );
}
