import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/monitoring/logger';
import { createRateLimiter, getClientIdentifier } from '@/lib/rate-limit/redis';

// Rate limiter: 30 requests per minute per IP (prevent health check abuse)
const healthRateLimiter = createRateLimiter('health', 30, '1 m');

/**
 * GET /api/health
 * Endpoint público de health check con información mínima
 * Para información detallada, usar /api/admin/health (requiere autenticación)
 */
export async function GET(request: NextRequest) {
  // Rate limiting
  const clientId = getClientIdentifier(request);
  const { success } = await healthRateLimiter.limit(clientId);

  if (!success) {
    return NextResponse.json(
      { status: 'rate_limited', message: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }
  const startTime = performance.now();

  try {
    // Solo verificar conexión a base de datos (información mínima)
    let dbStatus = 'ok';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'error';
    }

    const isHealthy = dbStatus === 'ok';
    const duration = performance.now() - startTime;

    // Respuesta pública mínima - sin exponer detalles internos
    const response = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${Math.round(duration)}ms`,
    };

    if (!isHealthy) {
      logger.warn('Health check: System unhealthy');
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
