import { type NextRequest, NextResponse } from 'next/server';

/**
 * Analytics API endpoint for Web Vitals
 * Receives metrics from client and logs/forwards them
 */
export async function POST(request: NextRequest) {
  try {
    const metric = await request.json();

    // Validate metric structure
    if (!metric.name || typeof metric.value === 'undefined') {
      return NextResponse.json({ success: false, error: 'Invalid metric' }, { status: 400 });
    }

    // Log metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Web Vital:', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
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
