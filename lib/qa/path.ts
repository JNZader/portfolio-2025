import { QA_LOCALE, type QaLocale } from '@/lib/qa/types';

export type PublishedQaPathKind = 'project' | 'blog' | 'site';

export interface PublishedQaPathContext {
  locale: QaLocale;
  preferSlug: string | null;
  kind: PublishedQaPathKind;
}

function localeFromSegment(segment: string | undefined): QaLocale | null {
  if (segment === QA_LOCALE.EN) return QA_LOCALE.EN;
  if (segment === QA_LOCALE.ES) return QA_LOCALE.ES;
  return null;
}

export function parsePublishedQaPath(pathname: string): PublishedQaPathContext {
  const path = pathname.split(/[?#]/, 1)[0] ?? '';
  const segments = path.split('/').filter(Boolean);
  const prefixed = localeFromSegment(segments[0]);
  const locale = prefixed ?? QA_LOCALE.ES;
  const rest = prefixed ? segments.slice(1) : segments;
  const section = rest[0];
  const slug = rest[1];

  if (section === 'proyectos' && slug) {
    return { locale, preferSlug: slug, kind: 'project' };
  }
  if (section === 'blog' && slug) {
    return { locale, preferSlug: slug, kind: 'blog' };
  }
  return { locale, preferSlug: null, kind: 'site' };
}
