import { mkdir, readFile, writeFile } from 'node:fs/promises';
import type { FullConfig, Reporter, TestCase, TestResult, Suite } from '@playwright/test/reporter';
import {
  isSanityOptionalReason,
  summarizeEnvironmentResults,
  type EnvironmentResult,
  type EnvironmentReport,
  environmentReportPath,
} from '../fixtures/environment-status';

interface PreflightFile {
  entries: EnvironmentResult[];
}

export interface ReporterTestOutcome {
  status?: TestResult['status'];
  environmentReason?: string;
  projectBlocked: boolean;
  testId?: string;
  testTitle?: string;
}

export function classifyReporterTestOutcome(outcome: ReporterTestOutcome): EnvironmentResult | { status: EnvironmentResult['status'] } {
  const status = outcome.status === 'timedOut' || outcome.status === 'interrupted'
    ? 'failed'
    : outcome.status;

  if (status === 'passed' && outcome.projectBlocked) {
    return {
      type: 'environment',
      status: 'blocked',
      reason: outcome.environmentReason ?? 'Environment prevented test execution',
      ...(outcome.testId ? { testId: outcome.testId } : {}),
      ...(outcome.testTitle ? { testTitle: outcome.testTitle } : {}),
    };
  }

  if (status === undefined && outcome.projectBlocked) {
    return {
      type: 'environment',
      status: 'blocked',
      reason: outcome.environmentReason ?? 'Environment prevented test execution',
      ...(outcome.testId ? { testId: outcome.testId } : {}),
      ...(outcome.testTitle ? { testTitle: outcome.testTitle } : {}),
    };
  }

  if (status === 'skipped' && outcome.environmentReason) {
    // An optional-Sanity skip is NEUTRAL (no real secrets on Dependabot/fork
    // PRs): reporting it as blocked would turn every such PR's E2E red by
    // construction. Any other environment skip remains blocked.
    if (isSanityOptionalReason(outcome.environmentReason)) {
      return {
        type: 'environment',
        status: 'skipped',
        reason: outcome.environmentReason,
        ...(outcome.testId ? { testId: outcome.testId } : {}),
        ...(outcome.testTitle ? { testTitle: outcome.testTitle } : {}),
      };
    }
    return {
      type: 'environment',
      status: 'blocked',
      reason: outcome.environmentReason,
      ...(outcome.testId ? { testId: outcome.testId } : {}),
      ...(outcome.testTitle ? { testTitle: outcome.testTitle } : {}),
    };
  }

  return { status: status ?? 'skipped' };
}

export default class EnvironmentReporter implements Reporter {
  private readonly results = new Map<string, { test: TestCase; result: TestResult }>();
  private suite?: Suite;

  onBegin(_config: FullConfig, suite: Suite): void {
    this.suite = suite;
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    this.results.set(test.id, { test, result });
  }

  async onEnd(): Promise<void> {
    let preflight: EnvironmentResult[] = [];
    try {
      const raw = await readFile(environmentReportPath('environment-preflight.json'), 'utf8');
      preflight = (JSON.parse(raw) as PreflightFile).entries;
    } catch {
      preflight = [
        {
          type: 'environment',
          status: 'blocked',
          reason: 'Environment preflight report was not generated',
        },
      ];
    }
    const blockedProjects = new Map(
      preflight.filter((entry) => entry.status === 'blocked' && entry.project).map((entry) => [entry.project!, entry])
    );
    const results: Array<EnvironmentResult | { status: EnvironmentResult['status'] }> = [];
    for (const test of this.suite?.allTests() ?? []) {
      const project = test.parent.project()?.name;
      const blocked = project ? blockedProjects.get(project) : undefined;
      if (blocked && !this.results.has(test.id)) {
        results.push({ ...blocked, testId: test.id, testTitle: test.title });
      }
    }
    for (const { test, result } of this.results.values()) {
      const annotationReason = test.annotations.find((annotation) => annotation.type === 'environment')?.description;
      const project = test.parent.project()?.name;
      const blocked = project ? blockedProjects.get(project) : undefined;
      const projectBlocked = blocked !== undefined;
    results.push(classifyReporterTestOutcome({
      status: result.status,
      environmentReason: blocked?.reason ?? annotationReason,
        projectBlocked,
        testId: test.id,
        testTitle: test.title,
      }));
    }
    results.push(...preflight);
    const report: EnvironmentReport = summarizeEnvironmentResults(results);
    await mkdir(environmentReportPath('.').replace('/.', ''), { recursive: true });
    await writeFile(environmentReportPath('environment-results.json'), JSON.stringify(report, null, 2), 'utf8');
    process.stdout.write(`Environment results: ${JSON.stringify(report.counts)}\n`);
    if (report.incomplete) process.stdout.write('Environment verification is incomplete; blocked checks are not passes.\n');
  }
}
