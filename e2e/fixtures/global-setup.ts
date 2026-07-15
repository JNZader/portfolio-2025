import { chromium, firefox, webkit, type FullConfig } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import {
  configuredBrowserProjects,
  preflightBrowserProjects,
  preflightBuildEnvironment,
  preflightPortfolioServer,
  preflightSanityEnvironment,
  blockProjectsForEnvironment,
  type BrowserProject,
  type EnvironmentResult,
  environmentReportPath,
} from './environment-status';

const launchers = { chromium, firefox, webkit } as const;

function browserProjectsFromConfig(config: FullConfig): BrowserProject[] {
  return config.projects.map(({ name }) => {
    const configured = configuredBrowserProjects.find((project) => project.name === name);
    if (configured) return configured;
    const browser = name.includes('firefox') ? 'firefox' : name.includes('webkit') ? 'webkit' : 'chromium';
    return { name, browser };
  });
}

export default async function globalSetup(config: FullConfig): Promise<void> {
  const browserResults = await preflightBrowserProjects(
    async (browser) => {
      const instance = await launchers[browser].launch({ headless: true });
      await instance.close();
    },
    browserProjectsFromConfig(config)
  );
  const serverResult = await preflightPortfolioServer(process.env.PLAYWRIGHT_TEST_BASE_URL ?? 'http://localhost:3000');
  const buildResult = process.env.PLAYWRIGHT_BUILD_RESULT === 'passed' || process.env.PLAYWRIGHT_BUILD_RESULT === 'failed'
    ? {
        status: process.env.PLAYWRIGHT_BUILD_RESULT,
        ...(process.env.PLAYWRIGHT_BUILD_REASON ? { reason: process.env.PLAYWRIGHT_BUILD_REASON } : {}),
      } as const
    : undefined;
  const entries: EnvironmentResult[] = [
    await preflightSanityEnvironment(process.env),
    preflightBuildEnvironment(process.env, buildResult),
    ...blockProjectsForEnvironment(serverResult, browserProjectsFromConfig(config)),
    ...browserResults,
  ];
  await mkdir(environmentReportPath('.').replace('/.', ''), { recursive: true });
  await writeFile(
    environmentReportPath('environment-preflight.json'),
    JSON.stringify({ entries }, null, 2),
    'utf8'
  );
}
