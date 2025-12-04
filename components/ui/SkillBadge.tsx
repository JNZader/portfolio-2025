import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillBadgeProps {
  name: string;
  icon: LucideIcon;
  color?: string;
  className?: string;
}

export function SkillBadge({ name, icon: Icon, color, className }: SkillBadgeProps) {
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
