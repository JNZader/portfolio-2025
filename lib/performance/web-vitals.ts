import { type Metric, onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

/**
 * Send Web Vitals to analytics
 */
function sendToAnalytics(metric: Metric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    });
  }

  // Send to analytics service (Vercel, GA, etc.)
  const body = JSON.stringify(metric);

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics', body);
  } else {
    fetch('/api/analytics', {
      body,
      method: 'POST',
      keepalive: true,
    }).catch((error) => {
      // Silently fail in production
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to send web vital:', error);
      }
    });
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
