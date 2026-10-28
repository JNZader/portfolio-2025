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
  'tienen',
  'hace',
  'hiciste',
  'hizo',
  'era',
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
  'do',
  'did',
  'es',
  'un',
  'el',
  'lo',
  'al',
  'en',
  'ya',
  'se',
  'te',
  'me',
  'mi',
  'tu',
  'su',
  'yo',
  'si',
  'ni',
  'no',
  'ok',
  'va',
  've',
  'oy',
  'eh',
  'or',
  'if',
  'at',
  'on',
  'in',
  'of',
  'to',
  'is',
  'it',
  'be',
  'as',
  'an',
  'my',
  'we',
  'he',
  'so',
]);

/** Title tokens that show up on more than one project and must not select one. */
export const GENERIC_TITLE_TOKENS = new Set(['platform']);

/** Query-side synonyms, keyed by stemmed token. Matched at a discount in scoring. */
const SYNONYMS: Record<string, readonly string[]> = {
  ia: ['inteligencia', 'artificial'],
  ai: ['ia', 'inteligencia', 'artificial'],
  inteligencia: ['ia', 'ai', 'artificial'],
  artificial: ['ia', 'ai', 'inteligencia'],
  stack: ['tecnologia', 'herramienta', 'framework'],
  tecnologia: ['stack', 'herramienta', 'framework'],
  herramienta: ['stack', 'tecnologia'],
  framework: ['stack', 'tecnologia'],
  formacion: ['educacion', 'estudio'],
  educacion: ['formacion', 'estudio'],
  estudio: ['formacion', 'educacion'],
  proyecto: ['trabajo'],
  trabajo: ['proyecto'],
  titulo: ['degree', 'carrera'],
  degree: ['titulo', 'carrera'],
};

export function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Naive plural stemmer applied identically to corpus and query text so both
 * sides agree ("proyectos" and "proyecto" produce the same token). Only the
 * trailing "s" is stripped: vowel-final plurals (cliente/clientes,
 * service/services, pipeline/pipelines) dominate this corpus, and also
 * stripping "es" would split them into mismatched stems (servic vs service).
 */
function stemPlural(token: string): string {
  if (token.endsWith('s') && token.length >= 4) return token.slice(0, -1);
  return token;
}

/**
 * Two-character tokens are kept: "IA", "AI", "CV" and friends are legitimate
 * portfolio questions. STOPWORDS carries the noise ("el", "un", "es", "to").
 */
export function tokenize(value: string): string[] {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((token) => token.length >= 2 && !STOPWORDS.has(token))
    .map(stemPlural);
}

export interface WeightedToken {
  token: string;
  weight: number;
}

/**
 * Core query tokens at their weight plus their synonyms at a discount.
 * Synonyms only widen recall for ranking; the retrieval floor still counts
 * core tokens.
 */
export function expandQueryTokens(tokens: readonly string[], weight = 1): WeightedToken[] {
  const weighted: WeightedToken[] = tokens.map((token) => ({ token, weight }));
  const seen = new Set(tokens);
  for (const token of tokens) {
    for (const synonym of SYNONYMS[token] ?? []) {
      if (seen.has(synonym)) continue;
      seen.add(synonym);
      weighted.push({ token: synonym, weight: weight * 0.75 });
    }
  }
  return weighted;
}

const GREETING_WORDS = new Set([
  'hola',
  'holis',
  'hello',
  'hey',
  'hi',
  'buenas',
  'buen',
  'tardes',
  'dias',
  'noches',
  'que',
  'tal',
]);

export function isGreeting(query: string): boolean {
  const tokens = normalize(query)
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((token) => token.length > 0);

  if (tokens.length === 0) return false;

  let sawGreeting = false;
  for (const token of tokens) {
    if (GREETING_WORDS.has(token)) {
      sawGreeting = true;
      continue;
    }
    if (token.length < 3) continue;
    return false;
  }
  return sawGreeting;
}
