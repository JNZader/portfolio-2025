import '@/lib/analytics/types';
import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/monitoring/logger';

/**
 * Track error - Envía a múltiples servicios de tracking
 * @returns eventId de Sentry para user feedback
 */
export function trackError(error: Error, context?: Record<string, unknown>): string | undefined {
  // Log error
  logger.error('Error tracked', error, {
    service: 'analytics',
    ...context,
  });

  // 1. Sentry (principal para debugging con stack traces completos)
  const eventId = Sentry.captureException(error, { extra: context });

  // 2. Google Analytics (para métricas de errores)
  if (typeof globalThis !== 'undefined' && globalThis.gtag) {
    globalThis.gtag('event', 'exception', {
      description: error.message,
      fatal: false,
      ...context,
    });
  }

  // 3. Vercel Analytics (custom event para dashboard de Vercel)
  if (typeof globalThis !== 'undefined' && globalThis.va) {
    globalThis.va('track', 'error', {
      message: error.message,
      name: error.name,
      stack: error.stack?.substring(0, 500), // Limit stack trace
      ...context,
    });
  }

  return eventId;
}
