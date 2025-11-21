import { type NextRequest, NextResponse } from 'next/server';

interface WebVitalData {
  metric: string;
  value: number;
  rating?: string;
  delta?: number;
  id?: string;
  timestamp: string;
  userAgent: string | null;
}

// Simple in-memory storage (en producción usar DB)
const vitalsData: WebVitalData[] = [];

/**
 * POST endpoint to receive Web Vitals data
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.metric || typeof data.value === 'undefined') {
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
    console.error('[Analytics] Error storing web vital:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}

/**
 * GET endpoint to retrieve analytics stats
 */
export async function GET() {
  try {
    // Calculate stats
    const stats = {
      total: vitalsData.length,
      averages: calculateAverages(vitalsData),
      last24h: vitalsData.filter(
        (v) => new Date(v.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ),
      byMetric: groupByMetric(vitalsData),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[Analytics] Error retrieving stats:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * Calculate average values per metric
 */
function calculateAverages(data: WebVitalData[]) {
  const metrics = ['LCP', 'FID', 'INP', 'CLS', 'FCP', 'TTFB'];
  const averages: Record<string, number> = {};

  for (const metric of metrics) {
    const values = data.filter((d) => d.metric === metric).map((d) => d.value);
    averages[metric] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }

  return averages;
}

/**
 * Group data by metric type
 */
function groupByMetric(data: WebVitalData[]) {
  const grouped: Record<string, WebVitalData[]> = {};

  for (const item of data) {
    if (!grouped[item.metric]) {
      grouped[item.metric] = [];
    }
    grouped[item.metric].push(item);
  }

  return grouped;
}

// Support OPTIONS for CORS if needed
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
