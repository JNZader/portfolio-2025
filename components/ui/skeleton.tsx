'use client';

import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />;
}

interface SkeletonCardProps {
  className?: string;
  showImage?: boolean;
  showFooter?: boolean;
  lines?: number;
}

function SkeletonCard({
  className,
  showImage = true,
  showFooter = true,
  lines = 3,
}: Readonly<SkeletonCardProps>) {
  return (
    <div className={cn('rounded-lg border border-border overflow-hidden', className)}>
      {showImage && <Skeleton className="h-48 w-full rounded-none" />}
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-3/4" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: lines }, (_, i) => (
            <Skeleton
              // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton items never reorder
              key={`skeleton-line-${i}`}
              className={cn('h-4', i === lines - 1 ? 'w-2/3' : 'w-full')}
            />
          ))}
        </div>
        {showFooter && (
          <div className="flex justify-between items-center pt-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        )}
      </div>
    </div>
  );
}

interface SkeletonGridProps {
  count?: number;
  cols?: 1 | 2 | 3 | 4;
  showImage?: boolean;
  className?: string;
}

function SkeletonGrid({
  count = 6,
  cols = 3,
  showImage = true,
  className,
}: Readonly<SkeletonGridProps>) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-6', gridClasses[cols], className)}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard
          // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton items never reorder
          key={`skeleton-card-${i}`}
          showImage={showImage}
        />
      ))}
    </div>
  );
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

function SkeletonText({ lines = 3, className }: Readonly<SkeletonTextProps>) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton items never reorder
          key={`skeleton-text-${i}`}
          className={cn('h-4', i === lines - 1 ? 'w-4/5' : 'w-full')}
        />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonGrid, SkeletonText };
