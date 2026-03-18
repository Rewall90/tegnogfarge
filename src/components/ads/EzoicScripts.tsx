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

      {/* Ezoic Rewarded Ads: Use requestWithOverlay() for download gate */}
      <Script
        id="ezoic-rewarded-download-interceptor"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var L = '[EzReward]';
              var pdfDownloadPending = false;

              function downloadPdf(url) {
                console.log(L, 'downloadPdf:', url.substring(0, 80) + '...');
                pdfDownloadPending = true;
                try {
                  window.open(url, '_blank', 'noopener,noreferrer');
                } catch(e) {}
                setTimeout(function() { pdfDownloadPending = false; }, 1000);
              }

              // Intercept download clicks
              document.addEventListener('click', function(event) {
                var link = event.target.closest('a[aria-label="Last ned Bilde"]');
                if (!link) return;

                event.preventDefault();
                event.stopPropagation();
                if (pdfDownloadPending) return;

                var pdfUrl = link.getAttribute('href');
                if (!pdfUrl) return;

                console.log(L, 'click: ready=' + !!(window.ezRewardedAds && window.ezRewardedAds.ready));

                // Check if SDK is ready
                if (!window.ezRewardedAds || !window.ezRewardedAds.ready) {
                  console.log(L, 'SDK not ready, direct download');
                  downloadPdf(pdfUrl);
                  return;
                }

                // Use requestWithOverlay (official built-in overlay)
                if (typeof window.ezRewardedAds.requestWithOverlay === 'function') {
                  console.log(L, 'requestWithOverlay: calling...');
                  var rwoTimedOut = false;
                  var rwoTimer = setTimeout(function() {
                    rwoTimedOut = true;
                    console.log(L, 'requestWithOverlay: TIMEOUT after 10s, downloading directly');
                    downloadPdf(pdfUrl);
                  }, 10000);
                  try {
                    window.ezRewardedAds.requestWithOverlay(
                      function(result) {
                        if (rwoTimedOut) return;
                        clearTimeout(rwoTimer);
                        console.log(L, 'requestWithOverlay: result:', JSON.stringify(result));
                        downloadPdf(pdfUrl);
                      },
                      {
                        header: "Se annonse for \\u00e5 laste ned!",
                        body: ["For \\u00e5 laste ned fargeleggingsarket m\\u00e5 du se en kort annonse.\\nDette hjelper oss \\u00e5 tilby gratis innhold."],
                        accept: "Se annonse",
                        cancel: "Avbryt"
                      },
                      {
                        rewardName: "PDF Download - Fargeleggingsark",
                        rewardOnNoFill: true,
                        alwaysCallback: true
                      }
                    );
                  } catch(e) {
                    clearTimeout(rwoTimer);
                    console.log(L, 'requestWithOverlay: error:', e.message);
                    downloadPdf(pdfUrl);
                  }
                } else {
                  console.log(L, 'no methods available, direct download');
                  downloadPdf(pdfUrl);
                }
              }, true);
            })();
          `,
        }}
      />
    </>
  );
}
