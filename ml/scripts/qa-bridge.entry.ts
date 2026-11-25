import { it } from 'vitest';
import { main } from './qa-bridge';

function bridgeArgs(value: unknown): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error('QA_BRIDGE_ARGS must be a JSON array of strings');
  }
  return value;
}

it('runs the qa bridge command', () => {
  const raw = process.env.QA_BRIDGE_ARGS;
  if (!raw) throw new Error('QA_BRIDGE_ARGS is required');
  main(bridgeArgs(JSON.parse(raw) as unknown));
});
