'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/utils';

/**
 * ES/EN language switcher. Uses the i18n-aware pathname (locale-stripped) so
 * switching preserves the current route. Renders a link per locale; the active
 * one is marked and non-interactive.
 */
export function LanguageSwitcher({ className }: Readonly<{ className?: string }>) {
  const pathname = usePathname();
  const active = useLocale();
  const t = useTranslations('LanguageSwitcher');

  return (
    <nav className={cn('flex items-center', className)} aria-label={t('label')}>
      {routing.locales.map((locale, i) => {
        const isActive = locale === active;
        return (
          <span key={locale} className="flex items-center">
            {i > 0 && (
              <span className="-mx-1 text-muted-foreground/40" aria-hidden="true">
                /
              </span>
            )}
            <Link
              href={pathname}
              locale={locale}
              aria-current={isActive ? 'true' : undefined}
              aria-disabled={isActive ? 'true' : undefined}
              tabIndex={isActive ? -1 : undefined}
              aria-label={locale === 'en' ? t('toEn') : t('toEs')}
              className={cn(
                'inline-flex size-11 items-center justify-center rounded-md text-xs font-semibold uppercase transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {locale}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
