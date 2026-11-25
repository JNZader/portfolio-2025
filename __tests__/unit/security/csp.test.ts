import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildContentSecurityPolicy } from '@/lib/security/csp';

function directive(policy: string, name: string): string {
  const match = policy.split(';').find((part) => part.trim().startsWith(`${name} `));
  return match?.trim() ?? '';
}

describe('content security policy', () => {
  it('allows the local model runtime without opening script eval', () => {
    const policy = buildContentSecurityPolicy({ NODE_ENV: 'test' });
    const script = directive(policy, 'script-src');

    expect(script).toContain("'wasm-unsafe-eval'");
    expect(script).toContain("'unsafe-inline'");
    expect(script.split(' ')).not.toContain("'unsafe-eval'");
    expect(directive(policy, 'worker-src')).toBe("worker-src 'self' blob:");
    expect(directive(policy, 'connect-src')).toContain('https://huggingface.co');
    expect(directive(policy, 'connect-src')).toContain('https://hf.co');
    expect(directive(policy, 'connect-src')).toContain('https://*.huggingface.co');
    expect(directive(policy, 'connect-src')).toContain('https://*.hf.co');
    expect(directive(policy, 'frame-src')).toContain('https://giscus.app');
    expect(policy).not.toContain('upgrade-insecure-requests');
  });

  it('still upgrades insecure requests in production outside CI', () => {
    const policy = buildContentSecurityPolicy({ NODE_ENV: 'production' });

    expect(policy).toContain('upgrade-insecure-requests');
    expect(buildContentSecurityPolicy({ NODE_ENV: 'production', CI: 'true' })).not.toContain(
      'upgrade-insecure-requests'
    );
  });

  it('does not add COOP or COEP headers', () => {
    const source = readFileSync('next.config.ts', 'utf8');

    expect(source).not.toContain('Cross-Origin-Opener-Policy');
    expect(source).not.toContain('Cross-Origin-Embedder-Policy');
    expect(source).toContain('buildContentSecurityPolicy()');
  });
});
