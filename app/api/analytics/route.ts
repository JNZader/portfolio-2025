import { Ratelimit } from '@upstash/ratelimit';
import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/monitoring/logger';
import { redis } from '@/lib/rate-limit/redis';
import { CSRF_ERROR_RESPONSE, verifyCsrf } from '@/lib/security/security-config';

// Rate limiter: 100 requests per minute per IP
const analyticsRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  prefix: 'ratelimit:analytics',
});

/**
 * Analytics API endpoint for Web Vitals
 * Receives metrics from client and logs/forwards them
 */
export async function POST(request: NextRequest) {
  // CSRF Protection
  if (!verifyCsrf(request)) {
    logger.warn('CSRF validation failed', {
      path: '/api/analytics',
      origin: request.headers.get('origin'),
    });
    return NextResponse.json(
      { message: CSRF_ERROR_RESPONSE.message },
      { status: CSRF_ERROR_RESPONSE.status }
    );
  }

  // Rate Limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const { success: rateLimitSuccess } = await analyticsRateLimiter.limit(ip);
  if (!rateLimitSuccess) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const data = await request.json();

    // Support both formats: { name, value } and { metric, value }
    const metricName = data.name || data.metric;
    const metricValue = data.value;

    // Validate metric structure
    if (!metricName || typeof metricValue === 'undefined') {
      return NextResponse.json({ success: false, error: 'Invalid metric' }, { status: 400 });
    }

    // Log metrics
    logger.debug('Web Vital received', {
      service: 'analytics',
      name: metricName,
      value: metricValue,
      rating: data.rating,
      delta: data.delta,
    });

    // In production, send to analytics service
    // Examples:
    // - Vercel Analytics: await sendToVercel(metric)
    // - Google Analytics 4: gtag('event', metric.name, { value: metric.value })
    // - Custom analytics: await fetch('your-analytics-endpoint', { ... })

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error processing metric', error as Error, {
      path: '/api/analytics',
      service: 'analytics',
    });
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}

// Support OPTIONS for CORS if needed
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
