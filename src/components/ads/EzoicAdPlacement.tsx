'use client';

import { useEffect } from 'react';

/**
 * Ezoic Ad Placement Component
 *
 * Renders an Ezoic ad placeholder and triggers ad loading.
 * Used for displaying Ezoic ads at specific locations on the site.
 *
 * Usage:
 * ```tsx
 * <EzoicAdPlacement placementId={101} />
 * ```
 *
 * To get placement IDs:
 * 1. Log into Ezoic dashboard (https://pubdash.ezoic.com/)
 * 2. Go to Ezoic Ads → Ad Placements
 * 3. Create new placements and note the IDs
 *
 * @see https://docs.ezoic.com/docs/ezoicads/implementation/
 */

interface EzoicAdPlacementProps {
  /** Placement ID from Ezoic dashboard (e.g., 101, 102, etc.) */
  placementId: number;
  /** Optional CSS class name for styling the container */
  className?: string;
}

// Extend Window interface to include Ezoic global
declare global {
  interface Window {
    ezstandalone?: {
      cmd: Array<() => void>;
      showAds: (...placementIds: number[]) => void;
    };
  }
}

export function EzoicAdPlacement({ placementId, className }: EzoicAdPlacementProps) {
  useEffect(() => {
    // Wait for Ezoic script to load
    if (typeof window !== 'undefined' && window.ezstandalone) {
      window.ezstandalone.cmd.push(function () {
        if (window.ezstandalone) {
          window.ezstandalone.showAds(placementId);
        }
      });
    }
  }, [placementId]);

  return (
    <div
      id={`ezoic-pub-ad-placeholder-${placementId}`}
      className={className}
      // Min height prevents layout shift while ad loads
      style={{ minHeight: '250px' }}
    />
  );
}
