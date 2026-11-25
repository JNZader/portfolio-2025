import { readFileSync, writeFileSync } from 'node:fs';
import { prepareLocalTurn } from '@/lib/qa/local/prepare';
import { publishedPreferSlug, publishedQuestion, publishedSystemPrompt } from '@/lib/qa/prompt';
import { buildPublishedSnapshot } from '@/lib/qa/snapshot';
import type { QaChunk, QaLocale } from '@/lib/qa/types';

export interface RenderRequest {
  id: string;
  locale: QaLocale;
  preferSlug: string | null;
  query: string;
  chunks: QaChunk[];
}

export interface PrepareRequest {
  id: string;
  query: string;
  locale: QaLocale;
  path: string;
  priorQuery: string | null;
}

function isLocale(value: string): value is QaLocale {
  return value === 'es' || value === 'en';
}

function asLocale(value: unknown): QaLocale {
  if (typeof value !== 'string' || !isLocale(value)) {
    throw new Error(`locale must be es or en, got ${String(value)}`);
  }
  return value;
}

/** Same strings the Gemini route and the local worker put in the prompt. */
export function renderPrompt(
  locale: QaLocale,
  chunks: readonly QaChunk[],
  preferSlug: string | null,
  query: string
): { system: string; question: string } {
  return {
    system: publishedSystemPrompt(locale, chunks, publishedPreferSlug(preferSlug)),
    question: publishedQuestion(query),
  };
}

export function dumpCorpus(): { es: QaChunk[]; en: QaChunk[] } {
  return buildPublishedSnapshot();
}

function flag(argv: readonly string[], name: string): string {
  const index = argv.indexOf(name);
  const value = index >= 0 ? argv[index + 1] : undefined;
  if (!value || value.startsWith('--')) throw new Error(`missing ${name}`);
  return value;
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8')) as unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function chunkList(value: unknown): QaChunk[] {
  if (!Array.isArray(value)) throw new Error('chunks must be an array');
  return value.map((item) => {
    if (!isRecord(item)) throw new Error('chunk must be an object');
    return item as unknown as QaChunk;
  });
}

export function main(argv: readonly string[]): void {
  const [command, ...rest] = argv;
  if (command === 'dump') {
    const snapshot = dumpCorpus();
    const chunks = [...snapshot.es, ...snapshot.en];
    writeFileSync(
      flag(rest, '--out'),
      `${JSON.stringify({ version: 1, chunks }, null, 2)}\n`
    );
    return;
  }

  if (command === 'render') {
    const body = readJson(flag(rest, '--requests'));
    if (!isRecord(body) || !Array.isArray(body.items)) {
      throw new Error('render requests need an items array');
    }
    const rendered = body.items.map((item) => {
      if (!isRecord(item) || typeof item.id !== 'string' || typeof item.query !== 'string') {
        throw new Error('render item needs id and query');
      }
      const locale = asLocale(item.locale);
      const preferSlug = typeof item.preferSlug === 'string' ? item.preferSlug : null;
      const prompt = renderPrompt(locale, chunkList(item.chunks), preferSlug, item.query);
      return { id: item.id, system: prompt.system, question: prompt.question };
    });
    writeFileSync(flag(rest, '--out'), `${JSON.stringify({ items: rendered })}\n`);
    return;
  }

  if (command === 'prepare') {
    const body = readJson(flag(rest, '--requests'));
    if (!isRecord(body) || !Array.isArray(body.items)) {
      throw new Error('prepare requests need an items array');
    }
    const snapshot = dumpCorpus();
    const prepared = body.items.map((item) => {
      if (!isRecord(item) || typeof item.id !== 'string' || typeof item.query !== 'string') {
        throw new Error('prepare item needs id and query');
      }
      const locale = asLocale(item.locale);
      const path = typeof item.path === 'string' ? item.path : '/';
      const priorQuery = typeof item.priorQuery === 'string' ? item.priorQuery : null;
      const turn = prepareLocalTurn({
        query: item.query,
        priorQuery,
        locale,
        path,
        chunks: snapshot[locale],
      });
      if (turn.kind === 'canned') {
        return { id: item.id, kind: 'canned' as const, text: turn.text, chunks: [] };
      }
      return {
        id: item.id,
        kind: 'generate' as const,
        system: turn.system,
        question: turn.question,
        chunks: turn.chunks,
      };
    });
    writeFileSync(flag(rest, '--out'), `${JSON.stringify({ items: prepared })}\n`);
    return;
  }

  throw new Error('usage: qa-bridge dump|render|prepare --out <file> [--requests <file>]');
}
