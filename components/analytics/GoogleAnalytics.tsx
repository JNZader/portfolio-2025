'use client';

import Cookies from 'js-cookie';
import Script from 'next/script';
import { useEffect, useState } from 'react';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const ENABLE_ANALYTICS = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';

interface CookiePreferences {
  analytics: boolean;
}

/**
 * Google Analytics component with GDPR compliance
 * Only loads GA if user has given consent
 */
export function GoogleAnalytics() {
  const [hasConsent, setHasConsent] = useState(false);

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

  // Don't load GA if:
  // - No GA ID configured
  // - Analytics disabled globally
  // - User hasn't given consent
  if (!GA_MEASUREMENT_ID || !ENABLE_ANALYTICS || !hasConsent) {
    return null;
  }

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
            anonymize_ip: true,
            cookie_flags: 'SameSite=None;Secure'
          });
        `}
      </Script>
    </>
  );
}
