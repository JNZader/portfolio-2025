import * as Sentry from '@sentry/nextjs';
import { redactSensitiveData } from '@/lib/monitoring/redact';
import { logger } from '@/lib/monitoring/logger';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for finer control
  tracesSampleRate: 0.1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  integrations: [Sentry.browserTracingIntegration()],

  // Environment
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? 'development',

  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Ignore specific errors
  ignoreErrors: [
    // Browser extensions
    /extensions\//i,
    /^Non-Error promise rejection captured/i,
    // Network errors
    'Network request failed',
    'Failed to fetch',
  ],

  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry event:', event, hint);
      return null;
    }

    return redactSensitiveData(event);
  },
});

// Lazily load Session Replay so it doesn't inflate the initial client bundle;
// it's fetched from the Sentry CDN only after the app has hydrated.
if (typeof window !== 'undefined') {
  Sentry.lazyLoadIntegration('replayIntegration')
    .then((replayIntegration) => {
      Sentry.addIntegration(
        replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        })
      );
    })
    .catch((error) => {
      // The CDN chunk fetch can fail silently (ad-blocker, flaky network,
      // offline). Without this .catch the promise rejection was unhandled —
      // Session Replay would just quietly never start, with no signal.
      logger.error('Sentry Replay lazy-load failed', error as Error);
    });
}
