'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { TocItem } from '@/lib/utils/toc';

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -80% 0px',
      }
    );

    // Observar todos los headings
    items.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <nav className="space-y-1">
      <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
        Contenido
      </p>

      <ul className="space-y-2 text-sm">
        {items.map((item) => {
          const isActive = activeId === item.id;

          return (
            <li key={item.id} className={cn(item.level === 3 && 'ml-4')}>
              <Link
                href={`#${item.id}`}
                className={cn(
                  'block border-l-2 py-1 pl-3 transition-colors hover:text-[var(--color-primary)]',
                  isActive
                    ? 'border-[var(--color-primary)] font-medium text-[var(--color-primary)]'
                    : 'border-transparent text-[var(--color-muted-foreground)]'
                )}
              >
                {item.text}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
