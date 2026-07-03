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
    <nav className={cn('flex items-center gap-1', className)} aria-label={t('label')}>
      {routing.locales.map((locale, i) => {
        const isActive = locale === active;
        return (
          <span key={locale} className="flex items-center gap-1">
            {i > 0 && <span className="text-muted-foreground/40">/</span>}
            <Link
              href={pathname}
              locale={locale}
              aria-current={isActive ? 'true' : undefined}
              aria-label={locale === 'en' ? t('toEn') : t('toEs')}
              className={cn(
                'text-xs font-semibold uppercase transition-colors',
                isActive
                  ? 'text-primary pointer-events-none'
                  : 'text-muted-foreground hover:text-foreground'
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
