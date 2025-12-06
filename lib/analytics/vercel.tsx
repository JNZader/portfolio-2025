'use client';

import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export function VercelAnalyticsProvider() {
  // Solo cargar en producción o cuando esté desplegado en Vercel
  // En desarrollo local (HTTP), los scripts HTTPS causan errores SSL
  const isProduction = process.env.NODE_ENV === 'production';
  const isVercelDeployment = process.env.NEXT_PUBLIC_VERCEL_ENV !== undefined;

  if (!isProduction && !isVercelDeployment) {
    return null;
  }

  return (
    <>
      {/* Web Analytics - Pageviews, clicks, etc. */}
      <VercelAnalytics />

      {/* Speed Insights - Core Web Vitals */}
      <SpeedInsights />
    </>
  );
}
