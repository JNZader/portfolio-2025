import { readFile } from 'node:fs/promises';
import process from 'node:process';

export function evaluateEnvironmentReport(report) {
  if (!report || typeof report !== 'object' || !report.counts || !Array.isArray(report.entries)) {
    return { ok: false, reason: 'Environment report is missing or malformed' };
  }

  if (report.incomplete === true || report.counts.blocked > 0) {
    const blockedReasons = report.entries
      .filter((entry) => entry?.status === 'blocked')
      .map((entry) => entry.reason)
      .filter(Boolean);
    const suffix = blockedReasons.length > 0 ? `: ${blockedReasons.join('; ')}` : '';
    return { ok: false, reason: `Environment verification is incomplete${suffix}` };
  }

  return { ok: true, reason: 'Environment verification is complete' };
}

function reportPathFromArgs() {
  const reportIndex = process.argv.indexOf('--report');
  if (reportIndex !== -1 && process.argv[reportIndex + 1]) return process.argv[reportIndex + 1];
  if (process.env.PLAYWRIGHT_ENVIRONMENT_REPORT) return process.env.PLAYWRIGHT_ENVIRONMENT_REPORT;
  if (process.env.PLAYWRIGHT_RUN_ID) {
    return `test-results/${process.env.PLAYWRIGHT_RUN_ID}/environment-results.json`;
  }
  return undefined;
}

async function main() {
  const reportPath = reportPathFromArgs();
  let report;
  try {
    if (!reportPath) throw new Error('PLAYWRIGHT_RUN_ID or --report is required');
    report = JSON.parse(await readFile(reportPath, 'utf8'));
  } catch (error) {
    report = {
      counts: { blocked: 1 },
      entries: [{ status: 'blocked', reason: error instanceof Error ? error.message : String(error) }],
      incomplete: true,
    };
  }

  const result = evaluateEnvironmentReport(report);
  process.stdout.write(`${result.reason}\n`);

  const provisionedCiRun = process.env.CI === 'true'
    && process.env.PLAYWRIGHT_ENVIRONMENT_PROVISIONED === 'true';
  if (!result.ok && provisionedCiRun) process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
