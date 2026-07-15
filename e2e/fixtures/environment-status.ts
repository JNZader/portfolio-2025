const ENVIRONMENT_STATUS_VALUES = {
  PASSED: 'passed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
  BLOCKED: 'blocked',
} as const;

export const ENVIRONMENT_STATUS = ENVIRONMENT_STATUS_VALUES;
export type EnvironmentStatus = (typeof ENVIRONMENT_STATUS_VALUES)[keyof typeof ENVIRONMENT_STATUS_VALUES];

export interface EnvironmentBlockedStatus {
  type: 'environment';
  check?: 'build' | 'server';
  status: typeof ENVIRONMENT_STATUS.BLOCKED;
  reason: string;
  project?: string;
  testId?: string;
  testTitle?: string;
}

export interface EnvironmentCheckStatus {
  type: 'environment';
  check?: 'build' | 'server';
  status: Exclude<EnvironmentStatus, typeof ENVIRONMENT_STATUS.BLOCKED>;
  reason?: string;
  project?: string;
  testId?: string;
  testTitle?: string;
}

export type EnvironmentResult = EnvironmentBlockedStatus | EnvironmentCheckStatus;

export interface EnvironmentCounts {
  passed: number;
  failed: number;
  skipped: number;
  blocked: number;
}

export interface EnvironmentReport {
  counts: EnvironmentCounts;
  entries: EnvironmentResult[];
  incomplete: boolean;
}

export interface BuildVerificationResult {
  status: Extract<EnvironmentStatus, 'passed' | 'failed'>;
  reason?: string;
}

export interface BrowserProject {
  name: string;
  browser: 'chromium' | 'firefox' | 'webkit';
}

export const configuredBrowserProjects: readonly BrowserProject[] = [
  { name: 'chromium', browser: 'chromium' },
  { name: 'firefox', browser: 'firefox' },
  { name: 'webkit', browser: 'webkit' },
  { name: 'mobile-chrome', browser: 'chromium' },
  { name: 'mobile-safari', browser: 'webkit' },
];

export function createEnvironmentBlocked(reason: string, project?: string): EnvironmentBlockedStatus {
  return {
    type: 'environment',
    status: ENVIRONMENT_STATUS.BLOCKED,
    reason,
    ...(project ? { project } : {}),
  };
}

export function preflightSanityEnvironment(
  env: Readonly<Record<string, string | undefined>>,
  fetcher: typeof fetch = fetch
): Promise<EnvironmentResult> {
  if (!env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return Promise.resolve(createEnvironmentBlocked('Missing NEXT_PUBLIC_SANITY_PROJECT_ID'));
  }
  if (!env.NEXT_PUBLIC_SANITY_DATASET) {
    return Promise.resolve(createEnvironmentBlocked('Missing NEXT_PUBLIC_SANITY_DATASET'));
  }
  if (!/^[a-z0-9_-]+$/i.test(env.NEXT_PUBLIC_SANITY_PROJECT_ID) || !/^[a-z0-9_-]+$/i.test(env.NEXT_PUBLIC_SANITY_DATASET)) {
    return Promise.resolve(createEnvironmentBlocked('Invalid Sanity project or dataset identifier'));
  }

  const endpoint = `https://${env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v2025-05-01/data/query/${env.NEXT_PUBLIC_SANITY_DATASET}?query=*%5B_type%20%3D%3D%20%22project%22%5D%5B0%5D%7B_id,title,slug%7D`;
  return fetcher(endpoint, { signal: AbortSignal.timeout(5000) })
    .then(async (response) => {
      if (!response.ok) return createEnvironmentBlocked(`Sanity representative fetch failed: HTTP ${response.status}`);
      try {
        const payload: unknown = await response.json();
        if (!isUsableSanityProjectResponse(payload)) {
          return createEnvironmentBlocked('Sanity representative fetch returned no usable project data');
        }
        return { type: 'environment', status: ENVIRONMENT_STATUS.PASSED } satisfies EnvironmentCheckStatus;
      } catch {
        return createEnvironmentBlocked('Sanity representative fetch returned invalid project data');
      }
    })
    .catch(() => createEnvironmentBlocked('Sanity representative fetch failed: network or timeout error'));
}

