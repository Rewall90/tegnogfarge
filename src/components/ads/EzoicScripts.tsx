'use client';

import Script from 'next/script';

/**
 * Ezoic Integration Scripts
 *
 * Implements Ezoic's JavaScript integration for dual monetization alongside AdSense.
 * Privacy scripts MUST load before header script per Ezoic requirements.
 *
 * Integration benefits:
 * - Works with AdSense via Mediation for split testing
 * - No DNS changes required
 * - Complete control over ad placements
 * - Lightweight client-side integration
 *
 * @see https://docs.ezoic.com/docs/ezoicads/integration/
 */
export function EzoicScripts() {
  return (
    <>
      {/* Privacy Scripts - MUST load FIRST per Ezoic requirements */}
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
