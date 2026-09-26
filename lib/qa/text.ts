const STOPWORDS = new Set([
  'que',
  'cual',
  'cuales',
  'como',
  'donde',
  'cuando',
  'el',
  'la',
  'los',
  'las',
  'un',
  'una',
  'unos',
  'unas',
  'de',
  'del',
  'al',
  'en',
  'es',
  'son',
  'por',
  'con',
  'para',
  'sobre',
  'me',
  'te',
  'se',
  'mi',
  'mis',
  'tu',
  'tus',
  'su',
  'sus',
  'tenes',
  'tienes',
  'tengo',
  'tiene',
  'the',
  'and',
  'for',
  'with',
  'your',
  'you',
  'what',
  'how',
  'does',
  'did',
  'have',
  'has',
  'about',
  'from',
  'that',
  'this',
  'are',
  'was',
]);

/** Title tokens that show up on more than one project and must not select one. */
export const GENERIC_TITLE_TOKENS = new Set(['platform']);

export function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function tokenize(value: string): string[] {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token));
}
