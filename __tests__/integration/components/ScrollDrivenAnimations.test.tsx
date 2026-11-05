import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { render } from '@/__tests__/test-utils';
import { RevealOnScroll } from '@/components/animations';
import { ScrollProgress } from '@/components/ui/ScrollProgress';

// Source-guard suite for the CSS scroll-driven-animations change, following
// the VisualBatch5QuickWins precedent: readFileSync + structural string
// assertions, no CSS parser dependency. happy-dom renders markup and inline
// style attributes (assertable) but runs neither scroll timelines nor
// media-conditioned animation application — engine behavior is covered by
// the e2e reduce tripwire and documented manual checks, NOT by this file
// (honesty clause, design AD-5).

const readSource = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

/**
 * Numeric constant from RevealOnScroll.tsx — the single source every
 * range-literal assertion in this suite derives from (lockstep with the CSS
 * fallbacks, so sanctioned tuning moves assertions instead of failing them).
 */
function revealConstant(name: string): number {
  const tsSource = readSource('components/animations/RevealOnScroll.tsx');
  const match = tsSource.match(new RegExp(`const ${name} = (\\d+(?:\\.\\d+)?)`));
  expect(match, `${name} must be declared in RevealOnScroll.tsx`).not.toBeNull();
  return Number(match?.[1]);
}

/** All indices of `needle` in `source` (non-overlapping). */
function indicesOf(source: string, needle: string): number[] {
  const indices: number[] = [];
  let at = source.indexOf(needle);
  while (at !== -1) {
    indices.push(at);
    at = source.indexOf(needle, at + needle.length);
  }
  return indices;
}

/**
 * Extract the brace-balanced block starting at the first `{` at/after
 * `startIndex` (returns the block including its braces). Comments in this
 * file contain no braces (verified), so raw-source matching is safe.
 */
function extractBlock(source: string, startIndex: number): string {
  const open = source.indexOf('{', startIndex);
  if (open === -1) return '';
  let depth = 0;
  for (let i = open; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    else if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(open, i + 1);
    }
  }
  return source.slice(open);
}

const stripComments = (block: string) => block.replace(/\/\*[\s\S]*?\*\//g, '');

/** Declaration lines (`prop: value;`) of a stripped block — selectors and braces removed. */
function declarationLines(block: string): string[] {
  return stripComments(block)
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.endsWith('{') && line !== '}');
}

