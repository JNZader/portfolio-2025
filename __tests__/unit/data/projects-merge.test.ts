import { describe, expect, it } from 'vitest';
import { mergeLocalAndSanityProjects } from '@/lib/data/projects';

// biome-ignore lint/suspicious/noExplicitAny: test fixtures mimic Sanity shape loosely
function remote(slug: string, overrides: Record<string, unknown> = {}): any {
  return {
    _id: `remote-${slug}`,
    _updatedAt: '2026-01-01T00:00:00Z',
    title: `${slug} (Sanity title)`,
    slug: { current: slug },
    excerpt: 'sanity excerpt',
    technologies: ['Java'],
    publishedAt: '2026-01-01',
    body: [
      {
        _type: 'block',
        _key: 'r',
        markDefs: [],
        style: 'normal',
        children: [{ _type: 'span', _key: 's', text: 'sanity body', marks: [] }],
      },
    ],
    ...overrides,
  };
}

describe('mergeLocalAndSanityProjects (hybrid)', () => {
  it('keeps Sanity-managed fields but uses the local body for shared projects', () => {
    const merged = mergeLocalAndSanityProjects([remote('apigen', { excerpt: 'sanity excerpt' })]);
    const apigen = merged.find((p) => p.slug.current === 'apigen');

    expect(apigen).toBeDefined();
    // Sanity field preserved (not discarded)
    expect(apigen?.title).toBe('apigen (Sanity title)');
    expect(apigen?.excerpt).toBe('sanity excerpt');
    // Local body wins — it carries the curated case study + diagrams
    const firstText = (apigen?.body?.[0] as { children?: Array<{ text?: string }> })?.children?.[0]
      ?.text;
    expect(firstText).not.toBe('sanity body');
    // ...and that local body includes the Mermaid architecture diagrams
    const hasMermaid = apigen?.body?.some(
      (b) => (b as { _type?: string })._type === 'mermaid'
    );
    expect(hasMermaid).toBe(true);
  });

  it('leaves Sanity-only projects completely untouched', () => {
    const merged = mergeLocalAndSanityProjects([remote('sanity-only-xyz')]);
    const found = merged.find((p) => p.slug.current === 'sanity-only-xyz');

    expect(found?.title).toBe('sanity-only-xyz (Sanity title)');
    const text = (found?.body?.[0] as { children?: Array<{ text?: string }> })?.children?.[0]?.text;
    expect(text).toBe('sanity body');
  });

  it('still includes local-only projects when Sanity returns nothing', () => {
    const merged = mergeLocalAndSanityProjects([]);
    expect(merged.find((p) => p.slug.current === 'apigen')).toBeDefined();
  });
});