function isUsableSanityProjectResponse(payload: unknown): boolean {
  if (typeof payload !== 'object' || payload === null || !('result' in payload)) return false;
  const result = payload.result;
  if (typeof result !== 'object' || result === null || !('_id' in result)) return false;
  const id = result._id;
  const title = 'title' in result ? result.title : undefined;
  const slug = 'slug' in result ? result.slug : undefined;
  return typeof id === 'string' && id.length > 0
    && (typeof title === 'string' && title.length > 0
      || (typeof slug === 'object' && slug !== null && 'current' in slug && typeof slug.current === 'string' && slug.current.length > 0));
}

/**
 * Build verification consumes the result of an already-run build. Playwright
 * setup owns preflight only; CI/maintainers own `npm run build` execution.
 * This avoids recursive setup/build execution and never invents a result.
 */
export function preflightBuildEnvironment(
  env: Readonly<Record<string, string | undefined>>,
  buildResult?: BuildVerificationResult
): EnvironmentResult {
  if (!env.NEXT_PUBLIC_SANITY_DATASET) {
    return {
      type: 'environment',
      check: 'build',
      status: ENVIRONMENT_STATUS.BLOCKED,
      reason: 'npm run build blocked: missing NEXT_PUBLIC_SANITY_DATASET',
    };
  }
  if (!env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return {
      type: 'environment',
      check: 'build',
      status: ENVIRONMENT_STATUS.BLOCKED,
      reason: 'npm run build blocked: missing NEXT_PUBLIC_SANITY_PROJECT_ID',
    };
  }
  if (!buildResult) {
    return {
      type: 'environment',
      check: 'build',
      status: ENVIRONMENT_STATUS.BLOCKED,
      reason: 'npm run build blocked: build verification result unavailable',
    };
  }
  return {
    type: 'environment',
    check: 'build',
    status: buildResult.status,
    ...(buildResult.reason ? { reason: buildResult.reason } : {}),
  };
}

export async function preflightPortfolioServer(
  baseUrl: string,
  fetcher: typeof fetch = fetch
): Promise<EnvironmentResult> {
  try {
    const response = await fetcher(`${baseUrl}/`, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) {
      return {
        type: 'environment',
        check: 'server',
        status: ENVIRONMENT_STATUS.BLOCKED,
        reason: `Portfolio app identity check failed at ${baseUrl}: HTTP ${response.status}`,
      };
    }

    const body = await response.text();
    if (!body.includes('>JZ<') || !body.includes('data-testid="hero-terminal"')) {
      return {
        type: 'environment',
        check: 'server',
        status: ENVIRONMENT_STATUS.BLOCKED,
        reason: `Server at ${baseUrl} is not the portfolio app: expected homepage marker JZ/hero-terminal`,
      };
    }

    return { type: 'environment', status: ENVIRONMENT_STATUS.PASSED };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return {
      type: 'environment',
      check: 'server',
      status: ENVIRONMENT_STATUS.BLOCKED,
      reason: `Portfolio server unavailable at ${baseUrl}: ${reason}`,
    };
  }
}

export function blockProjectsForEnvironment(
  result: EnvironmentResult,
  projects: readonly BrowserProject[]
): EnvironmentResult[] {
  if (result.status !== ENVIRONMENT_STATUS.BLOCKED || result.check !== 'server') return [result];
  return projects.map((project) => ({ ...result, project: project.name }));
}

const RUN_ID = process.env.PLAYWRIGHT_RUN_ID ?? `${Date.now()}-${process.pid}`;

export function environmentRunId(): string {
  return RUN_ID;
}

export function environmentReportPath(fileName: string): string {
  return `test-results/${environmentRunId()}/${fileName}`;
}

export async function preflightBrowserProjects(
  launch: (browser: BrowserProject['browser']) => Promise<void>,
  projects: readonly BrowserProject[] = configuredBrowserProjects
): Promise<EnvironmentResult[]> {
  return Promise.all(
    projects.map(async (project) => {
      try {
        await launch(project.browser);
        return {
          type: 'environment',
          status: ENVIRONMENT_STATUS.PASSED,
          project: project.name,
        } satisfies EnvironmentCheckStatus;
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        return createEnvironmentBlocked(`Unable to launch ${project.browser}: ${reason}`, project.name);
      }
    })
  );
}

export function summarizeEnvironmentResults(results: Array<EnvironmentResult | { status: EnvironmentStatus }>): EnvironmentReport {
  const counts: EnvironmentCounts = { passed: 0, failed: 0, skipped: 0, blocked: 0 };
  const entries: EnvironmentResult[] = [];
  for (const result of results) {
    counts[result.status] += 1;
    if ('type' in result) entries.push(result);
  }
  return { counts, entries, incomplete: counts.blocked > 0 };
}
