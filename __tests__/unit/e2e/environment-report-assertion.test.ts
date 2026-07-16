import { execFile as execFileCallback } from 'node:child_process';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

const execFile = promisify(execFileCallback);
const script = resolve(process.cwd(), 'e2e/scripts/assert-environment-report.mjs');

async function writeReport(report: unknown): Promise<string> {
  const directory = await mkdtemp(`${tmpdir()}/environment-report-`);
  const path = resolve(directory, 'environment-results.json');
  await writeFile(path, JSON.stringify(report), 'utf8');
  return path;
}

describe('post-E2E environment report assertion', () => {
  it('passes a complete provisioned CI report', async () => {
    const report = await writeReport({
      counts: { passed: 1, failed: 0, skipped: 0, blocked: 0 },
      entries: [{ type: 'environment', status: 'passed' }],
      incomplete: false,
    });

    const result = await execFile(process.execPath, [script, '--report', report], {
      env: { ...process.env, CI: 'true', PLAYWRIGHT_ENVIRONMENT_PROVISIONED: 'true' },
    });

    expect(result.stdout).toContain('Environment verification is complete');
  });

  it('fails a provisioned CI run when the report is blocked or incomplete', async () => {
    const report = await writeReport({
      counts: { passed: 0, failed: 0, skipped: 0, blocked: 1 },
      entries: [{ type: 'environment', status: 'blocked', reason: 'no reliable route hold available' }],
      incomplete: true,
    });

    await expect(execFile(process.execPath, [script, '--report', report], {
      env: { ...process.env, CI: 'true', PLAYWRIGHT_ENVIRONMENT_PROVISIONED: 'true' },
    })).rejects.toMatchObject({ code: 1 });
  });

  it('preserves local blocked reporting without failing the local command', async () => {
    const report = await writeReport({
      counts: { passed: 0, failed: 0, skipped: 0, blocked: 1 },
      entries: [{ type: 'environment', status: 'blocked', reason: 'Missing NEXT_PUBLIC_SANITY_DATASET' }],
      incomplete: true,
    });

    const result = await execFile(process.execPath, [script, '--report', report], {
      env: { ...process.env, CI: '', PLAYWRIGHT_ENVIRONMENT_PROVISIONED: '' },
    });

    expect(result.stdout).toContain('Missing NEXT_PUBLIC_SANITY_DATASET');
  });
});
