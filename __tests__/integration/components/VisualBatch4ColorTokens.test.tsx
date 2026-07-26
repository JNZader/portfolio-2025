import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// Batch 4 migrates raw Tailwind palette color classes and remaining
// `[var(--color-*)]` arbitrary syntax to the semantic theme tokens defined in
// `app/globals.css`. These specs are source-analysis guards: they fail if any
// migrated file reintroduces raw palette utilities or arbitrary var() colors.

const readSource = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

const RAW_PALETTE_RE =
  /(text|bg|border|ring|from|to|via|fill|stroke)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+/;

// Intentional exceptions: the terminal/editor mock inside ProjectCard keeps a
// hard-coded dark terminal look by design. These substrings are stripped from
// the source before the raw-palette assertion runs.
const PALETTE_ALLOWLIST: Record<string, RegExp> = {
  'components/projects/ProjectCard.tsx': /(bg-gray-950|text-gray-300)/g,
};

const MIGRATED_FILES = [
  'app/[locale]/(pages)/admin/login/page.tsx',
  'app/[locale]/(pages)/admin/unauthorized/page.tsx',
  'components/admin/NewsletterBroadcaster.tsx',
  'components/gdpr/CookieConsent.tsx',
  'components/ui/ObfuscatedEmail.tsx',
  'app/[locale]/(pages)/secret-achievements/page.tsx',
  'components/projects/ProjectCard.tsx',
  'components/projects/ProjectDetail.tsx',
  'app/[locale]/(pages)/sobre-mi/page.tsx',
  'components/ui/SkillBadge.tsx',
  'app/[locale]/(pages)/privacy/PrivacyEn.tsx',
  'app/[locale]/(pages)/privacy/PrivacyEs.tsx',
  'app/[locale]/(pages)/privacy/email.tsx',
  'app/[locale]/(pages)/blog/[slug]/loading.tsx',
  'app/[locale]/(pages)/blog/error.tsx',
  'app/[locale]/(pages)/blog/[slug]/error.tsx',
];

describe('batch 4: raw Tailwind palette classes migrated to semantic tokens', () => {
  for (const file of MIGRATED_FILES) {
    it(`${file} has no raw palette color classes`, () => {
      const allowlist = PALETTE_ALLOWLIST[file];
      const source = allowlist ? readSource(file).replace(allowlist, '') : readSource(file);
      expect(source).not.toMatch(RAW_PALETTE_RE);
    });
  }
});

describe('batch 4: arbitrary [var(--color-*)] syntax migrated to token classes', () => {
  for (const file of MIGRATED_FILES) {
    it(`${file} has no [var(--color-…)] utilities`, () => {
      expect(readSource(file)).not.toContain('[var(--color-');
    });
  }
});

describe('batch 4: semantic token mappings applied', () => {
  it('admin login error block uses destructive tokens', () => {
    const source = readSource('app/[locale]/(pages)/admin/login/page.tsx');
    expect(source).toContain('border-destructive/20');
    expect(source).toContain('bg-destructive/10');
    expect(source).toContain('text-destructive');
  });

  it('NewsletterBroadcaster info callout uses info tokens', () => {
    const source = readSource('components/admin/NewsletterBroadcaster.tsx');
    expect(source).toContain('bg-info/10');
    expect(source).toContain('border-info/30');
    expect(source).toContain('text-info');
  });

  it('NewsletterBroadcaster danger buttons use destructive foreground for labels', () => {
    const source = readSource('components/admin/NewsletterBroadcaster.tsx');
    expect(source).toContain('text-destructive-foreground');
    expect(source).not.toContain('text-white');
  });

  it('featured star uses warning tokens in ProjectCard and ProjectDetail', () => {
    expect(readSource('components/projects/ProjectCard.tsx')).toContain(
      'fill-warning text-warning'
    );
    expect(readSource('components/projects/ProjectDetail.tsx')).toContain(
      'fill-warning text-warning'
    );
  });

  it('shared ProjectVisual terminal mock keeps its intentional dark look', () => {
    const source = readSource('components/projects/ProjectVisual.tsx');
    expect(source).toContain('bg-gray-950');
    expect(source).toContain('text-gray-300');
  });

  it('sobre-mi is a server redirect without obsolete page styling', () => {
    const source = readSource('app/[locale]/(pages)/sobre-mi/page.tsx');
    expect(source).toContain('permanentRedirect');
    expect(source).not.toContain('border-accent-warm');
    expect(source).not.toContain('border-success');
    expect(source).not.toContain('border-info');
  });
});
