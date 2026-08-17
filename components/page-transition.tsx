import type { ComponentType, ReactNode } from 'react';
import { ViewTransition } from 'react';

// ViewTransition is a canary API that ships in Next.js 16.3's bundled React.
// The stable react used by the test runner (19.2.x) does not export it yet, so
// we read it once and fall back to a passthrough when absent: in production the
// real boundary drives the CSS cross-fade; in the stable/test environment the
// children render unchanged. See types/view-transition.d.ts for the module typing.
interface ViewTransitionBoundaryProps {
  children?: ReactNode;
  enter?: string;
  exit?: string;
  default?: string;
  name?: string;
}

const ViewTransitionComponent = ViewTransition as
  | ComponentType<ViewTransitionBoundaryProps>
  | undefined;

export function PageTransition({ children }: Readonly<{ children: ReactNode }>) {
  if (!ViewTransitionComponent) {
    return <>{children}</>;
  }

  return (
    <ViewTransitionComponent enter="page-fade" exit="page-fade" default="none">
      {children}
    </ViewTransitionComponent>
  );
}
