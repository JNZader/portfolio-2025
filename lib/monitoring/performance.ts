import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/monitoring/logger';

/**
 * Track custom performance metric
 */
export function trackPerformance(
  name: string,
  duration: number,
  context?: Record<string, unknown>
) {
  // Send to Sentry
  const tags = context
    ? Object.fromEntries(Object.entries(context).map(([k, v]) => [k, String(v)]))
    : undefined;

  Sentry.metrics.distribution(name, duration, {
    unit: 'millisecond',
    ...(tags && { tags }),
  });

  // Log performance metric
  logger.performance(name, duration, context);
}

/**
 * Measure async operation
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<T> {
  const start = performance.now();

  try {
    const result = await fn();
    const duration = performance.now() - start;

    trackPerformance(name, duration, context);

    return result;
  } catch (error) {
    const duration = performance.now() - start;

    trackPerformance(`${name}_error`, duration, context);

    throw error;
  }
}

/**
 * Track database query performance
 */
export async function trackDatabaseQuery<T>(query: string, fn: () => Promise<T>): Promise<T> {
  return measureAsync(
    'database_query',
    fn,
    { query: query.substring(0, 100) } // Truncate query
  );
}

/**
 * Track email sending performance
 */
export async function trackEmailSend<T>(emailType: string, fn: () => Promise<T>): Promise<T> {
  return measureAsync('email_send', fn, { type: emailType });
}

/**
 * Track external API call performance
 */
export async function trackApiCall<T>(
  apiName: string,
  endpoint: string,
  fn: () => Promise<T>
): Promise<T> {
  return measureAsync('api_call', fn, { api: apiName, endpoint: endpoint.substring(0, 50) });
}
