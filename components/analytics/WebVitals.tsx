'use client';

import { useEffect } from 'react';
import { trackWebVitals } from '@/lib/performance/web-vitals';

/**
 * Web Vitals tracking component
 * Tracks CLS, INP, FCP, LCP, and TTFB
 */
export function WebVitals() {
  useEffect(() => {
    trackWebVitals();
  }, []);

  return null;
}
