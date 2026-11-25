import { stripThinking } from '@/lib/qa/local/assistant-text';
import { filterUngroundedLinks } from '@/lib/qa/local/links';
import { asQaLocale, prepareLocalTurn } from '@/lib/qa/local/prepare';
import { publishedSourceList } from '@/lib/qa/prompt';

export interface LocalGenerator {
  generate(options: {
    system: string;
    question: string;
    onToken: (text: string) => void;
  }): Promise<string>;
}

export interface LocalRunResult {
  text: string;
  sources: ReturnType<typeof publishedSourceList>;
}

let snapshotPromise: Promise<typeof import('@/lib/qa/snapshot')> | null = null;

function loadSnapshotModule() {
  snapshotPromise ??= import('@/lib/qa/snapshot');
  return snapshotPromise;
}

/**
 * Retrieval and the system prompt run on the main thread. The worker only
 * sees the already-grounded prompt. Link targets that are not in the chunks
 * are removed after generation.
 */
export async function runLocalAnswer(input: {
  engine: LocalGenerator;
  query: string;
  priorQuery: string | null;
  locale: string;
  path: string;
  onToken: (text: string) => void;
}): Promise<LocalRunResult> {
  const { buildPublishedSnapshot } = await loadSnapshotModule();
  const snapshot = buildPublishedSnapshot();
  const locale = asQaLocale(input.locale);
  const prepared = prepareLocalTurn({
    query: input.query,
    priorQuery: input.priorQuery,
    locale,
    path: input.path,
    chunks: snapshot[locale],
  });

  if (prepared.kind === 'canned') {
    return { text: prepared.text, sources: [] };
  }

  const raw = await input.engine.generate({
    system: prepared.system,
    question: prepared.question,
    onToken: input.onToken,
  });
  const text = filterUngroundedLinks(stripThinking(raw), prepared.chunks);
  if (!text.trim()) {
    throw new Error('empty local answer');
  }
  return { text, sources: publishedSourceList(prepared.chunks) };
}