describe('RevealOnScroll server wrapper', () => {
  it('1. renders a div merging the reveal base class with the passed className (cn contract)', () => {
    const { container } = render(
      <RevealOnScroll className="space-y-6">
        <p>content</p>
      </RevealOnScroll>
    );
    const div = container.firstElementChild as HTMLElement;
    expect(div.tagName).toBe('DIV');
    expect(div.className).toContain('reveal');
    expect(div.className).toContain('space-y-6');
  });

  it('2. sets data-slot="reveal"', () => {
    const { container } = render(
      <RevealOnScroll>
        <p>content</p>
      </RevealOnScroll>
    );
    expect((container.firstElementChild as HTMLElement).getAttribute('data-slot')).toBe('reveal');
  });

  it('3. delay={0.2} emits the stagger custom properties 40% / 20% (spec literals)', () => {
    const { container } = render(
      <RevealOnScroll delay={0.2}>
        <p>content</p>
      </RevealOnScroll>
    );
    const style = (container.firstElementChild as HTMLElement).getAttribute('style');
    expect(style).not.toBeNull();
    expect(style).toContain('--reveal-range-start: 40%');
    expect(style).toContain('--reveal-tall-start: 20%');
  });

  it('4. delay={0.3} derives 55% / 25% — pins the formula, defeats hardcoding', () => {
    const { container } = render(
      <RevealOnScroll delay={0.3}>
        <p>content</p>
      </RevealOnScroll>
    );
    const style = (container.firstElementChild as HTMLElement).getAttribute('style');
    expect(style).not.toBeNull();
    expect(style).toContain('--reveal-range-start: 55%');
    expect(style).toContain('--reveal-tall-start: 25%');
  });

  it('5. without delay: no style attribute at all', () => {
    const { container } = render(
      <RevealOnScroll>
        <p>content</p>
      </RevealOnScroll>
    );
    expect((container.firstElementChild as HTMLElement).getAttribute('style')).toBeNull();
  });

  it('6. with delay={0}: no style attribute', () => {
    const { container } = render(
      <RevealOnScroll delay={0}>
        <p>content</p>
      </RevealOnScroll>
    );
    expect((container.firstElementChild as HTMLElement).getAttribute('style')).toBeNull();
  });

  it('7. any emitted style carries no inline hidden state (opacity/transform/transition)', () => {
    for (const delay of [0.2, 0.3]) {
      const { container } = render(
        <RevealOnScroll delay={delay}>
          <p>content</p>
        </RevealOnScroll>
      );
      const style = (container.firstElementChild as HTMLElement).getAttribute('style');
      expect(style, `delay={${delay}} style`).not.toBeNull();
      expect(style, `delay={${delay}} opacity`).not.toContain('opacity:');
      expect(style, `delay={${delay}} transform`).not.toContain('transform:');
      expect(style, `delay={${delay}} transition`).not.toContain('transition');
    }
  });

  it('8. source guard: server component, no hooks/IO, cn from @/lib/utils, no Variants/StaggeredReveal', () => {
    const source = readSource('components/animations/RevealOnScroll.tsx');
    expect(source).not.toContain("'use client'");
    expect(source).not.toMatch(/useEffect|useState|useRef/);
    expect(source).not.toContain('IntersectionObserver');
    expect(source).not.toContain('useScrollReveal');
    expect(source).toContain("import { cn } from '@/lib/utils'");
    expect(source).not.toContain('Variants');
    expect(source).not.toContain('StaggeredReveal');
  });

  it('9. index.ts is the trimmed single re-export — the module path survives', () => {
    expect(readSource('components/animations/index.ts').trim()).toBe(
      "export { RevealOnScroll } from './RevealOnScroll';"
    );
  });

  it('10. deleted surface: useScrollReveal and AnimationProvider are gone', () => {
    expect(existsSync(resolve(process.cwd(), 'hooks/useScrollReveal.ts'))).toBe(false);
    expect(existsSync(resolve(process.cwd(), 'components/animations/AnimationProvider.tsx'))).toBe(
      false
    );
  });
});

describe('ScrollProgress server component', () => {
  it('11. renders the fixed overlay wrapper with aria-hidden and the print guard', () => {
    const { container } = render(<ScrollProgress />);
    const outer = container.firstElementChild as HTMLElement;
    expect(outer.getAttribute('aria-hidden')).toBe('true');
    for (const cls of ['fixed', 'top-0', 'z-50', 'h-1', 'bg-border/30', 'print:hidden']) {
      expect(outer.className, cls).toContain(cls);
    }
  });

  it('12. renders exactly one inner bar with scroll-progress-bar and the sanctioned gradient', () => {
    const { container } = render(<ScrollProgress />);
    const outer = container.firstElementChild as HTMLElement;
    expect(outer.children).toHaveLength(1);
    const bar = outer.firstElementChild as HTMLElement;
    for (const cls of [
      'scroll-progress-bar',
      'h-full',
      'bg-gradient-to-r',
      'from-primary',
      'via-primary/80',
      'to-tertiary',
    ]) {
      expect(bar.className, cls).toContain(cls);
    }
  });

  it('13. no style attribute anywhere in the rendered output (no inline width%)', () => {
    const { container } = render(<ScrollProgress />);
    expect(container.innerHTML).not.toContain('style=');
  });

  it('14. source guard: no client directive, no scroll listener, no state, no dynamic import', () => {
    const source = readSource('components/ui/ScrollProgress.tsx');
    expect(source).not.toContain("'use client'");
    expect(source).not.toContain('addEventListener');
    expect(source).not.toMatch(/useState|useEffect/);
    expect(source).not.toContain('next/dynamic');
  });

  it('15. source guard: ClientComponents no longer references ScrollProgress, keeps the rest', () => {
    const source = readSource('components/layout/ClientComponents.tsx');
    expect(source).not.toContain('ScrollProgress');
    expect(source).toContain('PublishedQaForm');
    expect(source).toContain('EasterEggs');
    expect(source).toContain('MatrixRain');
    expect(source).toContain('AnalyticsDebugPanel');
  });
});

