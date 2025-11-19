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
            'sr-only focus:not-sr-only',
            'fixed top-4 left-4 z-[9999]',
            'bg-primary text-primary-foreground',
            'px-4 py-2 rounded-lg',
            'font-medium text-sm',
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
