'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  navigation: ReadonlyArray<{ name: string; href: string }>;
}

export default function MobileMenu({ open, onClose, navigation }: Readonly<MobileMenuProps>) {
  const t = useTranslations('MobileMenu');
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const navigatingRef = useRef(false);

  const handleNavigation = (href: string) => {
    navigatingRef.current = pathname !== href;
    onClose();
  };

  // Manage dialog open/close with native <dialog> API
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      openerRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
      closeButtonRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!navigatingRef.current || !pathname) return;

    document.querySelector<HTMLElement>('#main-content')?.focus();
    navigatingRef.current = false;
  }, [pathname]);

  // Handle native dialog close event (ESC key, etc.)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      onClose();
      if (!navigatingRef.current) {
        openerRef.current?.focus();
      }
    };

    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className="md:hidden fixed inset-0 p-0 m-0 w-full h-full max-w-full max-h-full bg-transparent backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      aria-labelledby="mobile-menu-title"
    >
      {/* Backdrop button for closing */}
      <button
        type="button"
        className="absolute inset-0 w-full h-full cursor-default bg-transparent"
        onClick={onClose}
        aria-label={t('closeAria')}
        tabIndex={-1}
      />
      {/* Panel */}
      <div
        id="mobile-menu"
        className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-border"
      >
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="-m-1.5 p-1.5"
            onClick={() => handleNavigation('/')}
            aria-label={t('homeAria')}
          >
            <span className="text-xl font-bold text-primary" aria-hidden="true">
              JZ
            </span>
          </Link>
          <div id="mobile-menu-title" className="sr-only">
            {t('title')}
          </div>
          <button
            type="button"
            className="-m-2.5 rounded-md p-2.5 text-foreground"
            onClick={onClose}
            aria-label={t('closeAria')}
            ref={closeButtonRef}
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <nav id="mobile-menu-nav" className="mt-6 flow-root" aria-label={t('navAria')}>
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
                      '-mx-3 flex min-h-11 items-center rounded-lg px-3 py-2 text-base font-semibold leading-7',
                      item.href === '/contacto'
                        ? 'mt-4 justify-center bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
                        : isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground hover:bg-muted'
                    )}
                    onClick={() => handleNavigation(item.href)}
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
    </dialog>
  );
}
