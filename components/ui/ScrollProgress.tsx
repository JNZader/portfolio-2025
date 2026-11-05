/*
 * Scroll progress bar — pure CSS, server component.
 *
 * Progress is driven by the `scroll(root)` timeline in app/globals.css
 * (`.scroll-progress-bar`: transform-only scaleX). No client JS, no scroll
 * listener, no state, no dynamic import. Browsers without scroll-timeline
 * support render no bar (base `scaleX(0)`) — parity with the previous
 * `ssr: false` mount, which also showed no bar without JS.
 *
 * Deliberately NOT gated by prefers-reduced-motion: the bar only moves
 * while the user scrolls — user-linked feedback, not autonomous motion —
 * and it hides no content. `print:hidden` keeps the gradient line out of
 * printed output (the old bar printed at its last-scrolled width).
 */
export function ScrollProgress() {
  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 bg-border/30 z-50 print:hidden"
      aria-hidden="true"
    >
      <div className="scroll-progress-bar h-full bg-gradient-to-r from-primary via-primary/80 to-tertiary" />
    </div>
  );
}
