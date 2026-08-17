import type { ComponentType, ReactNode, ViewTransitionNameMap } from 'react';
import { ViewTransition } from 'react';

// ViewTransition is a canary API that ships in Next.js 16.3's bundled React.
// The stable react used by the test runner (19.2.x) does not export it yet, so
// we read it once and fall back to a passthrough when absent: in production the
// real boundary drives the CSS cross-fade / slides / morph; in the stable/test
// environment the children render unchanged. See types/view-transition.d.ts for
// the module typing.
interface ViewTransitionBoundaryProps {
  children?: ReactNode;
  enter?: string | ViewTransitionNameMap;
  exit?: string | ViewTransitionNameMap;
  default?: string;
  name?: string;
  share?: string;
}

const ViewTransitionComponent = ViewTransition as
  | ComponentType<ViewTransitionBoundaryProps>
  | undefined;

/**
 * Passthrough-guarded <ViewTransition> wrapper. In the Next.js canary runtime
 * the real boundary drives the CSS transitions (page-fade cross-fade,
 * nav-forward/nav-back slides, and shared-element morphs); in the stable/react
 * test environment (no ViewTransition export) it renders children unchanged.
 */
export function ViewTransitionBoundary({
  children,
  ...props
}: Readonly<ViewTransitionBoundaryProps>) {
  if (!ViewTransitionComponent) {
    return <>{children}</>;
  }

  return <ViewTransitionComponent {...props}>{children}</ViewTransitionComponent>;
}

// Directional map: list → detail (nav-forward) and detail → list (nav-back)
// slide; untagged navigations (top-level nav, browser back) keep page-fade.
const PAGE_TRANSITION_MAP: ViewTransitionNameMap = {
  'nav-forward': 'nav-forward',
  'nav-back': 'nav-back',
  default: 'page-fade',
};

export function PageTransition({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ViewTransitionBoundary enter={PAGE_TRANSITION_MAP} exit={PAGE_TRANSITION_MAP} default="none">
      {children}
    </ViewTransitionBoundary>
  );
}
