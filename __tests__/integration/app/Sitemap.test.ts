import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/sanity/lib/client', () => ({ sanityFetch: vi.fn() }));
vi.mock('@/lib/data/projects', () => ({ mergeLocalAndSanityProjects: (projects: unknown[]) => projects }));
vi.mock('@/lib/utils/project', () => ({ convertSanityProject: (project: { _id: string }) => ({ id: project._id }) }));

import { sanityFetch } from '@/sanity/lib/client';

const sanityFetchMock = vi.mocked(sanityFetch);

beforeEach(() => {
  sanityFetchMock.mockResolvedValue([]);
});

describe('sitemap profile surface', () => {
  it('keeps Home and Projects while excluding legacy About URLs and fragments', async () => {
    const { default: sitemap } = await import('@/app/sitemap');
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain('https://javierzader.com');
    expect(urls).toContain('https://javierzader.com/proyectos');
    expect(urls.some((url) => url.includes('sobre-mi'))).toBe(false);
    expect(urls.some((url) => url.includes('#'))).toBe(false);
  });

  it('declares Spanish and English alternates for the blog listing and posts', async () => {
    sanityFetchMock
      .mockResolvedValueOnce([
        {
          slug: { current: 'typed-metadata' },
          publishedAt: '2026-01-01T00:00:00.000Z',
        },
      ])
      .mockResolvedValueOnce([]);

    const { default: sitemap } = await import('@/app/sitemap');
    const entries = await sitemap();
    const blogListing = entries.find((entry) => entry.url === 'https://javierzader.com/blog');
    const blogPost = entries.find(
      (entry) => entry.url === 'https://javierzader.com/blog/typed-metadata'
    );

    expect(blogListing?.alternates).toEqual({
      languages: {
        es: 'https://javierzader.com/blog',
        en: 'https://javierzader.com/en/blog',
      },
    });
    expect(blogPost?.alternates).toEqual({
      languages: {
        es: 'https://javierzader.com/blog/typed-metadata',
        en: 'https://javierzader.com/en/blog/typed-metadata',
      },
    });
  });
});
