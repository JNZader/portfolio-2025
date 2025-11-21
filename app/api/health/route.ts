import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { resend } from '@/lib/email/resend';
import { logger } from '@/lib/monitoring/logger';

export async function GET() {
  const startTime = performance.now();

  try {
    const services: Record<string, string> = {};

    // 1. Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      services.database = 'ok';
    } catch (dbError) {
      logger.error('Health check: Database connection failed', dbError as Error);
      services.database = 'error';
    }

    // 2. Check email service (Resend)
    try {
      // Just verify the API key is configured
      if (process.env.RESEND_API_KEY && resend) {
        services.email = 'ok';
      } else {
        services.email = 'not_configured';
      }
    } catch (emailError) {
      logger.error('Health check: Email service check failed', emailError as Error);
      services.email = 'error';
    }

    // 3. Check environment configuration
    const envChecks = {
      sentry: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
      resend: !!process.env.RESEND_API_KEY,
      database: !!process.env.DATABASE_URL,
    };
    services.env_config = Object.values(envChecks).every(Boolean) ? 'ok' : 'partial';

    // Determine overall health status
    const isHealthy = services.database === 'ok' && services.email === 'ok';
    const duration = performance.now() - startTime;

    const response = {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.20.0',
      environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      responseTime: `${Math.round(duration)}ms`,
      services,
    };

    // Log degraded health
    if (!isHealthy) {
      logger.warn('Health check: System degraded', { services });
    }

    return NextResponse.json(response, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    logger.error('Health check: Unexpected error', error as Error);

    const duration = performance.now() - startTime;

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime: `${Math.round(duration)}ms`,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  }
}
