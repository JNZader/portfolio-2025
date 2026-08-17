import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/lib/utils';

type JzMarkSize = 'sm' | 'md' | 'lg' | 'xl';

export interface JzMarkProps extends ComponentPropsWithoutRef<'span'> {
  /** Visual size. Defaults to `md` (text-xl). Sizing can also be overridden via `className`. */
  size?: JzMarkSize;
}

const sizeClass: Record<JzMarkSize, string> = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl',
};

/**
 * Reusable brand monogram: renders "JZ" in the Space Grotesk display face with
 * strong weight, filled with the sanctioned `--primary` → `--tertiary` gradient
 * (via the `.gradient-text-accent` token class — no hardcoded color at call
 * sites). Theme-safe (the gradient flips light/dark through the token), and tiny
 * enough to drop into Header, Footer, MobileMenu, the OG image, and the favicon.
 *
 * Pass `aria-hidden` for decorative instances inside a labelled link, or
 * `aria-label` when the mark itself is the accessible name.
 */
export default function JzMark({ className, size = 'md', ...rest }: JzMarkProps) {
  return (
    <span
      className={cn(
        'text-display select-none font-black tracking-tight gradient-text-accent',
        sizeClass[size],
        className
      )}
      {...rest}
    >
      JZ
    </span>
  );
}
