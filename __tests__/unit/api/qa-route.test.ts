import { beforeEach, describe, expect, it, vi } from 'vitest';

const verifyCsrf = vi.fn().mockReturnValue(true);

vi.mock('@/lib/security/security-config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/security/security-config')>();
  return {
    ...actual,
    verifyCsrf: (...args: unknown[]) => verifyCsrf(...(args as [Request])),
  };
});

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/qa/route';
import { CSRF_ERROR_RESPONSE } from '@/lib/security/security-config';

const ORIGIN_MARKER = 'ORIGIN_LIBRARY_ONLY_DECEMBER_2014_BASE_CONTROLLER';
const VAULT_MARKER = 'JNZader-Vault';

const HIT_FIELDS = ['citation', 'heading', 'href', 'status', 'text', 'title'] as const;

function postRequest(body: unknown) {
  return new NextRequest('http://localhost/api/qa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('POST /api/qa', () => {
  beforeEach(() => {
    verifyCsrf.mockReset().mockReturnValue(true);
  });

  it('returns citation, href, and text for a known published education question', async () => {
    const res = await POST(postRequest({ query: 'qué título tenés', locale: 'es' }));
    const json = (await res.json()) as Record<string, unknown>;

    expect(res.status).toBe(200);
    expect(json.status).toBe('hit');
    expect(json.href).toBe('/cv');
    expect(json.citation).toEqual(expect.any(String));
    expect(json.title).toEqual(expect.any(String));
    expect(json).toHaveProperty('heading');
    expect(typeof json.text).toBe('string');
    expect(json.text).toContain('Técnico en Desarrollo de Software');
    expect(Object.keys(json).sort()).toEqual([...HIT_FIELDS]);
    expect(JSON.stringify(json)).not.toContain(ORIGIN_MARKER);
    expect(JSON.stringify(json)).not.toContain(VAULT_MARKER);
  });

  it('never includes origin or Vault README markers on a hit', async () => {
    const res = await POST(postRequest({ query: 'apigen', locale: 'es' }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.status).toBe('hit');
    expect(JSON.stringify(json)).not.toContain(ORIGIN_MARKER);
    expect(JSON.stringify(json)).not.toContain(VAULT_MARKER);
  });

  it('returns 200 { status: "refused" } for a weak query', async () => {
    const res = await POST(postRequest({ query: 'precio del dólar mañana', locale: 'es' }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'refused' });
  });

  it('returns 400 for an unknown locale', async () => {
    const res = await POST(postRequest({ query: 'qué título tenés', locale: 'fr' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for an empty query', async () => {
    const res = await POST(postRequest({ query: '   ', locale: 'es' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing JSON fields', async () => {
    const res = await POST(postRequest({ locale: 'es' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid JSON', async () => {
    const res = await POST(postRequest('{'));
    expect(res.status).toBe(400);
  });

  it('returns 400 for an oversized query', async () => {
    const res = await POST(postRequest({ query: 'x'.repeat(10_000), locale: 'es' }));
    expect(res.status).toBe(400);
  });

  it('returns 403 with CSRF_ERROR_RESPONSE when CSRF verification fails', async () => {
    verifyCsrf.mockReturnValue(false);

    const res = await POST(postRequest({ query: 'qué título tenés', locale: 'es' }));
    const json = await res.json();

    expect(res.status).toBe(CSRF_ERROR_RESPONSE.status);
    expect(json).toEqual({ message: CSRF_ERROR_RESPONSE.message });
  });
});

describe('GET /api/qa', () => {
  it('returns 405', async () => {
    const res = await GET(new NextRequest('http://localhost/api/qa'));
    expect(res.status).toBe(405);
  });
});
