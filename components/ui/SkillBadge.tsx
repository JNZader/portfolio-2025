import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillBadgeProps {
  /** Skill name to display */
  name: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Optional color class for the icon */
  color?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Displays a single skill as a badge with icon
 *
 * @example
 * ```tsx
 * <SkillBadge name="React" icon={Code2} color="text-cyan-500" />
 * ```
 */
export function SkillBadge({ name, icon: Icon, color, className }: Readonly<SkillBadgeProps>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5',
        'border border-primary/30 bg-primary/15 text-primary-700 dark:text-primary hover:border-primary/50 hover:bg-primary/15 text-xs rounded-full',
        'transition-all duration-200 hover:scale-105',
        className
      )}
    >
      <Icon className={cn('w-3.5 h-3.5', color)} aria-hidden="true" />
      {name}
    </span>
  );
}
