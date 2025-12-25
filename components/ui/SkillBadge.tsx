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
        'bg-primary/10 hover:bg-primary/20 text-primary text-xs rounded-full',
        'transition-all duration-200 hover:scale-105',
        className
      )}
    >
      <Icon className={cn('w-3.5 h-3.5', color)} aria-hidden="true" />
      {name}
    </span>
  );
}
