import { beforeEach, describe, expect, it, vi } from 'vitest';

// Regression test for the GDPR HTML-injection fix: the confirmation email
// interpolated the attacker-controlled `reason` without escaping.

const sendMock = vi.fn().mockResolvedValue({ data: { id: 'email-id' }, error: null });

vi.mock('@/lib/email/resend', () => ({
  resend: { emails: { send: (...args: unknown[]) => sendMock(...args) } },
}));

vi.mock('@/lib/rate-limit/redis', () => ({
  confirmRateLimiter: { limit: vi.fn().mockResolvedValue({ success: true }) },
  getClientIdentifier: vi.fn().mockReturnValue('127.0.0.1'),
}));

const verifyAndConsumeToken = vi.fn();
vi.mock('@/lib/api/gdpr-utils', () => ({
  MESSAGES: { tokenMissing: 'token missing', tokenExpired: 'token expired' },
  verifyAndConsumeToken: (...args: unknown[]) => verifyAndConsumeToken(...args),
}));

vi.mock('@/lib/services/gdpr', () => ({
  deleteUserData: vi.fn().mockResolvedValue({ success: true, message: 'ok' }),
}));

vi.mock('@/lib/monitoring/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/data-deletion/confirm/route';

function requestWithToken(token: string) {
  return new NextRequest(`http://localhost/api/data-deletion/confirm?token=${token}`);
}

describe('GET /api/data-deletion/confirm', () => {
  beforeEach(() => {
    sendMock.mockClear();
    verifyAndConsumeToken.mockReset();
  });

  it('escapes attacker-controlled reason in the confirmation email html', async () => {
    const maliciousReason = '<script>alert(1)</script><a href="https://evil.example">phish</a>';
    verifyAndConsumeToken.mockResolvedValue(
      JSON.stringify({ email: 'victim@example.com', reason: maliciousReason })
    );

    await GET(requestWithToken('valid-token'));

    expect(sendMock).toHaveBeenCalledTimes(1);
    const { html } = sendMock.mock.calls[0][0] as { html: string };
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('href="https://evil.example"');
    expect(html).toContain('&lt;script&gt;');
  });

  it('returns 400 when the token is missing', async () => {
    const response = await GET(new NextRequest('http://localhost/api/data-deletion/confirm'));
    expect(response.status).toBe(400);
  });

  it('returns 400 when the token is expired or invalid', async () => {
    verifyAndConsumeToken.mockResolvedValue(null);
    const response = await GET(requestWithToken('bad-token'));
    expect(response.status).toBe(400);
    expect(sendMock).not.toHaveBeenCalled();
  });
});
