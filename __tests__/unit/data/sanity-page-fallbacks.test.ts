import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Category, Post, Project as SanityProject } from '@/types/sanity';

/**
 * V-01 — data-layer fallbacks (same proven pattern as /cv: dynamic import
 * inside try/catch + local fallback) for /proyectos and /blog.
 */
const mockSanityFetch = vi.fn();
vi.mock('@/sanity/lib/client', () => ({
  sanityFetch: (...args: unknown[]) => mockSanityFetch(...args),
}));

const mockLoggerError = vi.fn();
vi.mock('@/lib/monitoring/logger', () => ({
  logger: {
    error: (...args: unknown[]) => mockLoggerError(...args),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

const { getSanityProjects } = await import('@/lib/data/projects-page');
const { getBlogListing } = await import('@/lib/data/blog-page');

const cmsProject = {
  _id: 'sanity-1',
  title: 'CMS Project',
  slug: { current: 'cms-project' },
  excerpt: 'Authored in Sanity Studio',
  technologies: ['Next.js'],
  publishedAt: '2026-01-01T00:00:00Z',
} as unknown as SanityProject;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getSanityProjects (/proyectos)', () => {
  it('falls back to the local case studies when the Sanity fetch fails', async () => {
    mockSanityFetch.mockRejectedValue(
      new Error('Missing environment variable: NEXT_PUBLIC_SANITY_DATASET')
    );

    const projects = await getSanityProjects('es');

    // 3 version-controlled case studies — the page renders content, not a 500.
    expect(projects).toHaveLength(3);
    expect(projects.some((p) => p.title === 'APiGen')).toBe(true);
    expect(mockLoggerError).toHaveBeenCalled();
  });

  it('merges Sanity projects with the local case studies when the fetch succeeds', async () => {
    mockSanityFetch.mockResolvedValue([cmsProject]);

    const projects = await getSanityProjects('es');

    expect(projects).toHaveLength(4);
    expect(projects.some((p) => p.title === 'CMS Project')).toBe(true);
    expect(projects.some((p) => p.title === 'APiGen')).toBe(true);
    expect(mockLoggerError).not.toHaveBeenCalled();
  });
});

describe('getBlogListing (/blog)', () => {
  it('returns an empty listing when the Sanity fetch fails', async () => {
    mockSanityFetch.mockRejectedValue(
      new Error('Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID')
    );

    const listing = await getBlogListing({ start: 0, end: 8, category: null, search: null });

    expect(listing).toEqual({ categories: [], posts: [], total: 0 });
    expect(mockLoggerError).toHaveBeenCalled();
  });

  it('returns categories and paginated posts when Sanity succeeds', async () => {
    const category = { _id: 'c1', title: 'Tech', slug: { current: 'tech' } } as unknown as Category;
    mockSanityFetch
      .mockResolvedValueOnce([category])
      .mockResolvedValueOnce({ posts: [{ _id: 'p1', title: 'Post 1' } as unknown as Post], total: 1 });

    const listing = await getBlogListing({ start: 0, end: 8, category: 'tech', search: 'react' });

    expect(listing.categories).toHaveLength(1);
    expect(listing.posts).toHaveLength(1);
    expect(listing.total).toBe(1);
    expect(mockLoggerError).not.toHaveBeenCalled();
  });
});
