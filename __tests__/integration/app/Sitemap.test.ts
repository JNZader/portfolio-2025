import { describe, expect, it, vi } from 'vitest';

vi.mock('@/sanity/lib/client', () => ({ sanityFetch: vi.fn().mockResolvedValue([]) }));
vi.mock('@/lib/data/projects', () => ({ mergeLocalAndSanityProjects: (projects: unknown[]) => projects }));
vi.mock('@/lib/utils/project', () => ({ convertSanityProject: (project: { _id: string }) => ({ id: project._id }) }));

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
});
