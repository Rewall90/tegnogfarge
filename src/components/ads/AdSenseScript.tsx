'use client';

import Script from 'next/script';

/**
 * Google AdSense Script Component
 *
 * Implements Google's official best practices:
 * - Placed in <head> section via root layout
 * - Loads asynchronously with 'afterInteractive' strategy
 * - Included on every page across the site
 * - Uses Google Consent Mode v2 (managed by cookieManager.ts)
 *
 * NOTE: Google Funding Choices must be disabled in AdSense dashboard:
 * 1. Go to https://www.google.com/adsense
 * 2. Privacy & messaging → EU consent
 * 3. Disable "Funding Choices" / "Consent Management Platform"
 * 4. Select "I have my own consent management solution"
 *
 * @see https://support.google.com/adsense/answer/9274516
 */
export function AdSenseScript() {
  return (
    <>
      {/* Block Google Funding Choices popup by intercepting FC API */}
      <Script
        id="block-funding-choices"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // Block Funding Choices by stubbing out the googlefc object
            window.googlefc = window.googlefc || {};
            window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
            window.googlefc.ccpa = window.googlefc.ccpa || {};
            window.googlefc.controlledMessagingFunction = () => {};

            // Block TCF API to prevent consent popup
            window.__tcfapi = () => {};
            window.__gpp = () => {};
          `,
        }}
      />
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2852837430993050"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    </>
  );
}
