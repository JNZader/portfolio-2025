import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const verifyCsrf = vi.fn().mockReturnValue(true);
const streamText = vi.fn();
const google = vi.fn(() => 'gemini-3.8-flash-model');

vi.mock('@/lib/security/security-config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/security/security-config')>();
  return {
    ...actual,
    verifyCsrf: (...args: unknown[]) => verifyCsrf(...(args as [Request])),
  };
});

vi.mock('ai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('ai')>();
  return {
    ...actual,
    streamText: (...args: unknown[]) => streamText(...args),
  };
});

vi.mock('@ai-sdk/google', () => ({
  google: (...args: unknown[]) => google(...(args as [string])),
}));

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/qa/route';
import { CSRF_ERROR_RESPONSE } from '@/lib/security/security-config';

const ORIGIN_MARKER = 'ORIGIN_LIBRARY_ONLY_DECEMBER_2014_BASE_CONTROLLER';
const VAULT_MARKER = 'JNZader-Vault';
const API_KEY = 'GOOGLE_GENERATIVE_AI_API_KEY';

function chatBody(text: string, locale = 'es', path?: string) {
  return {
    messages: [{ id: 'u1', role: 'user', parts: [{ type: 'text', text }] }],
    locale,
    ...(path === undefined ? {} : { path }),
  };
}

function postRequest(body: unknown) {
  return new NextRequest('http://localhost/api/qa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

function streamResult() {
  return {
    toUIMessageStreamResponse: () =>
      new Response('streamed', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }),
    toDataStreamResponse: () =>
      new Response('streamed', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }),
  };
}

describe('POST /api/qa', () => {
  const previousKey = process.env[API_KEY];

  beforeEach(() => {
    verifyCsrf.mockReset().mockReturnValue(true);
    streamText.mockReset().mockReturnValue(streamResult());
    google.mockReset().mockReturnValue('gemini-3.8-flash-model');
    process.env[API_KEY] = 'test-key';
  });

  afterEach(() => {
    if (previousKey === undefined) delete process.env[API_KEY];
    else process.env[API_KEY] = previousKey;
  });

  it('does not call Google when retrieval is empty', async () => {
    const res = await POST(postRequest(chatBody('precio del dólar mañana')));

    expect(res.status).toBe(200);
    expect(google).not.toHaveBeenCalled();
    expect(streamText).not.toHaveBeenCalled();
    expect(res.headers.get('content-type')).not.toMatch(/application\/json/);
  });

  it('passes retrieved source hrefs into the model prompt on a hit', async () => {
    const res = await POST(postRequest(chatBody('qué título tenés')));
    const payload = streamText.mock.calls[0]?.[0] as Record<string, unknown> | undefined;

    expect(res.status).toBe(200);
    expect(google).toHaveBeenCalledWith('gemini-3.8-flash');
    expect(streamText).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(payload)).toContain('thinkingBudget');
    expect(JSON.stringify(payload)).toContain('/cv');
    expect(JSON.stringify(payload)).not.toContain(ORIGIN_MARKER);
    expect(JSON.stringify(payload)).not.toContain(VAULT_MARKER);
  });

  it('returns 503 JSON without leaking the env name when the API key is missing', async () => {
    delete process.env[API_KEY];

    const res = await POST(postRequest(chatBody('qué título tenés')));
    const json = (await res.json()) as Record<string, unknown>;

    expect(res.status).toBe(503);
    expect(json).toEqual({ message: expect.any(String) });
    expect(String(json.message)).not.toContain(API_KEY);
    expect(google).not.toHaveBeenCalled();
    expect(streamText).not.toHaveBeenCalled();
  });

  it('returns 400 for an unknown locale', async () => {
    const res = await POST(postRequest(chatBody('qué título tenés', 'fr')));
    expect(res.status).toBe(400);
  });

  it('returns 400 for empty user text', async () => {
    const res = await POST(postRequest(chatBody('   ')));
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing messages', async () => {
    const res = await POST(postRequest({ locale: 'es' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid JSON', async () => {
    const res = await POST(postRequest('{'));
    expect(res.status).toBe(400);
  });

  it('returns 400 for oversized user text', async () => {
    const res = await POST(postRequest(chatBody('x'.repeat(10_000))));
    expect(res.status).toBe(400);
  });

  it('returns 400 for a path longer than 200 characters', async () => {
    const res = await POST(postRequest(chatBody('qué título tenés', 'es', `/${'a'.repeat(200)}`)));
    expect(res.status).toBe(400);
  });

  it('notes the viewing slug in the system prompt when path is a project detail', async () => {
    const res = await POST(postRequest(chatBody('qué título tenés', 'es', '/proyectos/apigen')));
    const payload = streamText.mock.calls[0]?.[0] as Record<string, unknown> | undefined;

    expect(res.status).toBe(200);
    expect(JSON.stringify(payload)).toContain('apigen');
    expect(JSON.stringify(payload)).toMatch(/viewing/i);
  });

  it('returns 403 with CSRF_ERROR_RESPONSE when CSRF verification fails', async () => {
    verifyCsrf.mockReturnValue(false);

    const res = await POST(postRequest(chatBody('qué título tenés')));
    const json = await res.json();

    expect(res.status).toBe(CSRF_ERROR_RESPONSE.status);
    expect(json).toEqual({ message: CSRF_ERROR_RESPONSE.message });
    expect(streamText).not.toHaveBeenCalled();
  });
});

describe('GET /api/qa', () => {
  it('returns 405', async () => {
    const res = await GET(new NextRequest('http://localhost/api/qa'));
    expect(res.status).toBe(405);
  });
});
