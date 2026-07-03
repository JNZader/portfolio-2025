import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/monitoring/logger';
import { createRateLimiter } from '@/lib/rate-limit/redis';
import { CSRF_ERROR_RESPONSE, verifyCsrf } from '@/lib/security/security-config';

interface WebVitalData {
  metric: string;
  value: number;
  rating?: string;
  delta?: number;
  id?: string;
  timestamp: string;
  userAgent: string | null;
}

// Rate limiter: 100 requests per minute per IP
const vitalsRateLimiter = createRateLimiter('web-vitals', 100, '1 m');

// Simple in-memory storage (en producción usar DB)
const vitalsData: WebVitalData[] = [];

/**
 * POST endpoint to receive Web Vitals data
 */
export async function POST(request: NextRequest) {
  // CSRF Protection
  if (!verifyCsrf(request)) {
    logger.warn('CSRF validation failed', {
      path: '/api/analytics/web-vitals',
      origin: request.headers.get('origin'),
    });
    return NextResponse.json(
      { message: CSRF_ERROR_RESPONSE.message },
      { status: CSRF_ERROR_RESPONSE.status }
    );
  }

  // Rate Limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
  const { success: rateLimitSuccess } = await vitalsRateLimiter.limit(ip);
  if (!rateLimitSuccess) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const data = await request.json();

    // Validate required fields
    if (!data.metric || data.value === undefined) {
      return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 });
    }

    // Store metric
    vitalsData.push({
      metric: data.metric,
      value: data.value,
      rating: data.rating,
      delta: data.delta,
      id: data.id,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
    });

    // Keep only last 1000 entries
    if (vitalsData.length > 1000) {
      vitalsData.shift();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error storing web vital', error as Error, {
      path: '/api/analytics/web-vitals',
      service: 'analytics',
    });
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}

// El GET público que agregaba stats se eliminó: exponía métricas internas
// sin auth y ningún consumidor lo usaba (el dashboard real es Sentry/GA).

// Support OPTIONS for CORS if needed
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
