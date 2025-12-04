'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  navigation: Array<{ name: string; href: string }>;
}

export default function MobileMenu({ open, onClose, navigation }: MobileMenuProps) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Get all focusable elements within the menu
  const getFocusableElements = useCallback(() => {
    if (!menuRef.current) return [];
    return Array.from(
      menuRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
  }, []);

  // Handle keyboard navigation (focus trap + escape)
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab on first element -> go to last
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
      // Tab on last element -> go to first
      else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    },
    [onClose, getFocusableElements]
  );

  // Handle body scroll lock and focus management
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      // Focus close button when menu opens
      requestAnimationFrame(() => {
        closeButtonRef.current?.focus();
      });
      // Add keyboard listener
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="md:hidden" role="dialog" aria-modal="true" aria-label="Menú de navegación">
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 z-40 bg-foreground/50 backdrop-blur-sm cursor-default"
        onClick={onClose}
        aria-label="Cerrar menú"
        tabIndex={-1}
      />

      {/* Panel */}
      <div
        ref={menuRef}
        id="mobile-menu"
        className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-border"
      >
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="-m-1.5 p-1.5 rounded-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            onClick={onClose}
          >
            <span className="text-xl font-bold text-primary">JZ</span>
          </Link>
          <button
            ref={closeButtonRef}
            type="button"
            className="-m-2.5 rounded-md p-2.5 text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="mt-6 flow-root" aria-label="Menú móvil">
          <div className="-my-6 divide-y divide-border">
            <ul className="space-y-2 py-6 list-none">
              {navigation.map((item) => {
                const isActive =
                  pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        '-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7',
                        'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                        isActive ? 'text-primary bg-primary/10' : 'text-foreground hover:bg-muted'
                      )}
                      onClick={onClose}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
}
