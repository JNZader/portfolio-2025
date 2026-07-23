import { test } from './test';
import {
  isSanityOptionalReason,
  preflightPortfolioServer,
  preflightSanityEnvironment,
} from './environment-status';

export async function skipIfPortfolioServerBlocked(): Promise<void> {
  const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL ?? 'http://localhost:3000';
  const result = await preflightPortfolioServer(baseUrl);
  if (result.status !== 'blocked') return;

  test.info().annotations.push({ type: 'environment', description: result.reason });
  test.skip(true, result.reason);
}

/**
 * Skip Sanity-dependent tests when Sanity is unavailable. Two skip modes:
 * - 'blocked': real credentials present but Sanity is broken — the run stays
 *   gated (the environment assert fails provisioned CI runs).
 * - 'skipped' (optional): no real secrets (Dependabot/fork PRs) — a NEUTRAL
 *   skip that the reporter must not count as blocked.
 */
export async function skipIfSanityEnvironmentBlocked(): Promise<void> {
  const result = await preflightSanityEnvironment(process.env);
  if (result.status === 'passed') return;

  const reason = 'reason' in result && result.reason ? result.reason : 'Sanity environment unavailable';
  if (result.status !== 'blocked' && !isSanityOptionalReason(reason)) return;

  test.info().annotations.push({ type: 'environment', description: reason });
  test.skip(true, reason);
}
