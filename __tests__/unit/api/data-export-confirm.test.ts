import { beforeEach, describe, expect, it, vi } from 'vitest';

// Regression tests for the GDPR data-export confirm endpoint.
//
// Security invariant under test: GET must NEVER export data or consume the
// token. It only renders the confirmation page. This prevents link-prefetchers
// (email clients, unfurl bots, antivirus scanners, browser prefetch) from
// silently exfiltrating a user's PII — and burning the single-use token so the
// legitimate user can no longer use their own link — via a bare GET request.
// The actual export only happens on POST after the user clicks the button.

vi.mock('@/lib/rate-limit/redis', () => ({
  confirmRateLimiter: { limit: vi.fn().mockResolvedValue({ success: true }) },
  getClientIdentifier: vi.fn().mockReturnValue('127.0.0.1'),
}));

const verifyAndConsumeToken = vi.fn();
vi.mock('@/lib/api/gdpr-utils', () => ({
  MESSAGES: { tokenMissing: 'token missing', tokenExpired: 'token expired' },
  verifyAndConsumeToken: (...args: unknown[]) => verifyAndConsumeToken(...args),
}));

const exportUserData = vi.fn();
vi.mock('@/lib/services/gdpr', () => ({
  exportUserData: (...args: unknown[]) => exportUserData(...args),
}));

vi.mock('@/lib/monitoring/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { NextRequest } from 'next/server';
import { confirmRateLimiter } from '@/lib/rate-limit/redis';
import { GET, POST } from '@/app/api/data-export/confirm/route';

function getRequestWithToken(token: string) {
  return new NextRequest(`http://localhost/api/data-export/confirm?token=${token}`);
}

function postRequestWithToken(token: string) {
  return new NextRequest('http://localhost/api/data-export/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ token }).toString(),
  });
}

beforeEach(() => {
  verifyAndConsumeToken.mockReset();
  exportUserData.mockReset();
  vi.mocked(confirmRateLimiter.limit).mockResolvedValue({ success: true } as never);
});

describe('GET /api/data-export/confirm', () => {
  it('renders the HTML confirmation form and does NOT export data or consume the token', async () => {
    const response = await GET(getRequestWithToken('some-token'));

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');

    const body = await response.text();
    expect(body).toContain('<form method="POST" action="/api/data-export/confirm">');
    expect(body).toContain('name="token"');
    expect(body).toContain('value="some-token"');
    expect(body).toContain('Descargar mis datos');

    // The critical invariant: GET must not consume the single-use token nor
    // export data. A prefetcher hitting this URL must have zero side effect.
    expect(verifyAndConsumeToken).not.toHaveBeenCalled();
    expect(exportUserData).not.toHaveBeenCalled();
  });

  it('HTML-escapes the token value in the hidden input', async () => {
    const response = await GET(getRequestWithToken('a%22%3E%3Cscript%3E'));
    const body = await response.text();

    expect(body).not.toContain('"><script>');
    expect(body).toContain('&quot;&gt;&lt;script&gt;');
    expect(exportUserData).not.toHaveBeenCalled();
  });

  it('renders an HTML error page (400) when the token is missing', async () => {
    const response = await GET(new NextRequest('http://localhost/api/data-export/confirm'));

    expect(response.status).toBe(400);
    expect(response.headers.get('content-type')).toContain('text/html');
    expect(verifyAndConsumeToken).not.toHaveBeenCalled();
    expect(exportUserData).not.toHaveBeenCalled();
  });
});

describe('POST /api/data-export/confirm', () => {
  it('exports data and returns a JSON download on a valid token', async () => {
    verifyAndConsumeToken.mockResolvedValue('victim@example.com');
    exportUserData.mockResolvedValue({ email: 'victim@example.com', subscription: null });

    const response = await POST(postRequestWithToken('valid-token'));

    expect(verifyAndConsumeToken).toHaveBeenCalledWith('valid-token', 'data-export');
    expect(exportUserData).toHaveBeenCalledWith('victim@example.com');
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/json');

    const disposition = response.headers.get('content-disposition');
    expect(disposition).toContain('attachment; filename="data-export-');
    // Email is sanitized in the filename slug: '@' and '.' outside [a-z0-9._-]
    // become '_'. The '@' becomes '_', dots are kept.
    expect(disposition).toContain('victim_example.com');
    expect(disposition).not.toContain('victim@example.com');

    const body = await response.text();
    expect(body).toContain('victim@example.com');
  });

  it('returns 400 when the token is missing from the form body', async () => {
    const response = await POST(
      new NextRequest('http://localhost/api/data-export/confirm', { method: 'POST' })
    );
    expect(response.status).toBe(400);
    expect(verifyAndConsumeToken).not.toHaveBeenCalled();
    expect(exportUserData).not.toHaveBeenCalled();
  });

  it('returns 400 when the token is expired or invalid', async () => {
    verifyAndConsumeToken.mockResolvedValue(null);
    const response = await POST(postRequestWithToken('bad-token'));
    expect(response.status).toBe(400);
    expect(exportUserData).not.toHaveBeenCalled();
  });

  it('returns 404 when no data is found for the email', async () => {
    verifyAndConsumeToken.mockResolvedValue('ghost@example.com');
    exportUserData.mockResolvedValue(null);

    const response = await POST(postRequestWithToken('valid-token'));
    expect(response.status).toBe(404);
  });

  it('returns 429 when rate limited', async () => {
    vi.mocked(confirmRateLimiter.limit).mockResolvedValue({ success: false } as never);

    const response = await POST(postRequestWithToken('valid-token'));
    expect(response.status).toBe(429);
    expect(response.headers.get('retry-after')).toBe('3600');
    expect(verifyAndConsumeToken).not.toHaveBeenCalled();
    expect(exportUserData).not.toHaveBeenCalled();
  });

  it('returns 500 when the export throws', async () => {
    verifyAndConsumeToken.mockResolvedValue('victim@example.com');
    exportUserData.mockRejectedValue(new Error('boom'));

    const response = await POST(postRequestWithToken('valid-token'));
    expect(response.status).toBe(500);
  });
});
