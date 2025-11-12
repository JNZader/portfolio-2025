'use client';

import { useSearchParams } from 'next/navigation';
import { getSearchStatsMessage } from '@/lib/utils/search';

interface SearchStatsProps {
  total: number;
  categoryName?: string;
}

export function SearchStats({ total, categoryName }: SearchStatsProps) {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search');

  if (!searchTerm) {
    return null;
  }

  const message = getSearchStatsMessage(total, searchTerm, categoryName);

  return (
    <div className="rounded-lg border bg-[var(--color-muted)] px-4 py-3">
      <p className="text-sm">
        <span className="font-medium">{message}</span>
      </p>
    </div>
  );
}
