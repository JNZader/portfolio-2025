'use client';

import { GoogleAnalytics as GoogleAnalyticsScript } from '@next/third-parties/google';
import Cookies from 'js-cookie';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '';
const ENABLE_ANALYTICS = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';

interface CookiePreferences {
  analytics: boolean;
}

/**
 * Google Analytics component with GDPR compliance and automatic pageview tracking
 * Only loads GA if user has given consent
 */
export function GoogleAnalytics() {
  const [hasConsent, setHasConsent] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check cookie consent
    const consentCookie = Cookies.get('cookie-consent');

    if (consentCookie) {
      try {
        const preferences: CookiePreferences = JSON.parse(consentCookie);
        setHasConsent(preferences.analytics);
      } catch {
        setHasConsent(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || !hasConsent) return;

    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

    // Track pageview on route change
    if (typeof globalThis !== 'undefined' && globalThis.gtag) {
      globalThis.gtag('config', GA_MEASUREMENT_ID, {
        page_path: url,
        anonymize_ip: true,
        cookie_flags: 'SameSite=None;Secure',
      });
    }
  }, [pathname, searchParams, hasConsent]);

  // Don't load GA if:
  // - No GA ID configured
  // - Analytics disabled globally
  // - User hasn't given consent
  if (!GA_MEASUREMENT_ID || !ENABLE_ANALYTICS || !hasConsent) {
    return null;
  }

  return <GoogleAnalyticsScript gaId={GA_MEASUREMENT_ID} />;
}
