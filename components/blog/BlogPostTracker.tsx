'use client';

import { useEffect } from 'react';
import { unlockAchievement } from '@/lib/achievements';
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

    // Track posts read for achievement
    const postsRead = JSON.parse(localStorage.getItem('postsRead') || '[]');
    if (!postsRead.includes(slug)) {
      postsRead.push(slug);
      localStorage.setItem('postsRead', JSON.stringify(postsRead));

      // Unlock achievement if read 3+ posts
      if (postsRead.length >= 3) {
        unlockAchievement('blog_reader');
      }
    }
  }, [slug, title]);

  return null;
}
