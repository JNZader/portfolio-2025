import { type NextRequest, NextResponse } from 'next/server';

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

    // Log metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Web Vital:', {
        name: metricName,
        value: metricValue,
        rating: data.rating,
        delta: data.delta,
      });
    }

    // In production, send to analytics service
    // Examples:
    // - Vercel Analytics: await sendToVercel(metric)
    // - Google Analytics 4: gtag('event', metric.name, { value: metric.value })
    // - Custom analytics: await fetch('your-analytics-endpoint', { ... })

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Analytics] Error processing metric:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}

// Support OPTIONS for CORS if needed
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
