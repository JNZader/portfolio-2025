import Cookies from 'js-cookie';
import '@/lib/analytics/types';

const CONSENT_COOKIE = 'cookie-consent';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

/**
 * Check if user has given analytics consent
 */
export function hasAnalyticsConsent(): boolean {
  const consent = Cookies.get(CONSENT_COOKIE);

  if (!consent) return false;

  try {
    const preferences: CookiePreferences = JSON.parse(consent);
    return preferences.analytics;
  } catch {
    return false;
  }
}

/**
 * Update Google Analytics consent mode
 */
export function updateGAConsent(analytics: boolean) {
  if (typeof globalThis !== 'undefined' && globalThis.gtag) {
    globalThis.gtag('consent', 'update', {
      analytics_storage: analytics ? 'granted' : 'denied',
    });
  }
}

/**
 * Set default Google Analytics consent (called on page load)
 */
export function setDefaultGAConsent() {
  if (typeof globalThis !== 'undefined' && globalThis.gtag) {
    globalThis.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      wait_for_update: 500,
    });
  }
}
