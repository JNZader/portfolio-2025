import { cn } from '@/lib/utils';

/**
 * Pattern-craft masked background variants (github.com/megh-bari/pattern-craft).
 *
 * - `grid`  Top-fade blueprint grid — engineering feel, fades from the top edge.
 * - `dots`  Dot grid — quieter, fades toward the edges.
 * - `glow`  Radial --primary bloom from the top — the calmest option.
 *
 * All variants are pure CSS defined in globals.css and read the theme token
 * `--border` / `--primary` / `--background`, so light + dark stay subtle
 * automatically. The class definitions live in globals.css so they can be
 * previewed and swapped without touching component code.
 *
 * Usage: place inside a `relative overflow-hidden` element; this renders a
 * decorative, non-interactive layer behind the content.
 *
 *   <section className="relative overflow-hidden">
 *     <PatternBackground variant="grid" />
 *     …content…
 *   </section>
 */
export type PatternVariant = 'grid' | 'dots' | 'glow';

const VARIANT_CLASS: Record<PatternVariant, string> = {
  grid: 'bg-pattern-grid',
  dots: 'bg-pattern-dots',
  glow: 'bg-pattern-glow',
};

interface PatternBackgroundProps {
  /** Which masked pattern to render. Defaults to the top-fade grid. */
  variant?: PatternVariant;
  /** Extra classes (e.g. positioning overrides). */
  className?: string;
}

export function PatternBackground({
  variant = 'grid',
  className,
}: Readonly<PatternBackgroundProps>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 -z-10',
        VARIANT_CLASS[variant],
        className
      )}
    />
  );
}
