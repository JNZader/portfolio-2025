import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/monitoring/logger';

/**
 * Analytics API endpoint for Web Vitals
 * Receives metrics from client and logs/forwards them
 */
export async function POST(request: NextRequest) {
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
