import { logger } from '@/lib/monitoring/logger';
import type { Category, Post } from '@/types/sanity';

export interface BlogListingParams {
  start: number;
  end: number;
  category: string | null;
  search: string | null;
}

export interface BlogListing {
  categories: Category[];
  posts: Post[];
  total: number;
}

const EMPTY_LISTING: BlogListing = { categories: [], posts: [], total: 0 };

/**
 * Listing del blog (categorías + página de posts) con fallback a vacío.
 * Mismo patrón probado en /cv: import dinámico de Sanity DENTRO del try para
 * que, sin las env vars de Sanity, el throw caiga en el catch y la página
 * renderice su EmptyState en vez de un 500 (V-01).
 */
export async function getBlogListing({
  start,
  end,
  category,
  search,
}: BlogListingParams): Promise<BlogListing> {
  try {
    const [{ sanityFetch }, { categoriesQuery, paginatedPostsQuery }] = await Promise.all([
      import('@/sanity/lib/client'),
      import('@/sanity/lib/queries'),
    ]);
    // Categories and posts are independent queries — fetch them in parallel
    // instead of paying two sequential Sanity round-trips.
    const [categories, page] = await Promise.all([
      sanityFetch<Category[]>({
        query: categoriesQuery,
        tags: ['category'],
      }),
      sanityFetch<{ posts: Post[]; total: number }>({
        query: paginatedPostsQuery,
        params: { start, end, category, search },
        tags: ['post'],
      }),
    ]);
    return { categories, posts: page.posts, total: page.total };
  } catch (error) {
    logger.error('Failed to fetch blog listing', error as Error, {
      service: 'blog',
      path: '/blog',
    });
    return EMPTY_LISTING;
  }
}
