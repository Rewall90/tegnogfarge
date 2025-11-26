'use client';

import Script from 'next/script';

/**
 * Google AdSense Script Component
 *
 * Implements Google's official best practices:
 * - Placed in <head> section via root layout
 * - Loads asynchronously with 'afterInteractive' strategy
 * - Included on every page across the site
 *
 * @see https://support.google.com/adsense/answer/9274516
 */
export function AdSenseScript() {
  return (
    <Script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2852837430993050"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
