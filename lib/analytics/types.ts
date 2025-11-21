/**
 * Global type declarations for analytics
 */

declare global {
  interface Window {
    /**
     * Vercel Analytics
     * https://vercel.com/docs/analytics
     */
    va?: (event: string, eventName: string, eventParams?: Record<string, unknown>) => void;

    /**
     * Google Analytics (gtag)
     * https://developers.google.com/analytics/devguides/collection/gtagjs
     */
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set' | 'consent',
      targetId: string | Date | 'default' | 'update',
      config?: Record<string, unknown>
    ) => void;
  }
}

export {};
