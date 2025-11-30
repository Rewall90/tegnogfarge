import { CookiePreferences, CookieConsent } from './types';

const CONSENT_COOKIE_NAME = 'tegnogfarge-cookie-consent';
const CONSENT_DURATION_DAYS = 365;

export const cookieManager = {
  getPreferences(): CookiePreferences | null {
    if (typeof window === 'undefined') return null;

    // Auto-accept all cookies in development mode for easier testing
    if (process.env.NODE_ENV === 'development') {
      const devPreferences: CookiePreferences = {
        consentGiven: true,
        consentDate: new Date().toISOString(),
        categories: {
          necessary: true,
          functional: true,
          analytics: true,
          performance: true,
          advertising: true,
        },
      };
      console.log('[CookieConsent] Development mode: Auto-accepting all cookies');
      return devPreferences;
    }

    try {
      const stored = localStorage.getItem(CONSENT_COOKIE_NAME);
      if (!stored) return null;

      const preferences = JSON.parse(stored) as CookiePreferences;

      // Validate the stored data
      if (!preferences.consentDate || !preferences.categories) {
        return null;
      }

      // Check if consent is still valid (1 year)
      const consentDate = new Date(preferences.consentDate);
      const now = new Date();
      const daysSinceConsent = (now.getTime() - consentDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceConsent > CONSENT_DURATION_DAYS) {
        this.clearPreferences();
        return null;
      }

      return preferences;
    } catch (error) {
      console.error('Error reading cookie preferences:', error);
      return null;
    }
  },

  savePreferences(categories: Partial<CookieConsent>): CookiePreferences {
    const preferences: CookiePreferences = {
      consentGiven: true,
      consentDate: new Date().toISOString(),
      categories: {
        necessary: true, // Always true
        functional: categories.functional || false,
        analytics: categories.analytics || false,
        performance: categories.performance || false,
        advertising: categories.advertising || false,
      },
    };

    try {
      localStorage.setItem(CONSENT_COOKIE_NAME, JSON.stringify(preferences));

      // Trigger Google Analytics based on consent
      if (preferences.categories.analytics) {
        this.enableGoogleAnalytics();
      } else {
        this.disableGoogleAnalytics();
      }

      // Update AdSense consent (Google Consent Mode v2)
      this.updateAdSenseConsent(preferences.categories.advertising);

      // Update Ezoic consent
      this.updateEzoicConsent(preferences);

      // Dispatch event for other parts of the app
      window.dispatchEvent(new CustomEvent('cookieConsentUpdate', {
        detail: preferences
      }));
    } catch (error) {
      console.error('Error saving cookie preferences:', error);
    }

    return preferences;
  },

  clearPreferences(): void {
    try {
      localStorage.removeItem(CONSENT_COOKIE_NAME);
      this.disableGoogleAnalytics();
    } catch (error) {
      console.error('Error clearing cookie preferences:', error);
    }
  },

  hasConsent(category: keyof CookieConsent): boolean {
    const preferences = this.getPreferences();
    if (!preferences) return false;
    return preferences.categories[category];
  },

  enableGoogleAnalytics(): void {
    // Google Analytics will be loaded in layout.tsx based on consent
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
    }
  },

  disableGoogleAnalytics(): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied'
      });
    }
  },

  // Initialize consent mode for Google Analytics
  initializeGoogleConsent(): void {
    if (typeof window !== 'undefined' && window.gtag) {
      const preferences = this.getPreferences();
      const analyticsConsent = preferences?.categories.analytics ? 'granted' : 'denied';
      const adConsent = preferences?.categories.advertising ? 'granted' : 'denied';

      window.gtag('consent', 'default', {
        'analytics_storage': analyticsConsent,
        'ad_storage': adConsent,
        'ad_user_data': adConsent,
        'ad_personalization': adConsent,
        'functionality_storage': 'denied',
        'personalization_storage': 'denied',
        'security_storage': 'granted'
      });

      // Set developer ID for better analytics tracking
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        'developer_id.dMDhkNz': true
      });
    }

    // Initialize Ezoic consent if preferences exist
    if (typeof window !== 'undefined') {
      const preferences = this.getPreferences();
      if (preferences) {
        this.updateEzoicConsent(preferences);
      }
    }
  },

  // Update AdSense consent via Google Consent Mode v2
  updateAdSenseConsent(hasAdConsent: boolean): void {
    if (typeof window !== 'undefined') {
      // Update Google Consent Mode
      if (window.gtag) {
        const consentValue = hasAdConsent ? 'granted' : 'denied';

        window.gtag('consent', 'update', {
          'ad_storage': consentValue,
          'ad_user_data': consentValue,
          'ad_personalization': consentValue,
        });

        console.log(`[CookieConsent] AdSense consent updated: ${consentValue}`);
      }

      // Unpause AdSense ad requests when consent is granted
      if (window.adsbygoogle && hasAdConsent) {
        window.adsbygoogle.pauseAdRequests = 0;
        console.log('[CookieConsent] AdSense ad requests resumed');
      }
    }
  },

  // Update Ezoic consent via _ezconsent global variable
  updateEzoicConsent(preferences: CookiePreferences): void {
    if (typeof window !== 'undefined') {
      window._ezconsent = {
        consent: preferences.consentGiven,
        analytics: preferences.categories.analytics,
        advertising: preferences.categories.advertising,
        functional: preferences.categories.functional,
      };

      console.log('[CookieConsent] Ezoic consent updated:', window._ezconsent);
    }
  }
};

// Type declarations for global variables
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    _ezconsent?: {
      consent: boolean;
      analytics: boolean;
      advertising: boolean;
      functional: boolean;
    };
    adsbygoogle?: {
      pauseAdRequests?: number;
    }[];
  }
}