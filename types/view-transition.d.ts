// React's <ViewTransition> is a canary API that ships in Next.js 16.3's
// bundled React (see node_modules/next/dist/compiled/react/cjs/react.development.js:
// `exports.ViewTransition = REACT_VIEW_TRANSITION_TYPE`). It is NOT yet exported
// by the stable @types/react@19 used for type-checking, and it is absent from
// the stable react@19.2.x installed for the test runner.
//
// We augment the 'react' module with the minimal, honest typing for the props
// our <ViewTransition> boundaries actually use. The runtime guard in
// components/page-transition.tsx falls back to a passthrough when the export is
// missing, so the same source works in both the Next canary (real boundary) and
// the stable/test environment (no-op).
//
// Reference: https://react.dev/reference/react/ViewTransition
//
// FORWARD-RISK: when @types/react ships ViewTransition natively, this
// augmentation will collide with the native declaration ("Subsequent variable
// declarations must have the same type") and type-check will fail. The fix is
// to DELETE this file, not to edit it.
import type { ComponentType, ReactNode } from 'react';

declare module 'react' {
  /**
   * Map of a transition type (the strings passed to `<Link transitionTypes>`)
   * to the CSS class emitted on the corresponding `::view-transition-*` pseudo.
   * The `default` key is the class used when no active transition type matches
   * (e.g. untagged navigations and the browser back button).
   */
  export type ViewTransitionNameMap = {
    [transitionType: string]: string;
    default?: string;
  };

  interface ViewTransitionProps {
    children?: ReactNode;
    /** Enter transition: a single class, or a map of transition-type → class. */
    enter?: string | ViewTransitionNameMap;
    /** Exit transition: a single class, or a map of transition-type → class. */
    exit?: string | ViewTransitionNameMap;
    /** Fallback class when enter/exit is a plain string with no active type,
     *  or when enter/exit is omitted. 'none' disables the boundary. */
    default?: string;
    /** Named boundary for shared-element (morph) transitions. Must be unique
     *  per element and identical on both sides of a shared transition. */
    name?: string;
    /** Share group for shared-element transitions (e.g. 'morph'). Sets the
     *  element's `view-transition-class`, which the `.morph` CSS selector
     *  targets. Required (with `default="none"`) so the pair morphs instead of
     *  animating on unrelated transitions. */
    share?: string;
  }

  export const ViewTransition: ComponentType<ViewTransitionProps>;
}
