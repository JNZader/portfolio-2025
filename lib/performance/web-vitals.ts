import { type Metric, onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import '@/lib/analytics/types';
import { logger } from '@/lib/monitoring/logger';

/**
 * Send metric to analytics
 */
function sendToAnalytics(metric: Metric) {
  const { name, value, rating, delta, id } = metric;

  // Log web vital
  logger.debug('Web Vital', {
    service: 'web-vitals',
    name,
    value: Math.round(value),
    rating,
    delta: Math.round(delta),
  });

  // Send to Vercel Analytics
  if (typeof globalThis !== 'undefined' && globalThis.va) {
    globalThis.va('track', 'web-vital', {
      metric: name,
      value: Math.round(value),
      rating,
      delta: Math.round(delta),
      id,
    });
  }

  // Send to Google Analytics
  if (typeof globalThis !== 'undefined' && globalThis.gtag) {
    globalThis.gtag('event', name, {
      value: Math.round(value),
      metric_rating: rating,
      metric_delta: Math.round(delta),
      metric_id: id,
    });
  }

  // Send to custom endpoint (optional)
  if (navigator.sendBeacon) {
    const body = JSON.stringify({ metric: name, value, rating, delta, id });
    navigator.sendBeacon('/api/analytics', body);
  }
}

/**
 * Track all Web Vitals
 */
export function trackWebVitals() {
  onCLS(sendToAnalytics); // Cumulative Layout Shift
  onINP(sendToAnalytics); // Interaction to Next Paint (replaces FID)
  onFCP(sendToAnalytics); // First Contentful Paint
  onLCP(sendToAnalytics); // Largest Contentful Paint
  onTTFB(sendToAnalytics); // Time to First Byte
}
