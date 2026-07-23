import { describe, expect, it } from 'vitest';

// Security invariant under test: on Vercel, `x-forwarded-for` is partially
// attacker-controlled — the client can prepend arbitrary entries and Vercel
// APPENDS the real connecting IP. Taking the FIRST entry (the old behavior)
// let an attacker rotate fake IPs and bypass every rate limiter (contact,
// newsletter, GDPR) and forge the GDPR IP audit trail. The single trusted
// source is Vercel's own headers (`x-vercel-forwarded-for`, `x-real-ip`);
// only outside Vercel (dev/self-host) do we fall back to the LAST
// `x-forwarded-for` entry, which is the entry the edge appended.

import { getClientIp } from '@/lib/utils/client-ip';

function requestWithHeaders(headers: Record<string, string>): Request {
  return new Request('http://localhost/api/test', { headers });
}

describe('getClientIp', () => {
  it('prefers x-vercel-forwarded-for over a spoofed x-forwarded-for first entry', () => {
    const request = requestWithHeaders({
      'x-forwarded-for': '1.2.3.4',
      'x-vercel-forwarded-for': '1.2.3.4, 203.0.113.10',
    });

    expect(getClientIp(request)).toBe('203.0.113.10');
  });

  it('uses the LAST x-vercel-forwarded-for entry when the client prepended spoofed IPs', () => {
    const request = requestWithHeaders({
      'x-vercel-forwarded-for': '1.2.3.4, 4.3.2.1, 198.51.100.7',
    });

    expect(getClientIp(request)).toBe('198.51.100.7');
  });

  it('falls back to x-real-ip when x-vercel-forwarded-for is absent', () => {
    const request = requestWithHeaders({
      'x-forwarded-for': '1.2.3.4',
      'x-real-ip': '192.0.2.55',
    });

    expect(getClientIp(request)).toBe('192.0.2.55');
  });

  it('falls back to the LAST x-forwarded-for entry when no Vercel headers exist (dev/self-host)', () => {
    const request = requestWithHeaders({
      'x-forwarded-for': '1.2.3.4, 10.0.0.1, 203.0.113.99',
    });

    expect(getClientIp(request)).toBe('203.0.113.99');
  });

  it('trims whitespace around header entries', () => {
    const request = requestWithHeaders({
      'x-forwarded-for': '  203.0.113.5  ',
    });

    expect(getClientIp(request)).toBe('203.0.113.5');
  });

  it('ignores empty x-vercel-forwarded-for entries and falls through to x-real-ip', () => {
    const request = requestWithHeaders({
      'x-vercel-forwarded-for': ' , ',
      'x-real-ip': '192.0.2.1',
    });

    expect(getClientIp(request)).toBe('192.0.2.1');
  });

  it("returns 'unknown' when every header is missing", () => {
    expect(getClientIp(requestWithHeaders({}))).toBe('unknown');
  });

  it("returns 'unknown' when headers are present but empty", () => {
    const request = requestWithHeaders({
      'x-forwarded-for': '',
      'x-real-ip': '   ',
    });

    expect(getClientIp(request)).toBe('unknown');
  });
});
