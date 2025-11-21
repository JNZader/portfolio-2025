import * as Sentry from '@sentry/nextjs';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  email?: string;
  path?: string;
  [key: string]: unknown;
}

class Logger {
  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console[level](`[${timestamp}] ${level.toUpperCase()}: ${message}`, context);
    }

    // Send to Sentry
    if (level === 'error') {
      Sentry.captureMessage(message, {
        level: 'error',
        extra: context,
      });
    } else if (level === 'warn') {
      Sentry.captureMessage(message, {
        level: 'warning',
        extra: context,
      });
    }

    // In production, send to logging service (Datadog, Logtail, etc.)
    if (process.env.NODE_ENV === 'production') {
      // await fetch('/api/logs', { ... })
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

    this.log('error', message, { ...context, error: error?.message });
  }
}

export const logger = new Logger();
