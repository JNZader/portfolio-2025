'use client';

import { useEffect } from 'react';

/**
 * Global ripple-origin tracker.
 *
 * The `.btn-ripple` effect in globals.css reads `--ripple-x/--ripple-y` to
 * position its radial burst, but nothing ever set those variables — so every
 * press rendered a centered blur instead of a cursor-tracked ripple. A single
 * delegated `pointerdown` listener sets the variables on whichever ripple
 * element was pressed (works for `asChild`/Slot buttons too, no per-button
 * wiring). Under `prefers-reduced-motion` the CSS animation is already
 * neutralized, so this is a no-op visually there.
 */
export function RippleListener() {
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest<HTMLElement>('.btn-ripple');
      if (!target) return;

      const rect = target.getBoundingClientRect();
      target.style.setProperty('--ripple-x', `${event.clientX - rect.left}px`);
      target.style.setProperty('--ripple-y', `${event.clientY - rect.top}px`);
    };

    document.addEventListener('pointerdown', handlePointerDown, { passive: true });
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  return null;
}
