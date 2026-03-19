'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

// TypeScript declarations for Google Publisher Tag (GPT)
declare global {
  interface Window {
    googletag: {
      cmd: Array<() => void>;
      defineOutOfPageSlot: (
        adUnitPath: string,
        format: number
      ) => RewardedSlot | null;
      pubads: () => PubAdsService;
      enableServices: () => void;
      display: (slot: RewardedSlot) => void;
      destroySlots: (slots: RewardedSlot[]) => boolean;
      enums: {
        OutOfPageFormat: {
          REWARDED: number;
        };
      };
    };
  }

  interface RewardedSlot {
    addService: (service: PubAdsService) => RewardedSlot;
  }

  interface PubAdsService {
    addEventListener: (
      eventType: string,
      listener: (event: RewardedAdEvent) => void
    ) => void;
    removeEventListener: (
      eventType: string,
      listener: (event: RewardedAdEvent) => void
    ) => void;
  }

  interface RewardedAdEvent {
    slot: RewardedSlot;
    makeRewardedVisible?: () => void;
    payload?: {
      amount: number;
      type: string;
    };
  }
}

interface UseRewardedAdOptions {
  adUnitPath: string; // e.g., '/22712188410/rewarded_download'
  onRewardGranted?: () => void;
  onAdClosed?: () => void;
}

interface UseRewardedAdReturn {
  showAd: () => void;
  isAdReady: boolean;
  isAdShowing: boolean;
  rewardGranted: boolean;
  error: string | null;
}

/**
 * React hook for managing Google Ad Manager rewarded ads
 * Based on official Google Publisher Tag (GPT) documentation
 * @see https://developers.google.com/publisher-tag/samples/display-rewarded-ad
 */
export function useRewardedAd({
  adUnitPath,
  onRewardGranted,
  onAdClosed,
}: UseRewardedAdOptions): UseRewardedAdReturn {
  const [isAdReady, setIsAdReady] = useState(false);
  const [isAdShowing, setIsAdShowing] = useState(false);
  const [rewardGranted, setRewardGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rewardedSlotRef = useRef<RewardedSlot | null>(null);
  const makeVisibleCallbackRef = useRef<(() => void) | null>(null);

  // Event listeners refs for proper cleanup
  const readyListenerRef = useRef<((event: RewardedAdEvent) => void) | null>(null);
  const grantedListenerRef = useRef<((event: RewardedAdEvent) => void) | null>(null);
  const closedListenerRef = useRef<((event: RewardedAdEvent) => void) | null>(null);

  useEffect(() => {
    // Ensure GPT is loaded
    window.googletag = window.googletag || { cmd: [] };

    let timeoutId: NodeJS.Timeout;

    window.googletag.cmd.push(() => {
      try {
        // Define rewarded ad slot
        const slot = window.googletag.defineOutOfPageSlot(
          adUnitPath,
          window.googletag.enums.OutOfPageFormat.REWARDED
        );

        if (!slot) {
          setError('Failed to create rewarded ad slot');
          return;
        }

        slot.addService(window.googletag.pubads());
        rewardedSlotRef.current = slot;

        // Event: Ad is ready to be shown
        const readyListener = (event: RewardedAdEvent) => {
          if (event.slot === slot) {
            setIsAdReady(true);
            // Store the makeRewardedVisible function
            if (event.makeRewardedVisible) {
              makeVisibleCallbackRef.current = event.makeRewardedVisible;
            }
          }
        };
        readyListenerRef.current = readyListener;
        window.googletag.pubads().addEventListener('rewardedSlotReady', readyListener);

        // Event: Reward granted after user watches ad
        const grantedListener = (event: RewardedAdEvent) => {
          if (event.slot === slot) {
            setRewardGranted(true);
            setIsAdShowing(false);

            // Log reward details
            if (event.payload) {
              console.log('[RewardedAd] Reward granted:', event.payload);
            }

            // Call user callback
            onRewardGranted?.();
          }
        };
        grantedListenerRef.current = grantedListener;
        window.googletag.pubads().addEventListener('rewardedSlotGranted', grantedListener);

        // Event: Ad closed by user
        const closedListener = (event: RewardedAdEvent) => {
          if (event.slot === slot) {
            setIsAdShowing(false);

            // Clean up slot
            if (rewardedSlotRef.current) {
              window.googletag.destroySlots([rewardedSlotRef.current]);
              rewardedSlotRef.current = null;
            }

            onAdClosed?.();
          }
        };
        closedListenerRef.current = closedListener;
        window.googletag.pubads().addEventListener('rewardedSlotClosed', closedListener);

        // Enable services and display
        window.googletag.enableServices();
        window.googletag.display(slot);

        // Timeout: If ad doesn't load within 5 seconds, show error
        timeoutId = setTimeout(() => {
          if (!isAdReady) {
            setError('Ad failed to load in time');
          }
        }, 5000);
      } catch (err) {
        console.error('[RewardedAd] Error initializing:', err);
        setError('Failed to initialize rewarded ad');
      }
    });

    // Cleanup
    return () => {
      clearTimeout(timeoutId);

      if (typeof window !== 'undefined' && window.googletag && window.googletag.pubads) {
        const pubads = window.googletag.pubads();

        if (readyListenerRef.current) {
          pubads.removeEventListener('rewardedSlotReady', readyListenerRef.current);
        }
        if (grantedListenerRef.current) {
          pubads.removeEventListener('rewardedSlotGranted', grantedListenerRef.current);
        }
        if (closedListenerRef.current) {
          pubads.removeEventListener('rewardedSlotClosed', closedListenerRef.current);
        }

        if (rewardedSlotRef.current) {
          window.googletag.destroySlots([rewardedSlotRef.current]);
        }
      }
    };
  }, [adUnitPath, isAdReady, onRewardGranted, onAdClosed]);

  /**
   * Show the rewarded ad
   * Call this function when user clicks download button
   */
  const showAd = useCallback(() => {
    if (!isAdReady) {
      setError('Ad is not ready yet');
      return;
    }

    if (makeVisibleCallbackRef.current) {
      setIsAdShowing(true);
      makeVisibleCallbackRef.current();
    } else {
      setError('Ad display function not available');
    }
  }, [isAdReady]);

  return {
    showAd,
    isAdReady,
    isAdShowing,
    rewardGranted,
    error,
  };
}
