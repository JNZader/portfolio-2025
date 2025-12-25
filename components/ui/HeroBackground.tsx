import { cn } from '@/lib/utils';

interface HeroBackgroundProps {
  /** Show animated floating blobs */
  showBlobs?: boolean;
  /** Show dot pattern overlay */
  showDotPattern?: boolean;
  /** Show gradient mesh effect */
  showGradientMesh?: boolean;
  /** Additional className for the container */
  className?: string;
}

/**
 * Reusable hero background with gradient, animated blobs, and dot pattern
 * Used in: HeroSection, About page, Blog page, etc.
 *
 * Performance optimizations:
 * - Blobs use will-change for GPU acceleration
 * - Blobs are hidden on mobile to reduce paint cost
 * - Reduced blur radius for better mobile performance
 */
export function HeroBackground({
  showBlobs = true,
  showDotPattern = true,
  showGradientMesh = true,
  className,
}: Readonly<HeroBackgroundProps>) {
  return (
    <>
      {/* Static gradient background - renders immediately */}
      <div className={cn('absolute inset-0 -z-10', className)}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-tertiary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
      </div>

      {/* Gradient mesh effect - subtle color orbs */}
      {showGradientMesh && (
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/[0.07] rounded-full blur-3xl"
            style={{ transform: 'translate(-50%, -50%)' }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-tertiary/[0.07] rounded-full blur-3xl"
            style={{ transform: 'translate(50%, 50%)' }}
          />
          <div
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent-warm/[0.05] rounded-full blur-3xl hidden lg:block"
            style={{ transform: 'translate(-50%, -50%)' }}
          />
        </div>
      )}

      {/* Animated blobs - hidden on mobile for LCP performance, GPU-accelerated on desktop */}
      {showBlobs && (
        <>
          <div
            className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-2xl md:blur-3xl animate-float hidden md:block"
            style={{ willChange: 'transform', contain: 'paint' }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-tertiary/10 rounded-full blur-2xl md:blur-3xl animate-float hidden md:block"
            style={{ animationDelay: '1s', willChange: 'transform', contain: 'paint' }}
          />
          {/* Third subtle blob */}
          <div
            className="absolute top-1/3 -left-20 w-60 h-60 bg-accent-warm/5 rounded-full blur-2xl animate-float hidden lg:block"
            style={{ animationDelay: '2s', willChange: 'transform', contain: 'paint' }}
          />
        </>
      )}

      {/* Dot pattern overlay - low opacity, minimal impact */}
      {showDotPattern && (
        <div className="absolute inset-0 -z-10 opacity-[0.015] dark:opacity-[0.025]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>
      )}

      {/* Subtle noise texture for depth */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.02] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </>
  );
}
