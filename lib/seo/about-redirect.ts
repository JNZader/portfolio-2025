export type AboutRedirectParams = Readonly<Record<string, string | readonly string[] | undefined>>;

export function buildAboutRedirect(locale: string, params: AboutRedirectParams): string {
  const path = locale === 'en' ? '/en' : '/';
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    for (const entry of Array.isArray(value) ? value : value === undefined ? [] : [value]) {
      query.append(key, entry);
    }
  }
  const serializedQuery = query.toString();
  return `${path}${serializedQuery ? `?${serializedQuery}` : ''}#sobre-mi`;
}
