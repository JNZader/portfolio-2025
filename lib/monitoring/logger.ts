import * as Sentry from '@sentry/nextjs';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  email?: string;
  path?: string;
  requestId?: string;
  service?: string;
  action?: string;
  duration?: number;
  [key: string]: unknown;
}

/**
 * Helper to extract request ID from headers in API routes
 * Usage: const requestId = await getRequestId();
 */
export async function getRequestId(): Promise<string | null> {
  try {
    if (typeof window === 'undefined') {
      const { headers } = await import('next/headers');
      const headersList = await headers();
      return headersList.get('x-request-id') || headersList.get('x-vercel-id') || null;
    }
  } catch {
    // headers() falla en contextos donde no hay request
  }
  return null;
}

class Logger {
  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();

    const enrichedContext: LogContext = {
      ...context,
      timestamp,
      environment: process.env.NODE_ENV,
    };

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      const prefix = context?.requestId ? `[${context.requestId.slice(0, 8)}]` : '';
      console[level](
        `[${timestamp}] ${prefix} ${level.toUpperCase()}: ${message}`,
        enrichedContext
      );
    }

    // Send to Sentry
    if (level === 'error') {
      Sentry.captureMessage(message, {
        level: 'error',
        extra: enrichedContext,
      });
    } else if (level === 'warn') {
      Sentry.captureMessage(message, {
        level: 'warning',
        extra: enrichedContext,
      });
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext) {
    if (error) {
      Sentry.captureException(error, {
        extra: context,
      });
    }

    this.log('error', message, { ...context, error: error?.message, stack: error?.stack });
  }

  /**
   * Log performance metrics
   * @param name - Name of the operation being measured
   * @param duration - Duration in milliseconds
   * @param context - Additional context
   */
  performance(name: string, duration: number, context?: Omit<LogContext, 'duration'>) {
    this.info(`⚡ Performance: ${name}`, {
      ...context,
      duration,
      metric: 'performance',
      name,
    });
  }

  /**
   * Measure async operation performance
   * @param name - Name of the operation
   * @param fn - Async function to measure
   * @param context - Additional context
   */
  async measure<T>(name: string, fn: () => Promise<T>, context?: LogContext): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.performance(name, duration, { ...context, success: true });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.performance(name, duration, { ...context, success: false });
      throw error;
    }
  }
}

export const logger = new Logger();
