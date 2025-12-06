'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { EasterEggs } from '@/components/features/EasterEggs';

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

      {/* Easter Eggs */}
      <EasterEggs />
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
