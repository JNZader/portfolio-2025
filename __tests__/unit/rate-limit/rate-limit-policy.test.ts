import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BUCKET_ENV_VARS, resolveRateLimitBucket } from '@/lib/rate-limit/policy';

/**
 * Batch 6 — public rate-limit tuning.
 *
 * The proxy used to apply ONE global bucket (100 req/min/IP) to every
 * non-static request, including read-only page navigations and Next.js RSC
 * prefetches, so normal browsing could 429. The policy now scopes limiting:
 * page reads get a generous bucket (300/min/IP), API reads get a generous
 * bucket, and strict buckets are reserved for mutations (where abuse happens).
 */
describe('resolveRateLimitBucket', () => {
  it('applies a generous bucket to read-only page browsing', () => {
    expect(resolveRateLimitBucket('/blog', 'GET')).toBe('page-read');
    expect(resolveRateLimitBucket('/en/blog', 'GET')).toBe('page-read');
    expect(resolveRateLimitBucket('/proyectos', 'HEAD')).toBe('page-read');
    expect(resolveRateLimitBucket('/blog?category=tech', 'GET')).toBe('page-read');
  });

  it('keeps a bucket for page mutations (server action POSTs)', () => {
    expect(resolveRateLimitBucket('/contacto', 'POST')).toBe('page-mutation');
    expect(resolveRateLimitBucket('/en/blog', 'POST')).toBe('page-mutation');
  });

  it('applies the strict bucket to API mutations', () => {
    expect(resolveRateLimitBucket('/api/newsletter/subscribe', 'POST')).toBe('api-mutation');
    expect(resolveRateLimitBucket('/api/data-deletion', 'DELETE')).toBe('api-mutation');
    expect(resolveRateLimitBucket('/api/data-export', 'PUT')).toBe('api-mutation');
  });

  it('applies a generous read bucket to API reads', () => {
    expect(resolveRateLimitBucket('/api/health', 'GET')).toBe('api-read');
    expect(resolveRateLimitBucket('/api/resume', 'GET')).toBe('api-read');
  });
});

/**
 * Rate limit hardening — bucket limits are configurable via RATE_LIMIT_* env
 * vars with safe defaults, `RATE_LIMITS` (security-config) mirrors the policy
 * values, and the resume download limiter is 10/hour.
 */
describe('RATE_LIMIT_BUCKETS (env configurability)', () => {
  const ALL_ENV_VARS = Object.values(BUCKET_ENV_VARS);

  beforeEach(() => {
    vi.resetModules();
    for (const envVar of ALL_ENV_VARS) {
      vi.stubEnv(envVar, undefined as unknown as string);
    }
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('falls back to the safe defaults when no env vars are set', async () => {
    const { RATE_LIMIT_BUCKETS, DEFAULT_BUCKET_LIMITS } = await import('@/lib/rate-limit/policy');

    expect(RATE_LIMIT_BUCKETS).toEqual({
      'page-read': 300,
      'page-mutation': 100,
      'api-read': 120,
      'api-mutation': 60,
    });
    expect(RATE_LIMIT_BUCKETS).toEqual(DEFAULT_BUCKET_LIMITS);
  });

  it('lets env vars override the defaults', async () => {
    vi.stubEnv('RATE_LIMIT_PAGE_READ', '500');
    vi.stubEnv('RATE_LIMIT_PAGE_MUTATION', '42');
    vi.stubEnv('RATE_LIMIT_API_READ', '250');
    vi.stubEnv('RATE_LIMIT_API_MUTATION', '7');

    const { RATE_LIMIT_BUCKETS } = await import('@/lib/rate-limit/policy');

    expect(RATE_LIMIT_BUCKETS['page-read']).toBe(500);
    expect(RATE_LIMIT_BUCKETS['page-mutation']).toBe(42);
    expect(RATE_LIMIT_BUCKETS['api-read']).toBe(250);
    expect(RATE_LIMIT_BUCKETS['api-mutation']).toBe(7);
  });

  it('falls back to defaults on invalid env values', async () => {
    vi.stubEnv('RATE_LIMIT_PAGE_READ', 'not-a-number');
    vi.stubEnv('RATE_LIMIT_PAGE_MUTATION', '');
    vi.stubEnv('RATE_LIMIT_API_READ', '-10');
    vi.stubEnv('RATE_LIMIT_API_MUTATION', '0');

    const { RATE_LIMIT_BUCKETS, DEFAULT_BUCKET_LIMITS } = await import('@/lib/rate-limit/policy');

    expect(RATE_LIMIT_BUCKETS).toEqual(DEFAULT_BUCKET_LIMITS);
  });

  it('keeps env overrides for valid buckets while invalid ones fall back', async () => {
    vi.stubEnv('RATE_LIMIT_PAGE_READ', '600');
    vi.stubEnv('RATE_LIMIT_API_MUTATION', 'bogus');

    const { RATE_LIMIT_BUCKETS } = await import('@/lib/rate-limit/policy');

    expect(RATE_LIMIT_BUCKETS['page-read']).toBe(600);
    expect(RATE_LIMIT_BUCKETS['api-mutation']).toBe(60);
  });
});

describe('RATE_LIMITS (security-config) sync with policy buckets', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('mirrors the effective proxy bucket values', async () => {
    const { RATE_LIMIT_BUCKETS } = await import('@/lib/rate-limit/policy');
    const { RATE_LIMITS } = await import('@/lib/security/security-config');

    expect(RATE_LIMITS.pageRead.max).toBe(RATE_LIMIT_BUCKETS['page-read']);
    expect(RATE_LIMITS.pageMutation.max).toBe(RATE_LIMIT_BUCKETS['page-mutation']);
    expect(RATE_LIMITS.apiRead.max).toBe(RATE_LIMIT_BUCKETS['api-read']);
    expect(RATE_LIMITS.apiMutation.max).toBe(RATE_LIMIT_BUCKETS['api-mutation']);
    expect(RATE_LIMITS.pageRead.window).toBe('1m');
    expect(RATE_LIMITS.pageMutation.window).toBe('1m');
    expect(RATE_LIMITS.apiRead.window).toBe('1m');
    expect(RATE_LIMITS.apiMutation.window).toBe('1m');
  });
});

describe('resumeRateLimiter config', () => {
  it('allows 10 downloads per hour per IP', async () => {
    const { RESUME_RATE_LIMIT } = await import('@/lib/rate-limit/redis');

    expect(RESUME_RATE_LIMIT.max).toBe(10);
    expect(RESUME_RATE_LIMIT.window).toBe('1 h');
  });
});
