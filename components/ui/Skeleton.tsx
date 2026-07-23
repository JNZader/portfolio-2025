import type * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Base skeleton primitive for loading states.
 * Single source of truth for the pulse placeholder style so loading
 * states across routes do not diverge.
 */
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-md bg-muted-foreground/15', className)}
      {...props}
    />
  );
}

export { Skeleton };
