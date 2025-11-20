'use client';

import { GoogleAnalytics } from './GoogleAnalytics';

/**
 * Third-Party Scripts Manager
 * Manages all external scripts with proper loading strategies
 * and GDPR compliance
 */
export function ThirdPartyScripts() {
  return (
    <>
      {/* Google Analytics */}
      <GoogleAnalytics />

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
