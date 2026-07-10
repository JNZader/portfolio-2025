'use client';

import { cn } from '@/lib/utils';

const skipLinks = [
  { href: '#main-content', label: 'Saltar al contenido principal' },
  { href: '#main-navigation', label: 'Saltar a navegación' },
  { href: '#footer', label: 'Saltar al pie de página' },
];

export function SkipLinks() {
  return (
    <div className="skip-links">
      {skipLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className={cn(
            'skip-link',
            'fixed top-4 left-4 z-[9999] max-w-[calc(100vw-2rem)]',
            '-translate-y-[calc(100%+2rem)] focus:translate-y-0',
            'bg-primary text-primary-foreground',
            'min-h-11 px-4 py-2 rounded-lg inline-flex items-center',
            'font-medium text-sm',
            'transition-transform duration-150 motion-reduce:transition-none',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'focus:ring-primary'
          )}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
