import { beforeEach, describe, expect, it, vi } from 'vitest';

// Regression tests for the newsletter confirm endpoint.
//
// Security invariant under test: GET must NEVER confirm the subscription. It
// only renders a confirmation page. This prevents link-prefetchers (email
// clients, unfurl bots, antivirus scanners, browser prefetch) from silently
// confirming a subscription without human intent on a bare GET request. The
// actual confirmation only happens on POST after the user clicks the button.

const findUnique = vi.fn();
const update = vi.fn();

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    subscriber: {
      findUnique: (...args: unknown[]) => findUnique(...args),
      update: (...args: unknown[]) => update(...args),
    },
  },
}));

const sendMock = vi.fn().mockResolvedValue({ data: { id: 'email-id' }, error: null });
vi.mock('@/lib/email/resend', () => ({
  resend: { emails: { send: (...args: unknown[]) => sendMock(...args) } },
  emailConfig: { from: 'noreply@test.dev', to: 'owner@test.dev' },
}));

vi.mock('@/lib/email/templates/NewsletterWelcome', () => ({ default: () => null }));

const limit = vi.fn().mockResolvedValue({ success: true });
vi.mock('@/lib/rate-limit/redis', () => ({
  confirmRateLimiter: { limit: (...args: unknown[]) => limit(...args) },
  getClientIdentifier: vi.fn().mockReturnValue('127.0.0.1'),
}));

vi.mock('@/lib/monitoring/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/config/site-url', () => ({
  getSiteUrl: () => 'https://example.com',
}));

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/newsletter/confirm/route';

const PENDING_SUBSCRIBER = {
  id: 'sub-1',
  email: 'reader@example.com',
  status: 'PENDING',
  confirmToken: 'valid-token',
  confirmTokenExp: new Date(Date.now() + 60 * 60 * 1000),
  unsubToken: 'unsub-token',
};

function getRequestWithToken(token?: string, headers: Record<string, string> = {}) {
  const url = token
    ? `http://localhost/api/newsletter/confirm?token=${token}`
    : 'http://localhost/api/newsletter/confirm';
  return new NextRequest(url, { headers });
}

function postRequestWithToken(token?: string) {
  return new NextRequest('http://localhost/api/newsletter/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: token ? new URLSearchParams({ token }).toString() : '',
  });
}

beforeEach(() => {
  findUnique.mockReset();
  update.mockReset();
  sendMock.mockClear();
  limit.mockResolvedValue({ success: true });
});