describe('globals.css scroll-driven structure', () => {
  const css = () => readSource('app/globals.css');

  /** The reveal @supports block (the view() block that contains `.reveal`). */
  const revealSupportsBlock = (): string => {
    const source = css();
    const blocks = indicesOf(source, '@supports (animation-timeline: view())').map((at) =>
      extractBlock(source, at)
    );
    const block = blocks.find((candidate) => candidate.includes('.reveal'));
    if (!block) throw new Error('reveal @supports block not found in app/globals.css');
    return block;
  };

  it('16. exactly one scroll() @supports block drives the bar, active under reduce with the clamp neutralized (D5b + F1)', () => {
    const source = css();
    const at = indicesOf(source, '@supports (animation-timeline: scroll())');
    expect(at).toHaveLength(1);
    const block = extractBlock(source, at[0]);
    expect(block).toContain('.scroll-progress-bar');
    expect(block).toContain('animation: scrollProgress linear both');
    expect(block).toContain('animation-timeline: scroll(root)');
    // The bar is never gated OFF under reduce (no no-preference wrapper)…
    expect(block).not.toContain('prefers-reduced-motion: no-preference');
    // …but the global 0.01ms clamp must be neutralized, or Chromium maps
    // the timeline to a [50%,100%] sub-range and the bar only paints late.
    const reduceAt = block.indexOf('@media (prefers-reduced-motion: reduce)');
    expect(reduceAt).toBeGreaterThanOrEqual(0);
    const reduceBlock = extractBlock(block, reduceAt);
    // `auto` + zero delay maps the animation to the whole timeline (0s pins
    // it full-width; the clamp's 0.01ms maps a [50%,100%] sub-range).
    // !important + class specificity beats the universal clamp's !important.
    expect(reduceBlock).toContain('animation-duration: auto !important');
    expect(reduceBlock).toContain('animation-delay: 0s !important');
  });

  it('17. keyframes are compositor-only: scrollProgress transform-only, revealUp opacity/transform only', () => {
    const source = css();
    // Anchored on the selector form (` {`) so a comment that names the
    // keyframe (the @layer components disjointness comment does) is not
    // mistaken for the definition.
    const scrollProgressAt = source.indexOf('@keyframes scrollProgress {');
    expect(scrollProgressAt).toBeGreaterThanOrEqual(0);
    const scrollProgressDecls = declarationLines(extractBlock(source, scrollProgressAt));
    expect(scrollProgressDecls.length).toBeGreaterThan(0);
    for (const decl of scrollProgressDecls) {
      expect(decl.startsWith('transform:'), `scrollProgress declares: ${decl}`).toBe(true);
    }

    const revealUpAt = source.indexOf('@keyframes revealUp {');
    expect(revealUpAt).toBeGreaterThanOrEqual(0);
    const revealUpDecls = declarationLines(extractBlock(source, revealUpAt));
    expect(revealUpDecls.length).toBeGreaterThan(0);
    for (const decl of revealUpDecls) {
      expect(
        decl.startsWith('opacity:') || decl.startsWith('transform:'),
        `revealUp declares: ${decl}`
      ).toBe(true);
    }
  });

  it('18. exactly two view() @supports blocks: the untouched hero-mesh precedent and the new reveal block', () => {
    const source = css();
    const at = indicesOf(source, '@supports (animation-timeline: view())');
    expect(at).toHaveLength(2);
    const blocks = at.map((index) => extractBlock(source, index));
    const heroBlock = blocks.find((block) => block.includes('.hero-mesh-parallax'));
    const revealBlock = blocks.find((block) => block.includes('.reveal'));
    expect(heroBlock).toBeDefined();
    expect(heroBlock).toContain('animation-range: cover');
    expect(revealBlock).toBeDefined();
    expect(heroBlock).not.toBe(revealBlock); // separate blocks, never merged
  });

  it('19. inside the reveal @supports block: no-preference gate precedes the print guard', () => {
    const revealBlock = revealSupportsBlock();
    const gateAt = revealBlock.indexOf('@media (prefers-reduced-motion: no-preference)');
    const printAt = revealBlock.indexOf('@media print');
    expect(gateAt).toBeGreaterThanOrEqual(0);
    expect(printAt).toBeGreaterThanOrEqual(0);
    expect(gateAt).toBeLessThan(printAt);
    const printBlock = extractBlock(revealBlock, printAt);
    expect(printBlock).toContain('.reveal');
    expect(printBlock).toContain('animation: none');
  });

  it('20. the gate applies revealUp with the entry range; .reveal-tall after it overrides range only', () => {
    const revealBlock = revealSupportsBlock();
    const gateAt = revealBlock.indexOf('@media (prefers-reduced-motion: no-preference)');
    expect(gateAt).toBeGreaterThanOrEqual(0);
    const gateBlock = extractBlock(revealBlock, gateAt);

    const revealRuleAt = gateBlock.indexOf('.reveal {');
    const tallRuleAt = gateBlock.indexOf('.reveal-tall {');
    expect(revealRuleAt).toBeGreaterThanOrEqual(0);
    expect(tallRuleAt).toBeGreaterThan(revealRuleAt);

    // Range literals derive from the TS constants (same source as test 24) so
    // sanctioned tuning moves this assertion in lockstep instead of failing it.
    const startPct = revealConstant('RANGE_START_DEFAULT_PCT');
    const standardEndPct = revealConstant('STANDARD_RANGE_END_PCT');
    const tallEndPct = revealConstant('TALL_RANGE_END_PCT');

    const revealRule = extractBlock(gateBlock, revealRuleAt);
    expect(revealRule).toContain('animation: revealUp var(--ease-spring) both');
    expect(revealRule).toContain('animation-timeline: view()');
    expect(revealRule).toContain(
      `animation-range: entry var(--reveal-range-start, ${startPct}%) entry ${standardEndPct}%`
    );

    const tallDecls = declarationLines(extractBlock(gateBlock, tallRuleAt));
    expect(tallDecls).toEqual([
      `animation-range: cover var(--reveal-tall-start, ${startPct}%) cover ${tallEndPct}%;`,
    ]);
  });

  it('21. revealUp appears exactly twice: the keyframes definition and the single gated application', () => {
    // Counted on the comment-stripped source: the @layer components contract
    // comment names the keyframe, and a comment mention is not an application.
    expect(indicesOf(stripComments(css()), 'revealUp')).toHaveLength(2);
  });

  it('22. @layer components base rules: visible empty .reveal with the disjointness comment, scaleX(0) bar', () => {
    const source = css();
    const layerAt = source.indexOf('@layer components');
    expect(layerAt).toBeGreaterThanOrEqual(0);
    const layerBlock = extractBlock(source, layerAt);

    const revealAt = layerBlock.indexOf('.reveal {');
    expect(revealAt).toBeGreaterThanOrEqual(0);
    const revealRule = extractBlock(layerBlock, revealAt);
    for (const decl of declarationLines(revealRule)) {
      expect(
        decl.startsWith('opacity') ||
          decl.startsWith('transform') ||
          decl.startsWith('visibility') ||
          decl.startsWith('animation'),
        `.reveal base rule declares: ${decl}`
      ).toBe(false);
    }
    // The disjointness comment lives directly on the rule (only whitespace between).
    const commentStart = layerBlock.lastIndexOf('/*', revealAt);
    expect(commentStart).toBeGreaterThanOrEqual(0);
    const region = layerBlock.slice(commentStart, revealAt + revealRule.length);
    expect(region).toContain('content-visibility');
    expect(region.slice(region.indexOf('*/') + 2, region.indexOf('.reveal')).trim()).toBe('');

    const barAt = layerBlock.indexOf('.scroll-progress-bar {');
    expect(barAt).toBeGreaterThanOrEqual(0);
    expect(declarationLines(extractBlock(layerBlock, barAt)).sort()).toEqual([
      'transform-origin: left;',
      'transform: scaleX(0);',
    ]);
  });

  it('23. @property appears nowhere in the file (unregistered custom properties only)', () => {
    expect(indicesOf(css(), '@property')).toHaveLength(0);
  });

  it('24. lockstep: TS stagger constants match the CSS animation-range fallbacks', () => {
    const startPct = revealConstant('RANGE_START_DEFAULT_PCT');
    const standardEndPct = revealConstant('STANDARD_RANGE_END_PCT');
    const tallEndPct = revealConstant('TALL_RANGE_END_PCT');

    const source = css();
    expect(source).toContain(
      `animation-range: entry var(--reveal-range-start, ${startPct}%) entry ${standardEndPct}%`
    );
    expect(source).toContain(
      `animation-range: cover var(--reveal-tall-start, ${startPct}%) cover ${tallEndPct}%`
    );
  });
});
