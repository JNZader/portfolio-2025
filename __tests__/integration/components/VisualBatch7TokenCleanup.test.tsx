import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// Batch 7 (final token cleanup): assert that the last static Tailwind
// `var(--color-*)` arbitrary value bypasses are gone from the audited
// components, while leaving intentional dynamic/third-party CSS variable
// overrides untouched.

const readSource = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

const TOKEN_BYPASS_RE = /\[var\(--color-/;

const FILES = [
  'components/gdpr/DataRequestForm.tsx',
  'components/seo/Breadcrumbs.tsx',
];

describe('batch 7 / final token cleanup: no var(--color-*) Tailwind bypasses', () => {
  for (const file of FILES) {
    it(`${file} contains no [var(--color-*)] arbitrary Tailwind syntax`, () => {
      expect(readSource(file)).not.toMatch(TOKEN_BYPASS_RE);
    });
  }
});
