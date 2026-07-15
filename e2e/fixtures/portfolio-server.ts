import { test } from './test';
import { preflightPortfolioServer, preflightSanityEnvironment } from './environment-status';

export async function skipIfPortfolioServerBlocked(): Promise<void> {
  const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL ?? 'http://localhost:3000';
  const result = await preflightPortfolioServer(baseUrl);
  if (result.status !== 'blocked') return;

  test.info().annotations.push({ type: 'environment', description: result.reason });
  test.skip(true, result.reason);
}

export async function skipIfSanityEnvironmentBlocked(): Promise<void> {
  const result = await preflightSanityEnvironment(process.env);
  if (result.status !== 'blocked') return;

  test.info().annotations.push({ type: 'environment', description: result.reason });
  test.skip(true, result.reason);
}
