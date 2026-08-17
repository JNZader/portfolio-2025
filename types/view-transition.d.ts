// React's <ViewTransition> is a canary API that ships in Next.js 16.3's
// bundled React (see node_modules/next/dist/compiled/react/cjs/react.development.js:
// `exports.ViewTransition = REACT_VIEW_TRANSITION_TYPE`). It is NOT yet exported
// by the stable @types/react@19 used for type-checking, and it is absent from
// the stable react@19.2.x installed for the test runner.
//
// We augment the 'react' module with the minimal, honest typing for the props
// our <PageTransition> boundary actually uses. The runtime guard in
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
  interface ViewTransitionProps {
    children?: ReactNode;
    /** Transition name(s) applied on enter. Maps to ::view-transition-new(.name). */
    enter?: string;
    /** Transition name(s) applied on exit. Maps to ::view-transition-old(.name). */
    exit?: string;
    /** Default transition name when no enter/exit is specified. 'none' disables. */
    default?: string;
    /** Optional named boundary. */
    name?: string;
  }

  export const ViewTransition: ComponentType<ViewTransitionProps>;
}
