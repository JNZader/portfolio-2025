'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { getPageNumbers } from '@/lib/utils/blog';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: Readonly<PaginationProps>) {
  const router = useRouter();
  const t = useTranslations('Blog');
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/blog?${params.toString()}`);
  };

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center justify-center gap-2" aria-label={t('paginationLabel')}>
      {/* Previous */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label={t('previousPage')}
      >
        <ChevronLeftIcon className="h-4 w-4" />
        <span className="sr-only sm:not-sr-only sm:ml-2">{t('previous')}</span>
      </Button>

      {/* Page numbers */}
      <div className="hidden sm:flex sm:gap-2">
        {pageNumbers.map((pageNum, index) => {
          if (pageNum === 'ellipsis') {
            // Use adjacent page number for unique key instead of index
            const prevPage = pageNumbers[index - 1];
            return (
              <span
                key={`ellipsis-after-${prevPage}`}
                className="flex h-9 w-9 items-center justify-center"
              >
                ...
              </span>
            );
          }

          const isActive = pageNum === currentPage;

          return (
            <Button
              key={pageNum}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePageChange(pageNum)}
              className={cn('h-9 w-9 p-0', isActive && 'pointer-events-none')}
              aria-label={t('pageNumber', { page: pageNum })}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </Button>
          );
        })}
      </div>

      {/* Mobile: current page indicator */}
      <div className="flex items-center gap-2 sm:hidden">
        <span className="text-sm text-[var(--color-muted-foreground)]">
          {t('pageOf', { current: currentPage, total: totalPages })}
        </span>
      </div>

      {/* Next */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label={t('nextPage')}
      >
        <span className="sr-only sm:not-sr-only sm:mr-2">{t('next')}</span>
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
    </nav>
  );
}

// Iconos SVG
function ChevronLeftIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
    >
      <title>Previous</title>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRightIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
    >
      <title>Next</title>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}
