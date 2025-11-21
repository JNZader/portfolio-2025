import '@/lib/analytics/types';

/**
 * Track error
 */
export function trackError(error: Error, context?: Record<string, unknown>) {
  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error tracked:', error, context);
  }

  // Send to Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'exception', {
      description: error.message,
      fatal: false,
      ...context,
    });
  }

  // Send to Vercel Analytics (custom event)
  if (typeof window !== 'undefined' && window.va) {
    window.va('track', 'error', {
      message: error.message,
      name: error.name,
      stack: error.stack?.substring(0, 500), // Limit stack trace
      ...context,
    });
  }

  // Send to error tracking service (Sentry, etc.)
  // if (typeof window !== 'undefined' && window.Sentry) {
  //   window.Sentry.captureException(error, { extra: context });
  // }
}
