import { parsePublishedQaPath } from '@/lib/qa/path';
import { publishedPreferSlug, publishedQuestion, publishedSystemPrompt } from '@/lib/qa/prompt';
import { QA_GREETING, QA_NO_EVIDENCE, retrievePublishedChunks } from '@/lib/qa/retrieve';
import { isGreeting } from '@/lib/qa/text';
import { QA_LOCALE, type QaChunk, type QaLocale } from '@/lib/qa/types';

export interface LocalHistoryEntry {
  role: string;
  text: string;
}

export function asQaLocale(locale: string): QaLocale {
  return locale === QA_LOCALE.EN ? QA_LOCALE.EN : QA_LOCALE.ES;
}

/** Latest user turn already on screen. The question being sent is not included. */
export function priorQueryFromHistory(entries: readonly LocalHistoryEntry[]): string | null {
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const entry = entries[index];
    if (entry?.role !== 'user') continue;
    const text = entry.text.trim().slice(0, 300);
    return text.length > 0 ? text : null;
  }
  return null;
}

export type PreparedLocalTurn =
  | { kind: 'canned'; text: string }
  | { kind: 'generate'; system: string; question: string; chunks: QaChunk[] };

/**
 * Same gates as the Gemini route: greeting sentinel, BM25 top-4 with the
 * 0.25 core-token floor, then the shared system prompt. No model call when
 * retrieval is empty.
 */
export function prepareLocalTurn(input: {
  query: string;
  priorQuery: string | null;
  locale: QaLocale;
  path: string;
  chunks: readonly QaChunk[];
}): PreparedLocalTurn {
  if (isGreeting(input.query)) {
    return { kind: 'canned', text: QA_GREETING };
  }

  const parsed = input.path ? parsePublishedQaPath(input.path).preferSlug : null;
  const preferSlug = publishedPreferSlug(parsed);
  const retrieved = retrievePublishedChunks(input.query, input.chunks, input.locale, {
    preferSlug,
    priorQuery: input.priorQuery,
  });
  if (retrieved.length === 0) {
    return { kind: 'canned', text: QA_NO_EVIDENCE };
  }

  return {
    kind: 'generate',
    system: publishedSystemPrompt(input.locale, retrieved, preferSlug),
    question: publishedQuestion(input.query),
    chunks: retrieved,
  };
}
