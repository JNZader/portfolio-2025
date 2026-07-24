import { cn } from '@/lib/utils';

interface SectionDividerProps {
  variant?: 'default' | 'gradient';
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

  return (
    <div className={cn('relative h-px w-full my-12', className)}>
      <div className="absolute inset-0 bg-border" />
    </div>
  );
}
