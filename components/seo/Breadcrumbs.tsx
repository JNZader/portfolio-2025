import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: Readonly<BreadcrumbsProps>) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-2 text-sm text-[var(--color-foreground)]/60', className)}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={item.href} className="flex items-center gap-2">
            {index > 0 && (
              <span aria-hidden="true" className="text-[var(--color-foreground)]/40">
                /
              </span>
            )}

            {isLast ? (
              <span aria-current="page" className="font-medium text-[var(--color-foreground)]">
                {item.name}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-[var(--color-primary)] transition-colors"
              >
                {item.name}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
