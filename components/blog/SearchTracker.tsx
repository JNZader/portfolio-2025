'use client';

import { useEffect } from 'react';
import { trackSearch } from '@/lib/analytics/events';

interface SearchTrackerProps {
  query: string;
  results: number;
}

/**
 * Client component to track blog search queries
 * Must be used in a Server Component page
 */
export function SearchTracker({ query, results }: SearchTrackerProps) {
  useEffect(() => {
    if (query && query.trim().length > 0) {
      trackSearch(query, results);
    }
  }, [query, results]);

  return null;
}
