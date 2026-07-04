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
  // The locale switcher is explicit UI-driven, not browser-negotiated — this
  // app shouldn't auto-redirect based on Accept-Language / the locale cookie.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
