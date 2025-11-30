'use client';

import Script from 'next/script';

/**
 * Ezoic Integration Scripts
 *
 * Implements Ezoic's JavaScript integration for dual monetization alongside AdSense.
 * Uses third-party CMP (our custom Norwegian cookie banner) instead of Gatekeeper.
 *
 * Integration benefits:
 * - Works with AdSense via Mediation for split testing
 * - No DNS changes required
 * - Complete control over ad placements
 * - Lightweight client-side integration
 * - Custom Norwegian cookie consent (not Ezoic's default popup)
 *
 * Consent is managed via window._ezconsent set by cookieManager.ts
 *
 * @see https://docs.ezoic.com/docs/ezoicads/integration/
 */
export function EzoicScripts() {
  return (
    <>
      {/* Ezoic Header Script - Loads asynchronously */}
      <Script
        async
        src="//www.ezojs.com/ezoic/sa.min.js"
        strategy="afterInteractive"
      />

      {/* Ezoic Standalone Initialization */}
      <Script
        id="ezoic-standalone-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.ezstandalone = window.ezstandalone || {};
            ezstandalone.cmd = ezstandalone.cmd || [];
          `,
        }}
      />
    </>
  );
}
