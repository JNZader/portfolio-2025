import { describe, expect, it } from 'vitest';

// Call-site integration: every rate limiter keys on getClientIdentifier. It
// must resolve the SAME trusted IP as the shared helper — otherwise an
// attacker spoofing the first x-forwarded-for entry rotates rate-limit keys
// and bypasses the contact/newsletter/GDPR limiters.

import { getClientIdentifier } from '@/lib/rate-limit/redis';

function requestWithHeaders(headers: Record<string, string>): Request {
  return new Request('http://localhost/api/test', { headers });
}

describe('getClientIdentifier (rate-limit keying)', () => {
  it('keys on the Vercel IP, not a spoofed x-forwarded-for first entry', () => {
    const request = requestWithHeaders({
      'x-forwarded-for': '1.2.3.4',
      'x-vercel-forwarded-for': '1.2.3.4, 203.0.113.10',
    });

    expect(getClientIdentifier(request)).toBe('203.0.113.10');
  });

  it('falls back to the LAST x-forwarded-for entry outside Vercel', () => {
    const request = requestWithHeaders({
      'x-forwarded-for': '1.2.3.4, 10.0.0.1, 203.0.113.99',
    });

    expect(getClientIdentifier(request)).toBe('203.0.113.99');
  });

  it("returns 'unknown' when no trustworthy header exists", () => {
    expect(getClientIdentifier(requestWithHeaders({}))).toBe('unknown');
  });
});
