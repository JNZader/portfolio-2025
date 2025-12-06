'use client';

import { Suspense } from 'react';
import { GoogleAnalytics } from './GoogleAnalytics';

/**
 * Third-Party Scripts Manager
 * Manages all external scripts with proper loading strategies
 * and GDPR compliance
 */
export function ThirdPartyScripts() {
  return (
    <>
      {/* Google Analytics - wrapped in Suspense for useSearchParams */}
      <Suspense fallback={null}>
        <GoogleAnalytics />
      </Suspense>

      {/*
        Add more third-party services here:

        - Google Tag Manager
        - Microsoft Clarity
        - Hotjar
        - Intercom
        - etc.

        All should check for user consent before loading
      */}
    </>
  );
}
