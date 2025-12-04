import '@/lib/analytics/types';
import { logger } from '@/lib/monitoring/logger';

/**
 * Track custom event
 */
export function trackEvent(
  eventName: string,
  eventParams?: {
    category?: string;
    label?: string;
    value?: number;
    [key: string]: unknown;
  }
) {
  // Vercel Analytics
  if (typeof window !== 'undefined' && window.va) {
    window.va('track', eventName, eventParams);
  }

  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: eventParams?.category,
      event_label: eventParams?.label,
      value: eventParams?.value,
      ...eventParams,
    });
  }

  // Development logging
  logger.debug('Event tracked', {
    service: 'analytics',
    eventName,
    ...eventParams,
  });
}

/**
 * Track newsletter signup
 */
export function trackNewsletterSignup(_email: string) {
  trackEvent('newsletter_signup', {
    category: 'engagement',
    label: 'newsletter',
  });
}

/**
 * Track contact form submission
 */
export function trackContactSubmit() {
  trackEvent('contact_submit', {
    category: 'conversion',
    label: 'contact_form',
  });
}

/**
 * Track blog post view
 */
export function trackBlogPostView(slug: string, title: string) {
  trackEvent('blog_post_view', {
    category: 'content',
    label: slug,
    post_title: title,
  });
}

/**
 * Track download (CV, resources, etc.)
 */
export function trackDownload(fileName: string) {
  trackEvent('download', {
    category: 'engagement',
    label: fileName,
  });
}

/**
 * Track external link click
 */
export function trackExternalLink(url: string, label?: string) {
  trackEvent('external_link', {
    category: 'outbound',
    label: label || url,
    url,
  });
}

/**
 * Track search
 */
export function trackSearch(query: string, results: number) {
  trackEvent('search', {
    category: 'engagement',
    label: query,
    search_term: query,
    results_count: results,
  });
}
