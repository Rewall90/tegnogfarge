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
 * - Disables Google Funding Choices (we use our own Norwegian cookie banner)
 *
 * @see https://support.google.com/adsense/answer/9274516
 */
export function AdSenseScript() {
  return (
    <>
      {/* Disable AdSense's Funding Choices CMP - we handle consent ourselves */}
      <Script
        id="disable-funding-choices"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.adsbygoogle = window.adsbygoogle || [];
            window.adsbygoogle.pauseAdRequests = 1;
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
