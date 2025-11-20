import { cn } from '@/lib/utils';

interface AccentLineProps {
  position?: 'left' | 'center';
  className?: string;
}

/**
 * Decorative accent line for section headers
 */
export function AccentLine({ position = 'left', className = '' }: AccentLineProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 mb-6',
        position === 'center' && 'justify-center',
        className
      )}
    >
      <div className="h-1 w-12 bg-gradient-to-r from-primary to-primary-600 rounded-full" />
      <div className="h-1 w-8 bg-gradient-to-r from-primary-600 to-tertiary rounded-full opacity-60" />
      <div className="h-1 w-4 bg-gradient-to-r from-tertiary to-accent-warm rounded-full opacity-40" />
    </div>
  );
}
