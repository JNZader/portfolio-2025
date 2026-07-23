import { beforeEach, describe, expect, it, vi } from 'vitest';

const redis = {
  getdel: vi.fn(),
  set: vi.fn(),
};

vi.mock('@/lib/rate-limit/redis', () => ({
  createRateLimiter: vi.fn(() => ({ limit: vi.fn() })),
  getRedisClient: () => redis,
}));
vi.mock('@/lib/db/prisma', () => ({ prisma: {} }));
vi.mock('@/lib/monitoring/logger', () => ({ logger: { warn: vi.fn() } }));

import { claimToken, getClientIp, restoreToken, storeToken } from '@/lib/api/gdpr-utils';

beforeEach(() => vi.clearAllMocks());

describe('getClientIp (GDPR audit trail)', () => {
  it('records the Vercel IP, not a spoofed x-forwarded-for first entry', () => {
    const request = new Request('http://localhost/api/data-export', {
      headers: {
        'x-forwarded-for': '1.2.3.4',
        'x-vercel-forwarded-for': '1.2.3.4, 203.0.113.10',
      },
    });

    expect(getClientIp(request as never)).toBe('203.0.113.10');
  });

  it('falls back to the LAST x-forwarded-for entry outside Vercel', () => {
    const request = new Request('http://localhost/api/data-export', {
      headers: { 'x-forwarded-for': '1.2.3.4, 10.0.0.1, 203.0.113.99' },
    });

    expect(getClientIp(request as never)).toBe('203.0.113.99');
  });
});

describe('GDPR token persistence', () => {
  it('persists tokens before email delivery can proceed', async () => {
    redis.set.mockResolvedValue('OK');
    await storeToken('data-export', 'token', 'person@example.com');
    expect(redis.set).toHaveBeenCalledWith('data-export:token', 'person@example.com', { ex: 900 });
  });

  it('claims tokens atomically with GETDEL', async () => {
    redis.getdel.mockResolvedValue('person@example.com');
    await expect(claimToken('token', 'data-export')).resolves.toBe('person@example.com');
    expect(redis.getdel).toHaveBeenCalledWith('data-export:token');
  });

  it('restores a token only when no replacement exists', async () => {
    redis.set.mockResolvedValue('OK');
    await restoreToken('data-export', 'token', 'person@example.com');
    expect(redis.set).toHaveBeenCalledWith('data-export:token', 'person@example.com', {
      ex: 300,
      nx: true,
    });
  });
});
