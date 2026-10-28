import { expandQueryTokens, tokenize } from '@/lib/qa/text';
import { QA_KIND, type QaChunk, type QaLocale } from '@/lib/qa/types';

/** Assistant text when retrieval is empty. UI maps this to catalogue copy. */
export const QA_NO_EVIDENCE = 'NO_PUBLISHED_QUOTE';

/** Assistant text for greeting-only questions. UI maps this to catalogue copy. */
export const QA_GREETING = 'PUBLISHED_QA_GREETING';

/** Assistant text when every configured model failed. UI maps this to catalogue copy. */
export const QA_UNAVAILABLE = 'PUBLISHED_QA_UNAVAILABLE';

/**
 * Question wording that means education. Includes the study verb family
 * ("¿dónde estudiaste?", "Where did you study?") because those questions
 * carry a single informative token that matches no corpus text — the
 * formal-degree shortcut is their only route to an answer.
 */
const FORMAL_INTENT = new Set([
  'titulo',
  'title',
  'degree',
  'formacion',
  'capacitacion',
  'training',
  'universidad',
  'university',
  'education',
  'educacion',
  'carrera',
  'estudiaste',
  'estudie',
  'estudias',
  'estudio',
  'studied',
  'study',
  'studie',
]);

/** Fraction of core query tokens that must appear in a chunk for it to qualify. */
const CORE_TOKEN_FLOOR = 0.25;
const TOP_K = 4;

/** BM25 saturation constants. */
const K1 = 1.2;
const B = 0.75;

/** Extra score when a token also matches the chunk title/heading. */
const TITLE_MATCH_BONUS = 0.5;

/** Ranking multiplier for chunks of the page the user is viewing. */
const PREFER_SLUG_BOOST = 1.25;

/** Weight of prior-turn tokens in ranking. Context, never qualification. */
const PRIOR_QUERY_WEIGHT = 0.7;

function termFrequencies(text: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const token of tokenize(text)) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  return counts;
}

function haystack(chunk: QaChunk): string {
  return `${chunk.title} ${chunk.heading ?? ''} ${chunk.text}`;
}

function isFormalDegree(chunk: QaChunk): boolean {
  const heading = `${chunk.title} ${chunk.heading ?? ''}`.toLowerCase();
  return heading.includes('universidad') || heading.includes('university');
}

/**
 * Deterministic lexical retrieval with idf-weighted ranking.
 *
 * Ranking: BM25-style saturation over the query tokens (synonyms and the
 * prior turn's tokens discounted), a bonus for title/heading matches, and a
 * boost for the slug the user is currently viewing. Qualification: a chunk
 * must contain at least CORE_TOKEN_FLOOR of the CURRENT question's tokens,
 * so neither prior context nor ubiquitous tokens alone can rescue an
 * unrelated chunk.
 */
export function retrievePublishedChunks(
  query: string,
  chunks: readonly QaChunk[],
  locale: QaLocale,
  options?: { preferSlug?: string | null; priorQuery?: string | null }
): QaChunk[] {
  const scoped = chunks.filter((chunk) => chunk.locale === locale);
  const coreTokens = [...new Set(tokenize(query))];
  if (coreTokens.length === 0 || scoped.length === 0) return [];

  const priorTokens = options?.priorQuery
    ? [...new Set(tokenize(options.priorQuery))].filter((token) => !coreTokens.includes(token))
    : [];
  const scoringTokens = [
    ...expandQueryTokens(coreTokens, 1),
    ...expandQueryTokens(priorTokens, PRIOR_QUERY_WEIGHT),
  ];

  const documents = scoped.map((chunk) => ({
    chunk,
    terms: termFrequencies(haystack(chunk)),
    titleTerms: new Set(tokenize(`${chunk.title} ${chunk.heading ?? ''}`)),
    length: tokenize(haystack(chunk)).length,
  }));
  const averageLength =
    documents.reduce((total, entry) => total + entry.length, 0) / documents.length || 1;

  const documentFrequency = new Map<string, number>();
  for (const entry of documents) {
    for (const token of entry.terms.keys()) {
      documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1);
    }
  }

  const idf = (token: string): number => {
    const df = documentFrequency.get(token) ?? 0;
    return Math.log(1 + (scoped.length - df + 0.5) / (df + 0.5));
  };

  const preferSlug = options?.preferSlug ?? null;
  const scored = documents.map((entry) => {
    const matchedCore = new Set(
      coreTokens.filter((token) => entry.terms.has(token) || entry.titleTerms.has(token))
    );

    let score = 0;
    for (const { token, weight } of scoringTokens) {
      const tf = entry.terms.get(token);
      if (!tf && !entry.titleTerms.has(token)) continue;
      const frequency = tf ?? 0;
      const saturation =
        (frequency * (K1 + 1)) / (frequency + K1 * (1 - B + (B * entry.length) / averageLength));
      const titleBonus = entry.titleTerms.has(token) ? TITLE_MATCH_BONUS : 0;
      score += weight * idf(token) * (saturation + titleBonus);
    }

    const coreCoverage = matchedCore.size / coreTokens.length;
    const qualified = coreCoverage >= CORE_TOKEN_FLOOR;
    const boosted = preferSlug !== null && entry.chunk.slug === preferSlug ? PREFER_SLUG_BOOST : 1;

    return { chunk: entry.chunk, qualified, score: score * boosted };
  });

  const ranked = scored
    .filter((entry) => entry.qualified && entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, TOP_K)
    .map((entry) => entry.chunk);

  const formalIntent = coreTokens.some((token) => FORMAL_INTENT.has(token));
  if (!formalIntent) return ranked;

  /**
   * The formal-degree shortcut applies only to questions phrased purely
   * about education ("¿dónde estudiaste?", "Where did you study?"): every
   * informative token is education vocabulary, yet none of it matches the
   * corpus records ("study" only appears inside "case study" prose). Hybrid
   * questions ("estudio de caso de apigen") keep their project results, and
   * questions that already surfaced an education chunk (the CCNA record)
   * keep those.
   */
  const hasEducation = ranked.some((chunk) => chunk.kind === QA_KIND.EDUCATION);
  if (hasEducation) return ranked;
  const purelyEducation = coreTokens.every((token) => FORMAL_INTENT.has(token));
  if (!purelyEducation) return ranked;

  const education = scoped.filter((chunk) => chunk.kind === QA_KIND.EDUCATION);
  const formal = education.find(isFormalDegree);
  if (!formal) return ranked;
  return [formal];
}
