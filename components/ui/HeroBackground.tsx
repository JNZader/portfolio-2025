import { cn } from '@/lib/utils';

interface HeroBackgroundProps {
  /** Show animated floating blobs */
  showBlobs?: boolean;
  /** Show dot pattern overlay */
  showDotPattern?: boolean;
  /** Additional className for the container */
  className?: string;
}

/**
 * Reusable hero background with gradient, animated blobs, and dot pattern
 * Used in: HeroSection, About page, Blog page, etc.
 */
export function HeroBackground({
  showBlobs = true,
  showDotPattern = true,
  className,
}: HeroBackgroundProps) {
  return (
    <>
      {/* Animated gradient background */}
      <div className={cn('absolute inset-0 -z-10', className)}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-tertiary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
      </div>

      {/* Animated blobs */}
      {showBlobs && (
        <>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-tertiary/10 rounded-full blur-3xl animate-float"
            style={{ animationDelay: '1s' }}
          />
        </>
      )}

      {/* Dot pattern overlay */}
      {showDotPattern && (
        <div className="absolute inset-0 -z-10 opacity-[0.02] dark:opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />
        </div>
      )}
    </>
  );
}
