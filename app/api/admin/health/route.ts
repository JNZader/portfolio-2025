import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { resend } from '@/lib/email/resend';
import { logger } from '@/lib/monitoring/logger';
import packageJson from '@/package.json';

// Cache control header for health responses
const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
};

// Helper: Check database connection
async function checkDatabaseHealth(): Promise<string> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return 'ok';
  } catch (dbError) {
    logger.error('Health check: Database connection failed', dbError as Error);
    return 'error';
  }
}

// Helper: Check email service availability
function checkEmailHealth(): string {
  try {
    if (process.env.RESEND_API_KEY && resend) {
      return 'ok';
    }
    return 'not_configured';
  } catch (emailError) {
    logger.error('Health check: Email service check failed', emailError as Error);
    return 'error';
  }
}

// Helper: Check environment configuration
function checkEnvConfig(): string {
  const envChecks = {
    sentry: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
    resend: !!process.env.RESEND_API_KEY,
    database: !!process.env.DATABASE_URL,
    github_oauth: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
  };
  return Object.values(envChecks).every(Boolean) ? 'ok' : 'partial';
}

// Helper: Build health response object
function buildHealthResponse(services: Record<string, string>, duration: number) {
  const isHealthy = services.database === 'ok' && services.email === 'ok';

  if (!isHealthy) {
    logger.warn('Health check: System degraded', { services });
  }

  return {
    isHealthy,
    response: {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: packageJson.version,
      environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV ?? 'development',
      uptime: process.uptime(),
      responseTime: `${Math.round(duration)}ms`,
      services,
    },
  };
}

// Helper: Build error response
function buildErrorResponse(error: unknown, duration: number) {
  return {
    status: 'unhealthy',
    timestamp: new Date().toISOString(),
    responseTime: `${Math.round(duration)}ms`,
    error: error instanceof Error ? error.message : 'Unknown error',
  };
}

/**
 * GET /api/admin/health
 * Endpoint protegido que devuelve información detallada del sistema
 * Solo accesible por administradores autenticados
 */
export async function GET() {
  const startTime = performance.now();

  try {
    // Verificar autenticación
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Check all services
    const services: Record<string, string> = {
      database: await checkDatabaseHealth(),
      email: checkEmailHealth(),
      env_config: checkEnvConfig(),
    };

    // Build and return response
    const duration = performance.now() - startTime;
    const { isHealthy, response } = buildHealthResponse(services, duration);

    return NextResponse.json(response, {
      status: isHealthy ? 200 : 503,
      headers: NO_CACHE_HEADERS,
    });
  } catch (error) {
    logger.error('Health check: Unexpected error', error as Error);
    const duration = performance.now() - startTime;

    return NextResponse.json(buildErrorResponse(error, duration), {
      status: 503,
      headers: NO_CACHE_HEADERS,
    });
  }
}
