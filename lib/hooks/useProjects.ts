'use client';

import useSWR from 'swr';
import { client } from '@/sanity/lib/client';
import { featuredProjectsQuery, projectsQuery } from '@/sanity/lib/queries';

/**
 * Fetcher function for SWR
 */
const fetcher = async (query: string) => {
  return client.fetch(query);
};

/**
 * Custom hook for all projects with SWR caching
 *
 * Features:
 * - Client-side caching
 * - Automatic revalidation
 * - Deduplication of requests
 */
export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR(projectsQuery, fetcher, {
    revalidateOnFocus: false, // Don't revalidate when window gains focus
    revalidateOnReconnect: false, // Don't revalidate on network reconnect
    dedupingInterval: 60000, // Dedupe requests within 1 minute
    revalidateIfStale: true, // Revalidate if data is stale
    shouldRetryOnError: true, // Retry on error
    errorRetryCount: 3, // Max 3 retries
    errorRetryInterval: 5000, // 5 seconds between retries
  });

  return {
    projects: data,
    isLoading,
    isError: error,
    mutate, // For manual revalidation
  };
}

/**
 * Custom hook for featured projects
 */
export function useFeaturedProjects() {
  const { data, error, isLoading, mutate } = useSWR(featuredProjectsQuery, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

  return {
    projects: data,
    isLoading,
    isError: error,
    mutate,
  };
}
