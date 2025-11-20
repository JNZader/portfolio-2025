'use client';

import useSWR from 'swr';
import { client } from '@/sanity/lib/client';
import { postsQuery } from '@/sanity/lib/queries';
import type { Post } from '@/types/sanity';

/**
 * Fetcher function for SWR
 */
const fetcher = async (query: string) => {
  return client.fetch<Post[]>(query);
};

/**
 * Custom hook for blog posts with SWR caching
 *
 * Features:
 * - Client-side caching
 * - Automatic revalidation
 * - Deduplication of requests
 * - Optimistic UI updates
 */
export function useBlogPosts() {
  const { data, error, isLoading, mutate } = useSWR(postsQuery, fetcher, {
    revalidateOnFocus: false, // Don't revalidate when window gains focus
    revalidateOnReconnect: false, // Don't revalidate on network reconnect
    dedupingInterval: 60000, // Dedupe requests within 1 minute
    revalidateIfStale: true, // Revalidate if data is stale
    shouldRetryOnError: true, // Retry on error
    errorRetryCount: 3, // Max 3 retries
    errorRetryInterval: 5000, // 5 seconds between retries
  });

  return {
    posts: data,
    isLoading,
    isError: error,
    mutate, // For manual revalidation
  };
}

/**
 * Custom hook for featured blog posts
 */
export function useFeaturedPosts() {
  const { data, error, isLoading, mutate } = useSWR(
    '*[_type == "post" && featured == true] | order(publishedAt desc) [0...3]',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
    }
  );

  return {
    posts: data,
    isLoading,
    isError: error,
    mutate,
  };
}
