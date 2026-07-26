import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FilterChipProps {
  selected: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
}

/** Base chip geometry: guaranteed 44x44 touch target + visible focus ring. */
export const filterChipBaseClasses =
  'inline-flex items-center justify-center gap-2 min-h-11 min-w-11 px-4 rounded-md border text-sm font-medium transition-colors cursor-pointer outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]';

export const filterChipSelectedClasses =
  'border-primary/50 bg-primary/10 text-primary hover:bg-primary/15';

export const filterChipUnselectedClasses =
  'border-border bg-card text-foreground/80 hover:text-foreground hover:border-foreground/30';

/**
 * Shared toggle chip (projects tech bar + blog categories): checkbox
 * semantics with a bare check icon when selected — selection is never
 * communicated by color alone. The unselected state is de-grayed
 * (foreground tones on the card surface, no muted-on-muted).
 */
export function FilterChip({
  selected,
  onToggle,
  children,
  className,
}: Readonly<FilterChipProps>) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className={cn(
        filterChipBaseClasses,
        selected ? filterChipSelectedClasses : filterChipUnselectedClasses,
        className
      )}
    >
      {selected && (
        <Check data-testid="filter-check" className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
