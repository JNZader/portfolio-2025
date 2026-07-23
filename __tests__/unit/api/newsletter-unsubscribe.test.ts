import { beforeEach, describe, expect, it, vi } from 'vitest';

// Regression tests for the newsletter unsubscribe endpoint.
//
// Security invariant under test: GET must NEVER unsubscribe. It only renders
// a confirmation page. Email clients and antivirus scanners follow every link
// in a message — a bare GET from a prefetcher must not silently unsubscribe
// the recipient. The actual unsubscribe only happens on POST after the user
// clicks the button.

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

const limit = vi.fn().mockResolvedValue({ success: true });
vi.mock('@/lib/rate-limit/redis', () => ({
  unsubscribeRateLimiter: { limit: (...args: unknown[]) => limit(...args) },
  getClientIdentifier: vi.fn().mockReturnValue('127.0.0.1'),
}));

vi.mock('@/lib/monitoring/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/newsletter/unsubscribe/route';

const ACTIVE_SUBSCRIBER = {
  id: 'sub-1',
  email: 'reader@example.com',
  status: 'ACTIVE',
  unsubToken: 'valid-token',
};

function getRequestWithToken(token?: string, headers: Record<string, string> = {}) {
  const url = token
    ? `http://localhost/api/newsletter/unsubscribe?token=${token}`
    : 'http://localhost/api/newsletter/unsubscribe';
  return new NextRequest(url, { headers });
}

function postRequestWithToken(token?: string) {
  return new NextRequest('http://localhost/api/newsletter/unsubscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: token ? new URLSearchParams({ token }).toString() : '',
  });
}

beforeEach(() => {
  findUnique.mockReset();
  update.mockReset();
  limit.mockResolvedValue({ success: true });
});

describe('GET /api/newsletter/unsubscribe', () => {
  it('renders the HTML confirmation form and does NOT unsubscribe', async () => {
    findUnique.mockResolvedValue(ACTIVE_SUBSCRIBER);

    const response = await GET(getRequestWithToken('valid-token'));

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');

    const body = await response.text();
    expect(body).toContain('<form method="POST" action="/api/newsletter/unsubscribe">');
    expect(body).toContain('name="token"');
    expect(body).toContain('value="valid-token"');

    // The critical invariant: GET must not mutate state.
    expect(update).not.toHaveBeenCalled();
  });

  it('renders English strings when Accept-Language prefers English', async () => {
    findUnique.mockResolvedValue(ACTIVE_SUBSCRIBER);

    const response = await GET(
      getRequestWithToken('valid-token', { 'accept-language': 'en-US,en;q=0.9' })
    );
    const body = await response.text();

    expect(body).toContain('Confirm unsubscribe');
    expect(update).not.toHaveBeenCalled();
  });

  it('leaves a valid token usable after GET (no mutation burn)', async () => {
    findUnique.mockResolvedValue(ACTIVE_SUBSCRIBER);
    await GET(getRequestWithToken('valid-token'));

    update.mockResolvedValue({ ...ACTIVE_SUBSCRIBER, status: 'UNSUBSCRIBED' });
    const response = await POST(postRequestWithToken('valid-token'));

    expect(update).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
  });

  it('HTML-escapes the token value in the hidden input', async () => {
    findUnique.mockResolvedValue(ACTIVE_SUBSCRIBER);

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

  it('renders an HTML error page (404) when the subscription does not exist', async () => {
    findUnique.mockResolvedValue(null);

    const response = await GET(getRequestWithToken('ghost-token'));

    expect(response.status).toBe(404);
    expect(update).not.toHaveBeenCalled();
  });

  it('renders an informational page when already unsubscribed', async () => {
    findUnique.mockResolvedValue({ ...ACTIVE_SUBSCRIBER, status: 'UNSUBSCRIBED' });

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

describe('POST /api/newsletter/unsubscribe', () => {
  it('unsubscribes exactly once on a valid token', async () => {
    findUnique.mockResolvedValue(ACTIVE_SUBSCRIBER);
    update.mockResolvedValue({ ...ACTIVE_SUBSCRIBER, status: 'UNSUBSCRIBED' });

    const response = await POST(postRequestWithToken('valid-token'));

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      where: { id: 'sub-1' },
      data: {
        status: 'UNSUBSCRIBED',
        unsubscribedAt: expect.any(Date),
      },
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
  });

  it('returns 400 when the token is missing from the form body', async () => {
    const response = await POST(postRequestWithToken());

    expect(response.status).toBe(400);
    expect(findUnique).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it('returns 404 and does not mutate when the subscription does not exist', async () => {
    findUnique.mockResolvedValue(null);

    const response = await POST(postRequestWithToken('ghost-token'));

    expect(response.status).toBe(404);
    expect(update).not.toHaveBeenCalled();
  });

  it('does not mutate again when already unsubscribed', async () => {
    findUnique.mockResolvedValue({ ...ACTIVE_SUBSCRIBER, status: 'UNSUBSCRIBED' });

    const response = await POST(postRequestWithToken('valid-token'));

    expect(response.status).toBe(200);
    expect(update).not.toHaveBeenCalled();
  });

  it('returns 429 when rate limited, without mutating', async () => {
    limit.mockResolvedValue({ success: false });

    const response = await POST(postRequestWithToken('valid-token'));

    expect(response.status).toBe(429);
    expect(findUnique).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it('returns a 500 HTML page when the database update throws', async () => {
    findUnique.mockResolvedValue(ACTIVE_SUBSCRIBER);
    update.mockRejectedValue(new Error('db down'));

    const response = await POST(postRequestWithToken('valid-token'));

    expect(response.status).toBe(500);
    expect(response.headers.get('content-type')).toContain('text/html');
  });
});
