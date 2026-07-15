import { describe, expect, it } from 'vitest';
import { classifyReporterTestOutcome } from '@/e2e/reporters/environment-reporter';

describe('environment reporter test classification', () => {
  it('classifies an environment-skipped test as blocked', () => {
    expect(classifyReporterTestOutcome({
      projectBlocked: true,
      status: 'skipped',
      environmentReason: 'Portfolio server unavailable',
      testId: 'blocked-test',
      testTitle: 'blocked test',
    })).toEqual({
      type: 'environment',
      status: 'blocked',
      reason: 'Portfolio server unavailable',
      testId: 'blocked-test',
      testTitle: 'blocked test',
    });
  });

  it('classifies a blocked project with no test result as blocked', () => {
    expect(classifyReporterTestOutcome({
      projectBlocked: true,
      environmentReason: 'Portfolio server unavailable',
    })).toEqual({
      type: 'environment',
      status: 'blocked',
      reason: 'Portfolio server unavailable',
    });
  });

  it('keeps a real failure visible even when its project is blocked', () => {
    expect(classifyReporterTestOutcome({
      projectBlocked: true,
      status: 'failed',
      testId: 'failed-test',
      testTitle: 'failed test',
    })).toEqual({ status: 'failed' });
  });

  it('keeps blocked and failed counts separate', () => {
    const outcomes = [
      classifyReporterTestOutcome({ projectBlocked: true, environmentReason: 'server unavailable' }),
      classifyReporterTestOutcome({ projectBlocked: true, status: 'failed' }),
    ];

    expect(outcomes.map((outcome) => outcome.status)).toEqual(['blocked', 'failed']);
  });
});
