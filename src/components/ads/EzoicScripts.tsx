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

      {/* Ezoic Rewarded Ads: Pre-fetch + Custom Overlay + show() for instant ad display */}
      <Script
        id="ezoic-rewarded-download-interceptor"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var adPreloaded = false;
              var adRequesting = false;
              var pdfDownloadPending = false;

              // Pre-fetch a rewarded ad in the background
              function prefetchAd() {
                if (adPreloaded || adRequesting) return;
                if (!window.ezRewardedAds || !window.ezRewardedAds.ready) return;
                if (typeof window.ezRewardedAds.request !== 'function') return;

                adRequesting = true;
                try {
                  window.ezRewardedAds.request(function(result) {
                    adRequesting = false;
                    adPreloaded = !!(result && result.status);
                  });
                } catch(e) {
                  adRequesting = false;
                }
              }

              // Poll for ezRewardedAds.ready then pre-fetch
              function waitAndPrefetch() {
                if (window.ezRewardedAds && window.ezRewardedAds.ready) {
                  prefetchAd();
                } else {
                  var attempts = 0;
                  var iv = setInterval(function() {
                    attempts++;
                    if (window.ezRewardedAds && window.ezRewardedAds.ready) {
                      clearInterval(iv);
                      prefetchAd();
                    } else if (attempts > 60) {
                      clearInterval(iv);
                    }
                  }, 500);
                }
              }
              waitAndPrefetch();

              // Re-prefetch on SPA navigation
              window.addEventListener('ezRewardedAdsPrefetch', function() {
                adPreloaded = false;
                adRequesting = false;
                setTimeout(prefetchAd, 1000);
              });

              // Custom overlay element
              function createOverlay(pdfUrl) {
                var overlay = document.createElement('div');
                overlay.id = 'ez-reward-overlay';
                overlay.style.cssText = 'position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);';

                var box = document.createElement('div');
                box.style.cssText = 'background:#fff;border-radius:12px;padding:32px;max-width:420px;width:90%;text-align:center;font-family:system-ui,sans-serif;box-shadow:0 8px 32px rgba(0,0,0,0.2);';

                var h = document.createElement('h2');
                h.style.cssText = 'margin:0 0 12px;font-size:20px;font-weight:700;color:#1a1a1a;';
                h.textContent = 'Se annonse for \\u00e5 laste ned!';

                var p = document.createElement('p');
                p.style.cssText = 'margin:0 0 24px;font-size:15px;color:#555;line-height:1.5;';
                p.textContent = 'For \\u00e5 laste ned fargeleggingsarket m\\u00e5 du se en kort annonse. Dette hjelper oss \\u00e5 tilby gratis innhold.';

                var btnRow = document.createElement('div');
                btnRow.style.cssText = 'display:flex;gap:12px;justify-content:center;';

                var cancelBtn = document.createElement('button');
                cancelBtn.textContent = 'Avbryt';
                cancelBtn.style.cssText = 'padding:10px 24px;border:1px solid #ddd;border-radius:8px;background:#fff;color:#555;font-size:15px;cursor:pointer;font-weight:500;';

                var acceptBtn = document.createElement('button');
                acceptBtn.textContent = 'Se annonse';
                acceptBtn.style.cssText = 'padding:10px 24px;border:none;border-radius:8px;background:#22c55e;color:#fff;font-size:15px;cursor:pointer;font-weight:600;';

                btnRow.appendChild(cancelBtn);
                btnRow.appendChild(acceptBtn);
                box.appendChild(h);
                box.appendChild(p);
                box.appendChild(btnRow);
                overlay.appendChild(box);

                cancelBtn.addEventListener('click', function() {
                  overlay.remove();
                });

                overlay.addEventListener('click', function(e) {
                  if (e.target === overlay) overlay.remove();
                });

                acceptBtn.addEventListener('click', function() {
                  overlay.remove();
                  showAdAndDownload(pdfUrl);
                });

                return overlay;
              }

              function downloadPdf(url) {
                pdfDownloadPending = true;
                try {
                  window.open(url, '_blank', 'noopener,noreferrer');
                } catch(e) {}
                setTimeout(function() { pdfDownloadPending = false; }, 1000);
              }

              function showAdAndDownload(pdfUrl) {
                // If ad is pre-loaded, use show() for instant display
                if (adPreloaded && typeof window.ezRewardedAds.show === 'function') {
                  adPreloaded = false;
                  try {
                    window.ezRewardedAds.show(function(result) {
                      if (result && result.status && result.reward) {
                        downloadPdf(pdfUrl);
                      } else if (result && result.status) {
                        downloadPdf(pdfUrl);
                      } else {
                        downloadPdf(pdfUrl);
                      }
                      // Pre-fetch next ad
                      setTimeout(prefetchAd, 2000);
                    }, { rewardName: 'PDF Download - Fargeleggingsark' });
                  } catch(e) {
                    downloadPdf(pdfUrl);
                    setTimeout(prefetchAd, 2000);
                  }
                  return;
                }

                // Fallback: ad not pre-loaded, use requestWithOverlay
                if (typeof window.ezRewardedAds.requestWithOverlay === 'function') {
                  try {
                    window.ezRewardedAds.requestWithOverlay(
                      function(result) {
                        if (result && (result.reward || result.status)) {
                          downloadPdf(pdfUrl);
                        }
                      },
                      {
                        header: "Se annonse for \\u00e5 laste ned!",
                        body: ["For \\u00e5 laste ned fargeleggingsarket m\\u00e5 du se en kort annonse.\\nDette hjelper oss \\u00e5 tilby gratis innhold."],
                        accept: "Se annonse",
                        cancel: "Avbryt"
                      },
                      { rewardName: "PDF Download - Fargeleggingsark", rewardOnNoFill: true, alwaysCallback: true }
                    );
                  } catch(e) {
                    downloadPdf(pdfUrl);
                  }
                } else {
                  downloadPdf(pdfUrl);
                }
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

                // No rewarded ads available — direct download
                if (!window.ezRewardedAds || !window.ezRewardedAds.ready) {
                  downloadPdf(pdfUrl);
                  return;
                }

                // Show custom overlay (ad is already pre-loaded in background)
                document.body.appendChild(createOverlay(pdfUrl));
              }, true);
            })();
          `,
        }}
      />
    </>
  );
}
