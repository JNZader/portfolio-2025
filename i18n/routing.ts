import { defineRouting } from 'next-intl/routing';

/**
 * i18n routing config. Spanish is the default and stays prefix-less
 * (`localePrefix: 'as-needed'`), so existing ES URLs don't change; English
 * lives under `/en/*`.
 */
export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];
