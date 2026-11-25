import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('local mode bundle boundary', () => {
  it('does not import Transformers.js from the chat UI or its hook', () => {
    const form = readFileSync('components/projects/PublishedQaForm.tsx', 'utf8');
    const hook = readFileSync('lib/qa/local/use-local-qa.ts', 'utf8');

    expect(form).not.toContain('@huggingface/transformers');
    expect(hook).not.toContain('@huggingface/transformers');
    expect(hook).toContain("import('@/lib/qa/local/engine')");
    expect(hook).toContain("import('@/lib/qa/local/run')");
    expect(hook).not.toContain("from '@/lib/qa/local/engine'");
    expect(hook).not.toContain("from '@/lib/qa/snapshot'");
  });
});
