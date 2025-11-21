'use client';

import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export function VercelAnalyticsProvider() {
  return (
    <>
      {/* Web Analytics - Pageviews, clicks, etc. */}
      <VercelAnalytics />

      {/* Speed Insights - Core Web Vitals */}
      <SpeedInsights />
    </>
  );
}
