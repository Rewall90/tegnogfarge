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

const SAFETY_TIMEOUT_MS = 15_000;

export function triggerRewardedDownload(url: string): void {
  // No advertising consent — skip ad entirely
  if (!cookieManager.hasConsent('advertising')) {
    window.open(url, '_blank');
    return;
  }

  // Ezoic rewarded ads API not available — skip
  if (!window.ezRewardedAds?.cmd) {
    window.open(url, '_blank');
    return;
  }

  const t = rewardedAdTranslations[getLocale()];
  let downloaded = false;

  const doDownload = () => {
    if (downloaded) return;
    downloaded = true;
    window.open(url, '_blank');
  };

  // Safety timeout — if callback never fires, download anyway
  const timeout = setTimeout(doDownload, SAFETY_TIMEOUT_MS);

  const wrappedDownload = () => {
    clearTimeout(timeout);
    doDownload();
  };

  window.ezRewardedAds.cmd.push(() => {
    window.ezRewardedAds!.requestWithOverlay({
      header: t.header,
      body: t.body,
      acceptButtonText: t.accept,
      cancelButtonText: t.cancel,
      rewardOnNoFill: true,
      alwaysCallback: true,
      rewardCallback: wrappedDownload,
      cancelCallback: wrappedDownload,
    });
  });
}
