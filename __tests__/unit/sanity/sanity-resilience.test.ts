import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Image } from 'sanity';

/**
 * V-01 — Sanity env resilience: `sanity/env.ts` used to assert at module
 * evaluation, so any page reaching it (proyectos, blog → PostCard → image)
 * 500'd without NEXT_PUBLIC_SANITY_PROJECT_ID/DATASET. Modules must evaluate
 * without env vars and fail softly at call time.
 */
const VARS = ['NEXT_PUBLIC_SANITY_PROJECT_ID', 'NEXT_PUBLIC_SANITY_DATASET'] as const;
const source = {
  _type: 'image',
  asset: { _type: 'reference', _ref: 'image-abc123-800x600-jpg' },
} as unknown as Image;

const saved: Record<string, string | undefined> = {};
beforeEach(() => {
  for (const key of VARS) {
    saved[key] = process.env[key];
    delete process.env[key];
  }
  vi.resetModules();
});
afterEach(() => {
  for (const key of VARS) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
  vi.resetModules();
});

describe('sanity modules without env vars', () => {
  it('sanity/env evaluates without throwing and reports not configured', async () => {
    const env = await import('@/sanity/env');
    expect(env.isSanityConfigured).toBe(false);
  });

  it('sanityFetch rejects with a descriptive error instead of crashing at import', async () => {
    const { sanityFetch } = await import('@/sanity/lib/client');
    await expect(sanityFetch({ query: '*[]', tags: ['post'] })).rejects.toThrow(
      /sanity is not configured/i
    );
  });

  it('image helpers return empty strings instead of crashing', async () => {
    const { getImageUrl, getImageBlurUrl } = await import('@/sanity/lib/image');
    expect(getImageUrl(source, 800)).toBe('');
    expect(getImageBlurUrl(source)).toBe('');
  });

  it('reports configured and builds real CDN URLs when env vars are present', async () => {
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'testproject';
    process.env.NEXT_PUBLIC_SANITY_DATASET = 'test';
    vi.resetModules();

    const env = await import('@/sanity/env');
    expect(env.isSanityConfigured).toBe(true);
    const { getImageUrl } = await import('@/sanity/lib/image');
    expect(getImageUrl(source, 800)).toContain('cdn.sanity.io/images/testproject/test');
  });
});
