'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Easter Eggs - Only load when user interacts
const EasterEggs = dynamic(
  () => import('@/components/features/EasterEggs').then((m) => m.EasterEggs),
  { ssr: false }
);

const TypingEasterEgg = dynamic(
  () => import('@/components/features/TypingEasterEgg').then((m) => m.TypingEasterEgg),
  { ssr: false }
);

const CursorTracer = dynamic(
  () => import('@/components/features/CursorTracer').then((m) => m.CursorTracer),
  { ssr: false }
);

const MatrixRain = dynamic(
  () => import('@/components/features/MatrixRain').then((m) => m.MatrixRain),
  { ssr: false }
);

// Custom Cursor - Includes framer-motion (~60KB)
const CustomCursor = dynamic(
  () => import('@/components/ui/CustomCursor').then((m) => m.CustomCursor),
  { ssr: false }
);

// Scroll Progress - Client only
const ScrollProgress = dynamic(
  () => import('@/components/ui/ScrollProgress').then((m) => m.ScrollProgress),
  { ssr: false }
);

// Analytics Debug Panel - Only in development
const AnalyticsDebugPanel =
  process.env.NODE_ENV === 'development'
    ? dynamic(() => import('@/lib/analytics/debug').then((m) => m.AnalyticsDebugPanel), {
        ssr: false,
      })
    : () => null;

/**
 * Client Components Wrapper
 * Contains all lazy-loaded client-only components
 * Extracted from layout.tsx to allow Server Component optimization
 */
export function ClientComponents() {
  return (
    <>
      {/* UI Components - Lazy loaded */}
      <Suspense fallback={null}>
        <ScrollProgress />
      </Suspense>
      <Suspense fallback={null}>
        <CustomCursor />
      </Suspense>

      {/* Easter Eggs - Lazy loaded on demand */}
      <Suspense fallback={null}>
        <EasterEggs />
      </Suspense>
      <Suspense fallback={null}>
        <TypingEasterEgg />
      </Suspense>
      <Suspense fallback={null}>
        <CursorTracer />
      </Suspense>
      <Suspense fallback={null}>
        <MatrixRain />
      </Suspense>

      {/* Debug Panel - Dev only */}
      <AnalyticsDebugPanel />
    </>
  );
}
