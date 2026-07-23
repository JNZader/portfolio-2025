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
const updateMany = vi.fn();

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    subscriber: {
      findUnique: (...args: unknown[]) => findUnique(...args),
      update: (...args: unknown[]) => update(...args),
      updateMany: (...args: unknown[]) => updateMany(...args),
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
  updateMany.mockReset();
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

    updateMany.mockResolvedValue({ count: 1 });
    const response = await POST(postRequestWithToken('valid-token'));

    expect(updateMany).toHaveBeenCalledTimes(1);
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
    updateMany.mockResolvedValue({ count: 1 });

    const response = await POST(postRequestWithToken('valid-token'));

    // Conditional transition: only a still-PENDING row holding this token can
    // be flipped to ACTIVE. The token is RETAINED (same convention as the
    // unsubscribe route) so a re-POST can be told apart from a bogus token.
    expect(updateMany).toHaveBeenCalledTimes(1);
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: 'sub-1', status: 'PENDING', confirmToken: 'valid-token' },
      data: {
        status: 'ACTIVE',
        confirmedAt: expect.any(Date),
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
    expect(updateMany).not.toHaveBeenCalled();
  });

  it('returns 404 and does not mutate when the token does not exist', async () => {
    findUnique.mockResolvedValue(null);

    const response = await POST(postRequestWithToken('ghost-token'));

    expect(response.status).toBe(404);
    expect(updateMany).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('returns 410 and does not mutate when the token is expired', async () => {
    findUnique.mockResolvedValue({
      ...PENDING_SUBSCRIBER,
      confirmTokenExp: new Date(Date.now() - 60 * 1000),
    });

    const response = await POST(postRequestWithToken('valid-token'));

    expect(response.status).toBe(410);
    expect(updateMany).not.toHaveBeenCalled();
  });

  it('re-POST after a successful confirmation renders the friendly page without duplicating the welcome email', async () => {
    // Real production sequence: GET (form) → POST (confirm) → POST again
    // (refresh / double-click). The second POST must render the 200
    // 'already confirmed' page, NOT a 404, and must not re-send the email.
    findUnique
      .mockResolvedValueOnce(PENDING_SUBSCRIBER) // GET lookup
      .mockResolvedValueOnce(PENDING_SUBSCRIBER) // first POST lookup
      .mockResolvedValueOnce({
        ...PENDING_SUBSCRIBER,
        status: 'ACTIVE',
        confirmTokenExp: null,
      }); // re-POST lookup: token retained, already confirmed
    updateMany.mockResolvedValueOnce({ count: 1 });

    const getResponse = await GET(getRequestWithToken('valid-token'));
    expect(getResponse.status).toBe(200);

    const first = await POST(postRequestWithToken('valid-token'));
    expect(first.status).toBe(200);
    expect(updateMany).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledTimes(1);

    const second = await POST(postRequestWithToken('valid-token'));
    expect(second.status).toBe(200);
    const body = await second.text();
    expect(body).toContain('Ya Confirmado');
    expect(body).not.toContain('Token No Encontrado');

    // No second mutation, no duplicate welcome email.
    expect(updateMany).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it('concurrent-style double transition sends exactly one welcome email', async () => {
    // Both requests resolve the token as confirmable BEFORE either mutates;
    // the conditional update lets only ONE of them win the transition.
    findUnique.mockResolvedValue(PENDING_SUBSCRIBER);
    updateMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });

    const [first, second] = await Promise.all([
      POST(postRequestWithToken('valid-token')),
      POST(postRequestWithToken('valid-token')),
    ]);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(updateMany).toHaveBeenCalledTimes(2);
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it('returns 429 when rate limited, without mutating', async () => {
    limit.mockResolvedValue({ success: false });

    const response = await POST(postRequestWithToken('valid-token'));

    expect(response.status).toBe(429);
    expect(findUnique).not.toHaveBeenCalled();
    expect(updateMany).not.toHaveBeenCalled();
  });

  it('still confirms when the welcome email fails', async () => {
    findUnique.mockResolvedValue(PENDING_SUBSCRIBER);
    updateMany.mockResolvedValue({ count: 1 });
    sendMock.mockRejectedValueOnce(new Error('resend down'));

    const response = await POST(postRequestWithToken('valid-token'));

    expect(updateMany).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
  });

  it('returns a 500 HTML page when the database update throws', async () => {
    findUnique.mockResolvedValue(PENDING_SUBSCRIBER);
    updateMany.mockRejectedValue(new Error('db down'));

    const response = await POST(postRequestWithToken('valid-token'));

    expect(response.status).toBe(500);
    expect(response.headers.get('content-type')).toContain('text/html');
  });
});
