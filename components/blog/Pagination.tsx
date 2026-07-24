'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { buttonVariants } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { getPageNumbers } from '@/lib/utils/blog';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: Readonly<PaginationProps>) {
  const t = useTranslations('Blog');
  const searchParams = useSearchParams();

  const pageHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    return `/blog?${params.toString()}`;
  };

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  if (totalPages <= 1) {
    return null;
  }

  const prevNextClasses = cn(
    buttonVariants({ variant: 'outline', size: 'sm' }),
    'h-11 no-underline'
  );

  return (
    <nav className="flex items-center justify-center gap-2" aria-label={t('paginationLabel')}>
      {/* Previous — span deshabilitado en la primera página (no es navegable) */}
      {currentPage > 1 ? (
        <Link
          href={pageHref(currentPage - 1)}
          className={prevNextClasses}
          aria-label={t('previousPage')}
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:ml-2">{t('previous')}</span>
        </Link>
      ) : (
        <span className={cn(prevNextClasses, 'pointer-events-none opacity-50')} aria-hidden="true">
          <ChevronLeftIcon className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:ml-2">{t('previous')}</span>
        </span>
      )}

      {/* Page numbers */}
      <div className="hidden sm:flex sm:gap-2">
        {pageNumbers.map((pageNum, index) => {
          if (pageNum === 'ellipsis') {
            // Use adjacent page number for unique key instead of index
            const prevPage = pageNumbers[index - 1];
            return (
              <span
                key={`ellipsis-after-${prevPage}`}
                className="flex size-11 items-center justify-center"
              >
                ...
              </span>
            );
          }

          const isActive = pageNum === currentPage;

          return (
            <Link
              key={pageNum}
              href={pageHref(pageNum)}
              className={cn(
                buttonVariants({ variant: isActive ? 'default' : 'outline', size: 'sm' }),
                'size-11 px-0 no-underline',
                isActive && 'pointer-events-none'
              )}
              aria-label={t('pageNumber', { page: pageNum })}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </Link>
          );
        })}
      </div>

      {/* Mobile: current page indicator */}
      <div className="flex items-center gap-2 sm:hidden">
        <span className="text-sm text-[var(--color-muted-foreground)]">
          {t('pageOf', { current: currentPage, total: totalPages })}
        </span>
      </div>

      {/* Next — span deshabilitado en la última página (no es navegable) */}
      {currentPage < totalPages ? (
        <Link
          href={pageHref(currentPage + 1)}
          className={prevNextClasses}
          aria-label={t('nextPage')}
        >
          <span className="sr-only sm:not-sr-only sm:mr-2">{t('next')}</span>
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      ) : (
        <span className={cn(prevNextClasses, 'pointer-events-none opacity-50')} aria-hidden="true">
          <span className="sr-only sm:not-sr-only sm:mr-2">{t('next')}</span>
          <ChevronRightIcon className="h-4 w-4" />
        </span>
      )}
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
