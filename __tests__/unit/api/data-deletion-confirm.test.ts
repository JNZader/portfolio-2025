import { beforeEach, describe, expect, it, vi } from 'vitest';

// Regression tests for the GDPR data-deletion confirm endpoint.
//
// Two invariants under test:
//  1. Security: GET must NEVER delete data or consume the token. It only
//     renders the confirmation page. This prevents link-prefetchers (email
//     clients, unfurl bots, antivirus scanners, browser prefetch) from
//     silently deleting a user's data via a bare GET request.
//  2. HTML-injection fix: the confirmation email interpolated the
//     attacker-controlled `reason` without escaping — POST must escape it.

const sendMock = vi.fn().mockResolvedValue({ data: { id: 'email-id' }, error: null });

vi.mock('@/lib/email/resend', () => ({
  resend: { emails: { send: (...args: unknown[]) => sendMock(...args) } },
}));

vi.mock('@/lib/rate-limit/redis', () => ({
  confirmRateLimiter: { limit: vi.fn().mockResolvedValue({ success: true }) },
  getClientIdentifier: vi.fn().mockReturnValue('127.0.0.1'),
}));

const claimToken = vi.fn();
const restoreToken = vi.fn();
vi.mock('@/lib/api/gdpr-utils', () => ({
  MESSAGES: { tokenMissing: 'token missing', tokenExpired: 'token expired' },
  claimToken: (...args: unknown[]) => claimToken(...args),
  restoreToken: (...args: unknown[]) => restoreToken(...args),
}));

const deleteUserData = vi.fn().mockResolvedValue({ success: true, message: 'ok' });
vi.mock('@/lib/services/gdpr', () => ({
  deleteUserData: (...args: unknown[]) => deleteUserData(...args),
}));

vi.mock('@/lib/monitoring/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/data-deletion/confirm/route';

function getRequestWithToken(token: string) {
  return new NextRequest(`http://localhost/api/data-deletion/confirm?token=${token}`);
}

function postRequestWithToken(token: string) {
  return new NextRequest('http://localhost/api/data-deletion/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ token }).toString(),
  });
}

beforeEach(() => {
  sendMock.mockClear();
  claimToken.mockReset();
  restoreToken.mockReset();
  deleteUserData.mockClear();
});

describe('GET /api/data-deletion/confirm', () => {
  it('renders the HTML confirmation form and does NOT delete data', async () => {
    const response = await GET(getRequestWithToken('some-token'));

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');

    const body = await response.text();
    expect(body).toContain('<form method="POST" action="/api/data-deletion/confirm">');
    expect(body).toContain('name="token"');
    expect(body).toContain('value="some-token"');
    expect(body).toContain('Confirmar eliminación');
    // Warns that the action is irreversible
    expect(body).toContain('IRREVERSIBLE');

    // The critical invariant: GET must not consume the token, delete data,
    // or send email. A prefetcher hitting this URL must have zero side effect.
    expect(claimToken).not.toHaveBeenCalled();
    expect(deleteUserData).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('HTML-escapes the token value in the hidden input', async () => {
    const response = await GET(getRequestWithToken('a%22%3E%3Cscript%3E'));
    const body = await response.text();

    expect(body).not.toContain('"><script>');
    expect(body).toContain('&quot;&gt;&lt;script&gt;');
    expect(deleteUserData).not.toHaveBeenCalled();
  });

  it('renders an HTML error page (400) when the token is missing', async () => {
    const response = await GET(new NextRequest('http://localhost/api/data-deletion/confirm'));

    expect(response.status).toBe(400);
    expect(response.headers.get('content-type')).toContain('text/html');
    expect(claimToken).not.toHaveBeenCalled();
    expect(deleteUserData).not.toHaveBeenCalled();
  });
});

describe('POST /api/data-deletion/confirm', () => {
  it('escapes attacker-controlled reason in the confirmation email html', async () => {
    const maliciousReason = '<script>alert(1)</script><a href="https://evil.example">phish</a>';
    claimToken.mockResolvedValue(
      JSON.stringify({ email: 'victim@example.com', reason: maliciousReason })
    );

    await POST(postRequestWithToken('valid-token'));

    expect(deleteUserData).toHaveBeenCalledWith('victim@example.com');
    expect(sendMock).toHaveBeenCalledTimes(1);
    const { html } = sendMock.mock.calls[0][0] as { html: string };
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('href="https://evil.example"');
    expect(html).toContain('&lt;script&gt;');
  });

  it('deletes data and redirects on a valid token', async () => {
    claimToken.mockResolvedValue(
      JSON.stringify({ email: 'victim@example.com' })
    );

    const response = await POST(postRequestWithToken('valid-token'));

    expect(deleteUserData).toHaveBeenCalledWith('victim@example.com');
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/data-request?deleted=true');
  });

  it('returns 400 when the token is missing from the form body', async () => {
    const response = await POST(
      new NextRequest('http://localhost/api/data-deletion/confirm', { method: 'POST' })
    );
    expect(response.status).toBe(400);
    expect(deleteUserData).not.toHaveBeenCalled();
  });

  it('returns 400 when the token is expired or invalid', async () => {
    claimToken.mockResolvedValue(null);
    const response = await POST(postRequestWithToken('bad-token'));
    expect(response.status).toBe(400);
    expect(deleteUserData).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('returns 404 when the user is not found', async () => {
    claimToken.mockResolvedValue(
      JSON.stringify({ email: 'ghost@example.com' })
    );
    deleteUserData.mockResolvedValueOnce({ success: false, message: 'not found' });

    const response = await POST(postRequestWithToken('valid-token'));
    expect(response.status).toBe(404);
    expect(sendMock).not.toHaveBeenCalled();
  });
});
