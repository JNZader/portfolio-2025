'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

/**
 * Navigation Link - Client Component
 * Extracted from Header for Server Component optimization
 * Handles active state detection using usePathname
 */
export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        'text-sm font-semibold transition-all duration-200 relative py-1 px-2 -mx-2 rounded-md group',
        'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        isActive ? 'text-primary' : 'text-foreground/80 hover:text-primary'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
      <span
        className={cn(
          'absolute bottom-0 left-0 h-0.5 bg-primary rounded-full transition-all duration-300',
          isActive ? 'w-full' : 'w-0 group-hover:w-full'
        )}
      />
      {isActive && (
        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary blur-sm opacity-50" />
      )}
    </Link>
  );
}
