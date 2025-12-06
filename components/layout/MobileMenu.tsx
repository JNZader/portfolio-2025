'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { FocusTrap } from '@/components/a11y/FocusTrap';
import { cn } from '@/lib/utils';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  navigation: Array<{ name: string; href: string }>;
}

export default function MobileMenu({ open, onClose, navigation }: MobileMenuProps) {
  const pathname = usePathname();

  // Prevenir scroll cuando el menú está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="md:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-menu-title"
      aria-describedby="mobile-menu-nav"
    >
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 z-40 bg-foreground/50 backdrop-blur-sm cursor-default"
        onClick={onClose}
        aria-label="Cerrar menú"
      />

      {/* Panel con FocusTrap para accesibilidad */}
      <FocusTrap active={open} onDeactivate={onClose}>
        <div
          id="mobile-menu"
          className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-border"
        >
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="-m-1.5 p-1.5"
              onClick={onClose}
              aria-label="Ir a página de inicio"
            >
              <span className="text-xl font-bold text-primary" aria-hidden="true">
                JZ
              </span>
            </Link>
            <h2 id="mobile-menu-title" className="sr-only">
              Menú de navegación
            </h2>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-foreground"
              onClick={onClose}
              aria-label="Cerrar menú"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <nav id="mobile-menu-nav" className="mt-6 flow-root" aria-label="Navegación móvil">
            <div className="-my-6 divide-y divide-border">
              <div className="space-y-2 py-6">
                {navigation.map((item) => {
                  const isActive =
                    pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        '-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7',
                        isActive ? 'text-primary bg-primary/10' : 'text-foreground hover:bg-muted'
                      )}
                      onClick={onClose}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>
      </FocusTrap>
    </div>
  );
}
