import { describe, expect, it } from 'vitest';
import robots from '@/app/robots';

const SENSITIVE_PATHS = [
  '/api/',
  '/admin/',
  '/en/admin/',
  '/private/',
  '/studio/',
  '/secret-achievements/',
  '/en/secret-achievements/',
];

describe('robots crawler policy', () => {
  it('keeps sensitive paths disallowed for every explicit crawler group', () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];

    for (const userAgent of ['*', 'GPTBot', 'ChatGPT-User']) {
      const rule = rules.find((candidate) => candidate.userAgent === userAgent);
      expect(rule?.allow).toBe('/');
      expect(rule?.disallow).toEqual(SENSITIVE_PATHS);
    }
  });

  it('retains the production host and sitemap URL', () => {
    const result = robots();

    expect(result.host).toBe('https://javierzader.com');
    expect(result.sitemap).toBe('https://javierzader.com/sitemap.xml');
  });
});
