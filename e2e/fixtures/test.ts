import { test as base, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import {
  environmentReportPath,
  type EnvironmentResult,
} from './environment-status';

interface EnvironmentFixtures {
  environmentGuard: void;
}

interface PreflightFile {
  entries: EnvironmentResult[];
}

async function blockedProjectReason(project: string): Promise<string | undefined> {
  try {
    const raw = await readFile(environmentReportPath('environment-preflight.json'), 'utf8');
    const entries = (JSON.parse(raw) as PreflightFile).entries;
    return entries.find((entry) => entry.status === 'blocked' && entry.project === project)?.reason;
  } catch {
    return 'Environment preflight report was not generated';
  }
}

export const test = base.extend<EnvironmentFixtures>({
  environmentGuard: [async ({}, use, testInfo) => {
    const reason = await blockedProjectReason(testInfo.project.name);
    if (reason) {
      testInfo.annotations.push({ type: 'environment', description: reason });
      testInfo.skip(true, reason);
    }
    await use();
  }, { auto: true }],
});

export { expect };
export type { Locator, Page } from '@playwright/test';