describe('GET /api/newsletter/confirm', () => {
  it('renders the HTML confirmation form and does NOT confirm the subscription', async () => {
    findUnique.mockResolvedValue(PENDING_SUBSCRIBER);

    const response = await GET(getRequestWithToken('valid-token'));

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');

    const body = await response.text();
    expect(body).toContain('<form method="POST" action="/api/newsletter/confirm">');
    expect(body).toContain('name="token"');
    expect(body).toContain('value="valid-token"');
    expect(body).toContain('Confirmar suscripción');

    // The critical invariant: GET must not mutate state nor send email.
    expect(update).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('renders English strings when Accept-Language prefers English', async () => {
    findUnique.mockResolvedValue(PENDING_SUBSCRIBER);

    const response = await GET(
      getRequestWithToken('valid-token', { 'accept-language': 'en-US,en;q=0.9' })
    );
    const body = await response.text();

    expect(body).toContain('Confirm subscription');
    expect(body).not.toContain('Confirmar suscripción');
    expect(update).not.toHaveBeenCalled();
  });

  it('leaves a valid token usable after GET (no mutation burn)', async () => {
    findUnique.mockResolvedValue(PENDING_SUBSCRIBER);
    await GET(getRequestWithToken('valid-token'));

    update.mockResolvedValue({ ...PENDING_SUBSCRIBER, status: 'ACTIVE' });
    const response = await POST(postRequestWithToken('valid-token'));

    expect(update).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
  });

  it('HTML-escapes the token value in the hidden input', async () => {
    findUnique.mockResolvedValue(PENDING_SUBSCRIBER);

    const response = await GET(getRequestWithToken('a%22%3E%3Cscript%3E'));
    const body = await response.text();

    expect(body).not.toContain('"><script>');
    expect(body).toContain('&quot;&gt;&lt;script&gt;');
    expect(update).not.toHaveBeenCalled();
  });

  it('renders an HTML error page (400) when the token is missing', async () => {
    const response = await GET(getRequestWithToken());

    expect(response.status).toBe(400);
    expect(findUnique).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it('renders an HTML error page (404) when the token does not exist', async () => {
    findUnique.mockResolvedValue(null);

    const response = await GET(getRequestWithToken('ghost-token'));

    expect(response.status).toBe(404);
    expect(update).not.toHaveBeenCalled();
  });

  it('renders an expired-token page (410) without mutating', async () => {
    findUnique.mockResolvedValue({
      ...PENDING_SUBSCRIBER,
      confirmTokenExp: new Date(Date.now() - 60 * 1000),
    });

    const response = await GET(getRequestWithToken('valid-token'));

    expect(response.status).toBe(410);
    expect(update).not.toHaveBeenCalled();
  });

  it('renders an informational page when the subscription is already active', async () => {
    findUnique.mockResolvedValue({ ...PENDING_SUBSCRIBER, status: 'ACTIVE' });

    const response = await GET(getRequestWithToken('valid-token'));

    expect(response.status).toBe(200);
    expect(update).not.toHaveBeenCalled();
  });

  it('returns 429 when rate limited, without any lookup or mutation', async () => {
    limit.mockResolvedValue({ success: false });

    const response = await GET(getRequestWithToken('valid-token'));

    expect(response.status).toBe(429);
    expect(response.headers.get('retry-after')).toBe('3600');
    expect(findUnique).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });
});

describe('POST /api/newsletter/confirm', () => {
  it('confirms the subscription exactly once and sends the welcome email', async () => {
    findUnique.mockResolvedValue(PENDING_SUBSCRIBER);
    update.mockResolvedValue({ ...PENDING_SUBSCRIBER, status: 'ACTIVE' });

    const response = await POST(postRequestWithToken('valid-token'));

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      where: { id: 'sub-1' },
      data: {
        status: 'ACTIVE',
        confirmedAt: expect.any(Date),
        confirmToken: null,
        confirmTokenExp: null,
      },
    });
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'reader@example.com' })
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
  });

  it('returns 400 when the token is missing from the form body', async () => {
    const response = await POST(postRequestWithToken());

    expect(response.status).toBe(400);
    expect(findUnique).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it('returns 404 and does not mutate when the token does not exist', async () => {
    findUnique.mockResolvedValue(null);

    const response = await POST(postRequestWithToken('ghost-token'));

    expect(response.status).toBe(404);
    expect(update).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('returns 410 and does not mutate when the token is expired', async () => {
    findUnique.mockResolvedValue({
      ...PENDING_SUBSCRIBER,
      confirmTokenExp: new Date(Date.now() - 60 * 1000),
    });

    const response = await POST(postRequestWithToken('valid-token'));

    expect(response.status).toBe(410);
    expect(update).not.toHaveBeenCalled();
  });

  it('does not mutate again when the subscription is already active', async () => {
    findUnique.mockResolvedValue({ ...PENDING_SUBSCRIBER, status: 'ACTIVE' });

    const response = await POST(postRequestWithToken('valid-token'));

    expect(response.status).toBe(200);
    expect(update).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('returns 429 when rate limited, without mutating', async () => {
    limit.mockResolvedValue({ success: false });

    const response = await POST(postRequestWithToken('valid-token'));

    expect(response.status).toBe(429);
    expect(findUnique).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it('still confirms when the welcome email fails', async () => {
    findUnique.mockResolvedValue(PENDING_SUBSCRIBER);
    update.mockResolvedValue({ ...PENDING_SUBSCRIBER, status: 'ACTIVE' });
    sendMock.mockRejectedValueOnce(new Error('resend down'));

    const response = await POST(postRequestWithToken('valid-token'));

    expect(update).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
  });

  it('returns a 500 HTML page when the database update throws', async () => {
    findUnique.mockResolvedValue(PENDING_SUBSCRIBER);
    update.mockRejectedValue(new Error('db down'));

    const response = await POST(postRequestWithToken('valid-token'));

    expect(response.status).toBe(500);
    expect(response.headers.get('content-type')).toContain('text/html');
  });
});
