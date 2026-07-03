import { getLocale } from 'next-intl/server';

/**
 * Per-locale `alternates` for a page's metadata. Reads the active request
 * locale so each page self-canonicalizes (es → `/path`, en → `/en/path`) and
 * declares its language alternates via hreflang. Paths are relative — Next
 * resolves them against `metadataBase` (SITE_URL).
 */
export async function localeAlternates(path: string) {
  const locale = await getLocale();
  const esPath = path === '/' ? '/' : path;
  const enPath = path === '/' ? '/en' : `/en${path}`;

  return {
    canonical: locale === 'en' ? enPath : esPath,
    languages: {
      es: esPath,
      en: enPath,
      'x-default': esPath,
    },
  };
}
