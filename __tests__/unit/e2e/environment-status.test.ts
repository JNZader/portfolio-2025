import { describe, expect, it } from 'vitest';
import {
  ENVIRONMENT_STATUS,
  createEnvironmentBlocked,
  blockProjectsForEnvironment,
  isSanityOptionalReason,
  preflightBuildEnvironment,
  preflightPortfolioServer,
  preflightSanityEnvironment,
  summarizeEnvironmentResults,
} from '@/e2e/fixtures/environment-status';

describe('environment status reporting', () => {
  it('creates a typed blocked status without treating it as a pass', () => {
    const blocked = createEnvironmentBlocked('Firefox executable is unavailable', 'firefox');

    expect(blocked).toEqual({
      type: 'environment',
      status: ENVIRONMENT_STATUS.BLOCKED,
      reason: 'Firefox executable is unavailable',
      project: 'firefox',
    });
  });

  it('blocks Sanity checks when either required variable is missing', async () => {
    expect(await preflightSanityEnvironment({ NEXT_PUBLIC_SANITY_PROJECT_ID: 'project' })).toEqual({
      type: 'environment',
      status: 'blocked',
      reason: 'Missing NEXT_PUBLIC_SANITY_DATASET',
    });
  });

  it('blocks Sanity when a safe representative connection fails', async () => {
    expect(await preflightSanityEnvironment(
        { NEXT_PUBLIC_SANITY_PROJECT_ID: 'project', NEXT_PUBLIC_SANITY_DATASET: 'production' },
        async () => {
          throw new Error('connection refused');
        }
      )).toEqual({
      type: 'environment',
      status: 'blocked',
      reason: 'Sanity representative fetch failed: network or timeout error',
    });
  });

  it('blocks an HTTP 200 Sanity response when no usable project data is returned', async () => {
    expect(await preflightSanityEnvironment(
      { NEXT_PUBLIC_SANITY_PROJECT_ID: 'project', NEXT_PUBLIC_SANITY_DATASET: 'production' },
      async () => new Response(JSON.stringify({ result: null }), { status: 200 })
    )).toEqual({
      type: 'environment',
      status: 'blocked',
      reason: 'Sanity representative fetch returned no usable project data',
    });
  });

  it('passes a representative Sanity response with usable project data', async () => {
    expect(await preflightSanityEnvironment(
      { NEXT_PUBLIC_SANITY_PROJECT_ID: 'project', NEXT_PUBLIC_SANITY_DATASET: 'production' },
      async () => new Response(JSON.stringify({ result: { _id: 'project-1', title: 'APiGen' } }), { status: 200 })
    )).toEqual({ type: 'environment', status: 'passed' });
  });

  it('skips Sanity checks as neutral when optional and CI placeholder credentials are in use', async () => {
    let fetchCalled = false;
    const result = await preflightSanityEnvironment(
      {
        NEXT_PUBLIC_SANITY_PROJECT_ID: 'dummy-project-id',
        NEXT_PUBLIC_SANITY_DATASET: 'production',
        PLAYWRIGHT_SANITY_OPTIONAL: 'true',
      },
      async () => {
        fetchCalled = true;
        throw new Error('must not fetch placeholder credentials');
      }
    );

    expect(result.status).toBe('skipped');
    expect(fetchCalled).toBe(false);
    expect(isSanityOptionalReason(result.status === 'skipped' ? result.reason : undefined)).toBe(true);
  });

  it('skips Sanity checks as neutral when optional and the project id is missing', async () => {
    const result = await preflightSanityEnvironment(
      { PLAYWRIGHT_SANITY_OPTIONAL: 'true' },
      async () => {
        throw new Error('must not fetch without credentials');
      }
    );

    expect(result.status).toBe('skipped');
    expect(isSanityOptionalReason(result.status === 'skipped' ? result.reason : undefined)).toBe(true);
  });

  it('still blocks a real Sanity outage when optional but a real project id is configured', async () => {
    const result = await preflightSanityEnvironment(
      {
        NEXT_PUBLIC_SANITY_PROJECT_ID: 'realproject',
        NEXT_PUBLIC_SANITY_DATASET: 'production',
        PLAYWRIGHT_SANITY_OPTIONAL: 'true',
      },
      async () => {
        throw new Error('connection refused');
      }
    );

    expect(result).toEqual({
      type: 'environment',
      status: 'blocked',
      reason: 'Sanity representative fetch failed: network or timeout error',
    });
  });

  it('blocks placeholder credentials when NOT optional (gate unchanged for provisioned runs)', async () => {
    const result = await preflightSanityEnvironment(
      { NEXT_PUBLIC_SANITY_PROJECT_ID: 'dummy-project-id', NEXT_PUBLIC_SANITY_DATASET: 'production' },
      async () => {
        throw new Error('connection refused');
      }
    );

    expect(result.status).toBe('blocked');
    expect(isSanityOptionalReason(result.status === 'blocked' ? result.reason : undefined)).toBe(false);
  });

  it('reports the known production build prerequisite block without running the build', async () => {
    expect(await preflightBuildEnvironment({})).toEqual({
      type: 'environment',
      check: 'build',
      status: 'blocked',
      reason: 'npm run build blocked: missing NEXT_PUBLIC_SANITY_DATASET',
    });
  });

  it('requires both Sanity prerequisites before build verification can pass', () => {
    expect(preflightBuildEnvironment({ NEXT_PUBLIC_SANITY_DATASET: 'production' })).toEqual({
      type: 'environment',
      check: 'build',
      status: 'blocked',
      reason: 'npm run build blocked: missing NEXT_PUBLIC_SANITY_PROJECT_ID',
    });
  });

  it('blocks build verification when prerequisites exist but no build result was supplied', () => {
    expect(preflightBuildEnvironment({
      NEXT_PUBLIC_SANITY_PROJECT_ID: 'project',
      NEXT_PUBLIC_SANITY_DATASET: 'production',
    })).toEqual({
      type: 'environment',
      check: 'build',
      status: 'blocked',
      reason: 'npm run build blocked: build verification result unavailable',
    });
  });

  it('reports an actual build result only after prerequisites are satisfied', () => {
    expect(preflightBuildEnvironment(
      { NEXT_PUBLIC_SANITY_PROJECT_ID: 'project', NEXT_PUBLIC_SANITY_DATASET: 'production' },
      { status: 'passed' }
    )).toEqual({ type: 'environment', check: 'build', status: 'passed' });
    expect(preflightBuildEnvironment(
      { NEXT_PUBLIC_SANITY_PROJECT_ID: 'project', NEXT_PUBLIC_SANITY_DATASET: 'production' },
      { status: 'failed', reason: 'next build exited with code 1' }
    )).toEqual({
      type: 'environment',
      check: 'build',
      status: 'failed',
      reason: 'next build exited with code 1',
    });
  });

  it('blocks a reachable server that is not the portfolio app with an exact identity reason', async () => {
    expect(await preflightPortfolioServer('http://localhost:3000', async () => new Response('404 page not found', { status: 404 }))).toEqual({
      type: 'environment',
      check: 'server',
      status: 'blocked',
      reason: 'Portfolio app identity check failed at http://localhost:3000: HTTP 404',
    });
  });

  it('passes the portfolio server identity check only when its homepage marker is present', async () => {
    expect(await preflightPortfolioServer(
      'http://localhost:3001',
      async () => new Response('<html><body><span>JZ</span><div data-testid="hero-terminal"></div></body></html>', { status: 200 })
    )).toEqual({ type: 'environment', status: 'passed' });
  });

  it('blocks an unavailable portfolio server instead of producing a test failure', async () => {
    expect(await preflightPortfolioServer('http://localhost:3002', async () => {
      throw new Error('connect ECONNREFUSED');
    })).toEqual({
      type: 'environment',
      check: 'server',
      status: 'blocked',
      reason: 'Portfolio server unavailable at http://localhost:3002: connect ECONNREFUSED',
    });
  });

  it('fans a blocked server result out to every configured project', () => {
    const result = blockProjectsForEnvironment(
      { ...createEnvironmentBlocked('stale server'), check: 'server' },
      [{ name: 'chromium', browser: 'chromium' }, { name: 'mobile-safari', browser: 'webkit' }]
    );

    expect(result).toEqual([
      { type: 'environment', status: 'blocked', check: 'server', reason: 'stale server', project: 'chromium' },
      { type: 'environment', status: 'blocked', check: 'server', reason: 'stale server', project: 'mobile-safari' },
    ]);
  });

  it('keeps passed, failed, skipped, and blocked counts separate', () => {
    const report = summarizeEnvironmentResults([
      { status: 'passed' },
      { status: 'failed' },
      { status: 'skipped' },
      createEnvironmentBlocked('Browser launch failed', 'webkit'),
    ]);

    expect(report.counts).toEqual({ passed: 1, failed: 1, skipped: 1, blocked: 1 });
    expect(report.incomplete).toBe(true);
  });
});
