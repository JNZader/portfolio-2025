'use client';

import { useEffect } from 'react';
import { trackBlogPostView } from '@/lib/analytics/events';

interface BlogPostTrackerProps {
  slug: string;
  title: string;
}

/**
 * Client component to track blog post views
 * Must be used in a Server Component page
 */
export function BlogPostTracker({ slug, title }: BlogPostTrackerProps) {
  useEffect(() => {
    trackBlogPostView(slug, title);
  }, [slug, title]);

  return null;
}
