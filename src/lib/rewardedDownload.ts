import { cookieManager } from '@/components/cookie-consent/cookieManager';
import { rewardedAdTranslations } from '@/i18n/translations/rewardedAd';

type Locale = keyof typeof rewardedAdTranslations;

interface EzRewardedAds {
  cmd: Array<() => void>;
  requestWithOverlay: (config: {
    header: string;
    body: string;
    acceptButtonText: string;
    cancelButtonText: string;
    rewardOnNoFill: boolean;
    alwaysCallback: boolean;
    rewardCallback: () => void;
    cancelCallback: () => void;
  }) => void;
}

declare global {
  interface Window {
    ezRewardedAds?: EzRewardedAds;
  }
}

function getLocale(): Locale {
  if (typeof window === 'undefined') return 'no';
  const path = window.location.pathname;
  if (path.startsWith('/sv')) return 'sv';
  if (path.startsWith('/de')) return 'de';
  return 'no';
}

export function triggerRewardedDownload(url: string): void {
  // No advertising consent — skip ad entirely
  if (!cookieManager.hasConsent('advertising')) {
    window.open(url, '_blank');
    return;
  }

  // Ezoic rewarded ads API not fully loaded — download directly
  if (!window.ezRewardedAds?.requestWithOverlay) {
    window.open(url, '_blank');
    return;
  }

  const t = rewardedAdTranslations[getLocale()];

  window.ezRewardedAds.requestWithOverlay({
    header: t.header,
    body: t.body,
    acceptButtonText: t.accept,
    cancelButtonText: t.cancel,
    rewardOnNoFill: true,
    alwaysCallback: false,
    rewardCallback: () => {
      window.open(url, '_blank');
    },
    cancelCallback: () => {
      // User cancelled — no download
    },
  });
}
