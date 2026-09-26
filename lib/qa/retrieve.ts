import { tokenize } from '@/lib/qa/text';
import { QA_KIND, type QaChunk, type QaLocale } from '@/lib/qa/types';

/** Assistant text when retrieval is empty. UI maps this to catalogue copy. */
export const QA_NO_EVIDENCE = 'NO_PUBLISHED_QUOTE';

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
  'carrera',
]);

const LEXICAL_FLOOR = 0.25;
const TOP_K = 4;

function lexical(queryTokens: readonly string[], text: string): number {
  if (queryTokens.length === 0) return 0;
  const words = new Set(tokenize(text));
  const overlap = queryTokens.filter((token) => words.has(token)).length;
  return overlap / queryTokens.length;
}

function haystack(chunk: QaChunk): string {
  return `${chunk.title} ${chunk.heading ?? ''} ${chunk.text}`;
}

function isFormalDegree(chunk: QaChunk): boolean {
  const heading = `${chunk.title} ${chunk.heading ?? ''}`.toLowerCase();
  return heading.includes('universidad') || heading.includes('university');
}

export function retrievePublishedChunks(
  query: string,
  chunks: readonly QaChunk[],
  locale: QaLocale
): QaChunk[] {
  const scoped = chunks.filter((chunk) => chunk.locale === locale);
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0 || scoped.length === 0) return [];

  const ranked = scoped
    .map((chunk) => ({ chunk, score: lexical(queryTokens, haystack(chunk)) }))
    .filter((entry) => entry.score >= LEXICAL_FLOOR)
    .sort((left, right) => right.score - left.score)
    .slice(0, TOP_K)
    .map((entry) => entry.chunk);

  const formalIntent = queryTokens.some((token) => FORMAL_INTENT.has(token));
  if (!formalIntent) return ranked;

  const education = scoped.filter((chunk) => chunk.kind === QA_KIND.EDUCATION);
  const educationOverlap = education.reduce((best, chunk) => {
    return Math.max(best, lexical(queryTokens, haystack(chunk)));
  }, 0);
  if (educationOverlap !== 0) return ranked;

  const formal = education.find(isFormalDegree);
  if (!formal) return ranked;
  if (ranked.some((chunk) => chunk.id === formal.id)) return ranked;
  return [...ranked, formal];
}
