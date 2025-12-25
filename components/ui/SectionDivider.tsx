import { cn } from '@/lib/utils';

interface SectionDividerProps {
  variant?: 'default' | 'gradient' | 'dots';
  className?: string;
}

export function SectionDivider({
  variant = 'default',
  className = '',
}: Readonly<SectionDividerProps>) {
  if (variant === 'gradient') {
    return (
      <div className={cn('relative h-px w-full my-12', className)}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent blur-sm" />
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center justify-center gap-2 my-12', className)}>
        <div className="w-1.5 h-1.5 rounded-full bg-primary/30 animate-pulse" />
        <div
          className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse"
          style={{ animationDelay: '0.2s' }}
        />
        <div
          className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"
          style={{ animationDelay: '0.4s' }}
        />
        <div
          className="w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse"
          style={{ animationDelay: '0.6s' }}
        />
        <div
          className="w-1.5 h-1.5 rounded-full bg-primary/30 animate-pulse"
          style={{ animationDelay: '0.8s' }}
        />
      </div>
    );
  }

  return (
    <div className={cn('relative h-px w-full my-12', className)}>
      <div className="absolute inset-0 bg-border" />
    </div>
  );
}
