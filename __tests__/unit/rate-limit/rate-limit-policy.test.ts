import { describe, expect, it } from 'vitest';
import { resolveRateLimitBucket } from '@/lib/rate-limit/policy';

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
