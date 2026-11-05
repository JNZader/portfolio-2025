import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/*
 * Scroll-driven reveal wrapper — pure CSS, server component.
 *
 * The reveal itself lives in app/globals.css: `.reveal` runs the `revealUp`
 * keyframe on a view() scroll timeline inside
 * `@supports (animation-timeline: view())` +
 * `@media (prefers-reduced-motion: no-preference)`. The base state is fully
 * visible content, so no-JS clients, crawlers, reduced-motion users and
 * non-supporting browsers all see everything — this wrapper renders NO
 * inline opacity/transform.
 *
 * Stagger: `delay` (seconds) maps to a later animation-range start via the
 * `--reveal-range-start` / `--reveal-tall-start` inline custom properties
 * (time-based animation-delay on a timeline shifts the mapped sub-range —
 * delay/(delay+duration) — rather than offsetting the reveal, so the
 * stagger is expressed as a range start). Both are emitted
 * together; whichever range the subject's classes select consumes its own
 * variable. Derived proportionally from the retired 600ms transition: a
 * delayed subject starts when the undelayed one is `delay / 0.6` through
 * its reveal. Keep these constants in lockstep with the fallback
 * percentages in globals.css (a source-guard test pins them). Do not nest
 * RevealOnScroll inside another one: the emitted custom properties inherit,
 * and a child would consume the parent's phantom stagger.
 */

/** Retired transition duration (s) the delay mapping derives from. */
const RETIRED_TRANSITION_S = 0.6;
/** Default range start (%) — must match the `10%` fallbacks in globals.css. */
const RANGE_START_DEFAULT_PCT = 10;
/** Standard range end: `entry 100%`. Tall range end: `cover 40%`. */
const STANDARD_RANGE_END_PCT = 100;
const TALL_RANGE_END_PCT = 40;

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  /** Stagger offset in seconds (former transition delay). */
  delay?: number;
}

function delayToRangeStart(delay: number, rangeEndPct: number): string {
  const start =
    RANGE_START_DEFAULT_PCT +
    (delay / RETIRED_TRANSITION_S) * (rangeEndPct - RANGE_START_DEFAULT_PCT);
  return `${Math.round(start)}%`;
}

export function RevealOnScroll({ children, className, delay = 0 }: Readonly<RevealOnScrollProps>) {
  const staggerStyle =
    delay > 0
      ? ({
          '--reveal-range-start': delayToRangeStart(delay, STANDARD_RANGE_END_PCT),
          '--reveal-tall-start': delayToRangeStart(delay, TALL_RANGE_END_PCT),
        } as CSSProperties)
      : undefined;

  return (
    <div className={cn('reveal', className)} data-slot="reveal" style={staggerStyle}>
      {children}
    </div>
  );
}
