import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// Batch 5 (quick wins): source-analysis guards for six mechanical fixes from
// the round-3 visual audit. These specs fail if any of the audited issues
// regresses: skeleton/page layout drift, hardcoded English strings, leftover
// raw palette classes, local SVG duplicates, and dead duplicate classes.

const readSource = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

const RAW_PALETTE_RE =
  /(text|bg|border|ring|from|to|via|fill|stroke)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+/;

// Documented exception: no warm-600 token exists, so the warm gradient keeps
// its `to-orange-600` stop. It is stripped before the palette assertion runs.
const PALETTE_ALLOWLIST: Record<string, RegExp> = {
  'components/ui/button.tsx': /to-orange-600/g,
};

const withoutAllowlist = (file: string) => {
  const allowlist = PALETTE_ALLOWLIST[file];
  const source = readSource(file);
  return allowlist ? source.replace(allowlist, '') : source;
};

const esMessages = JSON.parse(readSource('messages/es.json')) as Record<
  string,
  Record<string, string>
>;
const enMessages = JSON.parse(readSource('messages/en.json')) as Record<
  string,
  Record<string, string>
>;

describe('batch 5 / N-01: proyectos loading skeleton mirrors the real page', () => {
  const source = () => readSource('app/[locale]/(pages)/proyectos/loading.tsx');

  it('uses the shared Skeleton primitive', () => {
    expect(source()).toContain("from '@/components/ui/Skeleton'");
  });

  it('has no raw animate-pulse divs', () => {
    expect(source()).not.toContain('animate-pulse');
  });

  it('keeps hero + search/filter + card structure markers like the blog skeleton', () => {
    const src = source();
    expect(src).toContain('data-testid="proyectos-loading-hero"');
    expect(src).toContain('data-testid="proyectos-loading-search"');
    expect(src).toContain('data-testid="proyectos-loading-filter-control"');
    expect(src).toContain('data-testid="proyectos-loading-result-count"');
    expect(src).toContain('data-testid="proyectos-loading-card"');
  });

  it('mirrors the real page card grid and card image ratio', () => {
    const src = source();
    expect(src).toContain('md:grid-cols-2 lg:grid-cols-3');
    expect(src).toContain('h-48');
  });

  it('does not keep the old centered max-w-3xl hero or centered max-w-md search', () => {
    const src = source();
    expect(src).not.toContain('max-w-3xl mx-auto text-center');
    expect(src).not.toContain('max-w-md mx-auto');
  });
});

describe('batch 5 / N-02: private case study badge is i18n', () => {
  it('ProjectCard no longer hardcodes the English string', () => {
    expect(readSource('components/projects/ProjectCard.tsx')).not.toContain('Private Case Study');
  });

  it('ProjectCard reads the badge from the Projects namespace', () => {
    expect(readSource('components/projects/ProjectCard.tsx')).toContain("t('privateCaseStudy')");
  });

  it('both locales define the key with parity', () => {
    expect(esMessages.Projects.privateCaseStudy).toBe('Caso de Estudio Privado');
    expect(enMessages.Projects.privateCaseStudy).toBe('Private Case Study');
  });
});

describe('batch 5 / N-04: token sweep leftovers migrated', () => {
  const FILES = [
    'components/newsletter/NewsletterHero.tsx',
    'components/layout/Footer.tsx',
    'components/ui/button.tsx',
  ];

  for (const file of FILES) {
    it(`${file} has no raw palette color classes`, () => {
      expect(withoutAllowlist(file)).not.toMatch(RAW_PALETTE_RE);
    });
  }

  it('NewsletterHero uses success tokens for the subscribed state and benefits', () => {
    const source = readSource('components/newsletter/NewsletterHero.tsx');
    expect(source).toContain('bg-success');
    expect(source).toContain('text-success');
  });

  it('Footer heart uses the destructive token', () => {
    expect(readSource('components/layout/Footer.tsx')).toContain('text-destructive');
  });

  it('button warm/destructive variants use -foreground tokens, keeping the warm gradient stop', () => {
    const source = readSource('components/ui/button.tsx');
    expect(source).not.toContain('text-white');
    expect(source).toContain('text-accent-warm-foreground');
    expect(source).toContain('text-destructive-foreground');
    expect(source).toContain('to-orange-600');
  });
});

describe('batch 5 / N-05: InteriorHero decorative motifs are i18n', () => {
  it('motif strings come from message keys, not hardcoded literals', () => {
    const source = readSource('components/ui/InteriorHero.tsx');
    expect(source).toContain("t('projectsBadge')");
    expect(source).toContain("t('newsletterBadge')");
    expect(source).not.toContain('API / build / ship');
    expect(source).not.toContain('double opt-in');
  });

  it('both locales define the motif keys with parity', () => {
    for (const messages of [esMessages, enMessages]) {
      expect(typeof messages.InteriorHero.projectsBadge).toBe('string');
      expect(messages.InteriorHero.projectsBadge.length).toBeGreaterThan(0);
      expect(typeof messages.InteriorHero.newsletterBadge).toBe('string');
      expect(messages.InteriorHero.newsletterBadge.length).toBeGreaterThan(0);
    }
  });
});

describe('batch 5 / N-07: blog error icon uses lucide-react', () => {
  const source = () => readSource('app/[locale]/(pages)/blog/error.tsx');

  it('imports AlertTriangle from lucide-react', () => {
    const src = source();
    expect(src).toContain("from 'lucide-react'");
    expect(src).toContain('AlertTriangle');
  });

  it('no longer defines a local ExclamationIcon component', () => {
    expect(source()).not.toContain('ExclamationIcon');
  });
});

describe('batch 5 / N-09: data-request page has no dead duplicate border class', () => {
  it('no `border border` duplicate remains', () => {
    expect(readSource('app/[locale]/(pages)/data-request/page.tsx')).not.toContain(
      'border border '
    );
  });
});
