import { SITE_URL } from '@/lib/config/site-config';

export function localizedPath(path: string, locale: string): string {
  const normalizedPath = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  return locale === 'en' ? `/en${normalizedPath}` : normalizedPath || '/';
}

export function localizedUrl(path: string, locale: string): string {
  return `${SITE_URL}${localizedPath(path, locale)}`;
}
