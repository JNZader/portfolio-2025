import { GENERIC_TITLE_TOKENS, tokenize } from '@/lib/qa/text';
import {
  QA_KIND,
  QA_MATCH_STATUS,
  type QaChunk,
  type QaLocale,
  type QaMatch,
} from '@/lib/qa/types';

const EDUCATION_INTENT = new Set([
  'titulo',
  'title',
  'degree',
  'formacion',
  'capacitacion',
  'training',
  'universidad',
  'university',
  'education',
  'certificado',
  'certification',
  'certificate',
  'carrera',
]);

/** Generic "what did you study" wording. A named course outranks this. */
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

const LEXICAL_THRESHOLD = 0.6;
const EDUCATION_LEXICAL_THRESHOLD = 0.5;

interface TitleCandidate {
  slug: string;
  title: string;
  score: number;
  matched: number;
}

function refuse(): QaMatch {
  return { status: QA_MATCH_STATUS.REFUSED };
}

function hit(chunk: QaChunk): QaMatch {
  return { status: QA_MATCH_STATUS.HIT, chunk };
}

function titleTokens(title: string): string[] {
  return tokenize(title).filter((token) => !GENERIC_TITLE_TOKENS.has(token));
}

function titleMatch(
  queryTokens: readonly string[],
  title: string
): Pick<TitleCandidate, 'score' | 'matched'> {
  const tokens = titleTokens(title);
  if (tokens.length === 0) return { score: 0, matched: 0 };
  const query = new Set(queryTokens);
  const matched = tokens.filter((token) => query.has(token)).length;
  return { score: matched / tokens.length, matched };
}

function titleCandidates(
  queryTokens: readonly string[],
  chunks: readonly QaChunk[]
): TitleCandidate[] {
  const titles = new Map<string, string>();
  for (const chunk of chunks) {
    if (chunk.kind === QA_KIND.EDUCATION || titles.has(chunk.slug)) continue;
    titles.set(chunk.slug, chunk.title);
  }

  return [...titles.entries()]
    .map(([slug, title]) => ({ slug, title, ...titleMatch(queryTokens, title) }))
    .filter((candidate) => candidate.matched > 0);
}

function selectTitles(candidates: readonly TitleCandidate[]): TitleCandidate[] {
  const bestScore = candidates.reduce((best, candidate) => Math.max(best, candidate.score), 0);
  if (bestScore <= 0) return [];
  const atScore = candidates.filter((candidate) => candidate.score === bestScore);
  const bestMatched = atScore.reduce((best, candidate) => Math.max(best, candidate.matched), 0);
  return atScore.filter((candidate) => candidate.matched === bestMatched);
}

function lexical(queryTokens: readonly string[], text: string): number {
  if (queryTokens.length === 0) return 0;
  const words = new Set(tokenize(text));
  const overlap = queryTokens.filter((token) => words.has(token)).length;
  return overlap / queryTokens.length;
}

function bestLexical(queryTokens: readonly string[], chunks: readonly QaChunk[]): QaChunk | null {
  let best: QaChunk | null = null;
  let bestScore = 0;
  for (const chunk of chunks) {
    const score = lexical(queryTokens, `${chunk.heading ?? ''} ${chunk.text}`);
    if (score > bestScore) {
      best = chunk;
      bestScore = score;
    }
  }
  return bestScore >= LEXICAL_THRESHOLD ? best : null;
}

function isFormalDegree(chunk: QaChunk): boolean {
  const haystack = `${chunk.title} ${chunk.heading ?? ''}`.toLowerCase();
  return haystack.includes('universidad') || haystack.includes('university');
}

/**
 * "qué título tenés" does not overlap the resume wording. When nothing in the
 * question names a course, the formal-degree record is the answer.
 */
function matchEducation(queryTokens: readonly string[], chunks: readonly QaChunk[]): QaMatch {
  const education = chunks.filter((chunk) => chunk.kind === QA_KIND.EDUCATION);
  let best: QaChunk | null = null;
  let bestScore = 0;
  for (const chunk of education) {
    const score = lexical(queryTokens, `${chunk.title} ${chunk.heading ?? ''} ${chunk.text}`);
    if (score > bestScore) {
      best = chunk;
      bestScore = score;
    }
  }

  if (best && bestScore >= EDUCATION_LEXICAL_THRESHOLD) return hit(best);

  const formalIntent = queryTokens.some((token) => FORMAL_INTENT.has(token));
  if (formalIntent && bestScore === 0) {
    const formal = education.find(isFormalDegree);
    if (formal) return hit(formal);
  }

  return refuse();
}

function matchNamedProject(
  queryTokens: readonly string[],
  chunks: readonly QaChunk[],
  selected: readonly TitleCandidate[]
): QaMatch {
  const slugs = new Set(selected.map((candidate) => candidate.slug));
  const projectChunks = chunks.filter((chunk) => slugs.has(chunk.slug));
  const covered = new Set(selected.flatMap((candidate) => titleTokens(candidate.title)));
  const residual = queryTokens.filter((token) => !covered.has(token));
  const opening = projectChunks[0];
  if (!opening) return refuse();
  if (residual.length === 0) return hit(opening);

  const specific = bestLexical(residual, projectChunks);
  return specific ? hit(specific) : hit(opening);
}

export function matchQuery(query: string, chunks: readonly QaChunk[], locale: QaLocale): QaMatch {
  const scoped = chunks.filter((chunk) => chunk.locale === locale);
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0 || scoped.length === 0) return refuse();

  const selected = selectTitles(titleCandidates(queryTokens, scoped));
  if (selected.length > 0) return matchNamedProject(queryTokens, scoped, selected);

  const educationIntent = queryTokens.some((token) => EDUCATION_INTENT.has(token));
  if (educationIntent) return matchEducation(queryTokens, scoped);

  const found = bestLexical(queryTokens, scoped);
  return found ? hit(found) : refuse();
}
