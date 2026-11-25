'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { MessageCircle, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mergeQaLog, type QaLogRef } from '@/lib/qa/local/log';
import { priorQueryFromHistory } from '@/lib/qa/local/prepare';
import { useLocalQa } from '@/lib/qa/local/use-local-qa';
import { QA_GREETING, QA_NO_EVIDENCE, QA_UNAVAILABLE } from '@/lib/qa/retrieve';

/**
 * Inline markdown the model actually emits: [text](href) links, bare
 * [/path] citations, **bold**, *italic* and `code`. Anything else stays
 * literal text.
 */
const INLINE_MD =
  /\[([^\]]+)\]\(([^)\s]+)\)|\[(\/[^\]\s]+)\]|\*\*([^*]+)\*\*|\*([^*\s][^*]*?)\*|`([^`]+)`/g;

const ORDERED_LIST_LINE = /^\d+\.\s+/;

const SUGGESTION_KEYS = ['suggestionConsorcio', 'suggestionEducation', 'suggestionBiogas'] as const;

interface QaSource {
  title: string;
  href: string;
  citation: string;
}

function isQaSource(value: unknown): value is QaSource {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.title === 'string' &&
    typeof record.href === 'string' &&
    typeof record.citation === 'string'
  );
}

function sourcesFromParts(parts: readonly { type: string; data?: unknown }[]): QaSource[] {
  const sources: QaSource[] = [];
  for (const part of parts) {
    if (part.type !== 'data-qa-sources' || !part.data || typeof part.data !== 'object') continue;
    const raw = (part.data as { sources?: unknown }).sources;
    if (!Array.isArray(raw)) continue;
    for (const entry of raw) {
      if (isQaSource(entry)) sources.push(entry);
    }
  }
  return sources;
}

function safeHref(href: string): string | null {
  if (href.startsWith('/') && !href.startsWith('//')) return href;
  try {
    const url = new URL(href);
    if (url.protocol === 'http:' || url.protocol === 'https:') return href;
  } catch {
    return null;
  }
  return null;
}

function isListLine(line: string): boolean {
  return line.startsWith('*') || line.startsWith('-');
}

function isOrderedListLine(line: string): boolean {
  return ORDERED_LIST_LINE.test(line);
}

function listItemText(line: string): string {
  return line.slice(1).replace(/^\s/, '');
}

function orderedItemText(line: string): string {
  return line.replace(ORDERED_LIST_LINE, '');
}

function bareHrefLabel(href: string): string {
  return href.split('/').filter(Boolean).pop() ?? href;
}

function inlineCopy(text: string): ReactNode {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  for (const match of text.matchAll(INLINE_MD)) {
    const index = match.index ?? 0;
    if (index > lastIndex) nodes.push(text.slice(lastIndex, index));
    const [, linkText, linkHref, bareHref, bold, italic, code] = match;
    if (typeof linkText === 'string' && typeof linkHref === 'string') {
      const href = safeHref(linkHref);
      nodes.push(
        href ? (
          <a key={key} href={href} className="text-primary underline underline-offset-2">
            {linkText}
          </a>
        ) : (
          match[0]
        )
      );
    } else if (typeof bareHref === 'string') {
      const href = safeHref(bareHref);
      nodes.push(
        href ? (
          <a key={key} href={href} className="text-primary underline underline-offset-2">
            {bareHrefLabel(bareHref)}
          </a>
        ) : (
          match[0]
        )
      );
    } else if (typeof bold === 'string') {
      nodes.push(<strong key={key}>{bold}</strong>);
    } else if (typeof italic === 'string') {
      nodes.push(<em key={key}>{italic}</em>);
    } else if (typeof code === 'string') {
      nodes.push(
        <code key={key} className="font-mono text-[0.9em]">
          {code}
        </code>
      );
    } else {
      nodes.push(match[0]);
    }
    key += 1;
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function messageText(parts: readonly { type: string; text?: string }[]): string {
  return parts
    .filter((part) => part.type === 'text' && typeof part.text === 'string')
    .map((part) => part.text ?? '')
    .join('');
}

function assistantCopy(
  text: string,
  refusedLabel: string,
  helloLabel: string,
  unavailableLabel: string
): ReactNode {
  if (text === QA_NO_EVIDENCE) return refusedLabel;
  if (text === QA_GREETING) return helloLabel;
  if (text === QA_UNAVAILABLE) return unavailableLabel;

  const lines = text.split('\n');
  const blocks: ReactNode[] = [];
  let index = 0;
  let blockKey = 0;

  while (index < lines.length) {
    const line = lines[index] ?? '';
    if (isListLine(line)) {
      const items: string[] = [];
      while (index < lines.length && isListLine(lines[index] ?? '')) {
        items.push(listItemText(lines[index] ?? ''));
        index += 1;
      }
      blocks.push(
        <ul key={blockKey} className="list-disc space-y-1 pl-5">
          {items.map((item) => (
            <li key={`${blockKey}-${item}`}>{inlineCopy(item)}</li>
          ))}
        </ul>
      );
      blockKey += 1;
      continue;
    }
    if (isOrderedListLine(line)) {
      const items: string[] = [];
      while (index < lines.length && isOrderedListLine(lines[index] ?? '')) {
        items.push(orderedItemText(lines[index] ?? ''));
        index += 1;
      }
      blocks.push(
        <ol key={blockKey} className="list-decimal space-y-1 pl-5">
          {items.map((item) => (
            <li key={`${blockKey}-${item}`}>{inlineCopy(item)}</li>
          ))}
        </ol>
      );
      blockKey += 1;
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      !isListLine(lines[index] ?? '') &&
      !isOrderedListLine(lines[index] ?? '')
    ) {
      paragraph.push(lines[index] ?? '');
      index += 1;
    }
    const joined = paragraph.join('\n');
    if (joined.length > 0) {
      blocks.push(
        <p key={blockKey} className="whitespace-pre-wrap leading-relaxed">
          {inlineCopy(joined)}
        </p>
      );
      blockKey += 1;
    }
  }

  return blocks;
}

function RemoteMessage({
  message,
  refusedLabel,
  helloLabel,
  unavailableLabel,
  sourcesLabel,
}: {
  message: {
    id: string;
    role: string;
    parts: Array<{ type: string; text?: string; data?: unknown }>;
  };
  refusedLabel: string;
  helloLabel: string;
  unavailableLabel: string;
  sourcesLabel: string;
}) {
  const cited = message.role === 'assistant' ? sourcesFromParts(message.parts) : [];
  return (
    <div
      className={
        message.role === 'user'
          ? 'ml-8 rounded-md bg-primary/10 px-3 py-2 text-sm leading-relaxed text-foreground'
          : 'mr-8 rounded-md bg-muted px-3 py-2 text-sm leading-relaxed text-foreground'
      }
    >
      {message.role === 'assistant' ? (
        <p className="text-display text-xs text-primary">JZ</p>
      ) : null}
      {message.parts.map((part) => {
        if (part.type !== 'text' || typeof part.text !== 'string') return null;
        if (message.role === 'assistant') {
          return (
            <div key={`${message.id}-assistant-${part.text}`}>
              {assistantCopy(part.text, refusedLabel, helloLabel, unavailableLabel)}
            </div>
          );
        }
        return (
          <p
            key={`${message.id}-user-${part.text}`}
            className="whitespace-pre-wrap leading-relaxed"
          >
            {part.text}
          </p>
        );
      })}
      {cited.length > 0 ? (
        <div className="mt-2 border-t border-border pt-2">
          <p className="text-xs text-muted-foreground">{sourcesLabel}</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {cited.map((source) => {
              const href = safeHref(source.href);
              return (
                <li key={`${source.href}:${source.citation}`}>
                  {href ? (
                    <a href={href} className="text-primary underline underline-offset-2">
                      {source.citation}
                    </a>
                  ) : (
                    source.citation
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function PublishedQaForm() {
  const t = useTranslations('PublishedQa');
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const requestRef = useRef({ locale, path: pathname });
  const logRef = useRef<HTMLDivElement>(null);
  const orderRef = useRef<QaLogRef[]>([]);
  const local = useLocalQa();
  requestRef.current = { locale, path: pathname };
  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: '/api/qa',
        prepareSendMessagesRequest: ({ body, messages, id, trigger, messageId }) => ({
          body: {
            ...body,
            id,
            messages,
            trigger,
            messageId,
            locale: requestRef.current.locale,
            path: requestRef.current.path,
          },
        }),
      })
  );
  const { messages, sendMessage, status, error } = useChat({ transport });
  const remotePending = status === 'submitted' || status === 'streaming';
  const pending = remotePending || local.pending;
  const order = mergeQaLog(
    orderRef.current,
    messages.map((message) => message.id),
    local.turns.map((turn) => turn.id)
  );
  orderRef.current = order;
  const history = order.flatMap((item) => {
    if (item.origin === 'local') {
      const turn = local.turns.find((entry) => entry.id === item.id);
      return turn ? [{ role: turn.role, text: turn.text }] : [];
    }
    const message = messages.find((entry) => entry.id === item.id);
    if (!message) return [];
    return [{ role: message.role, text: messageText(message.parts) }];
  });
  const latest = order.at(-1);
  const latestLocal =
    latest?.origin === 'local' ? local.turns.find((turn) => turn.id === latest.id) : undefined;
  const waitingForLocalTokens =
    local.pending && (latestLocal?.role !== 'assistant' || latestLocal.text.length === 0);
  const showWriting = remotePending || waitingForLocalTokens;
  const transcriptSize =
    messages.reduce((total, message) => total + messageText(message.parts).length, 0) +
    local.turns.reduce((total, turn) => total + turn.text.length, 0);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    const log = logRef.current;
    if (!log) return;
    if (transcriptSize === 0 && !pending) return;
    log.scrollTop = log.scrollHeight;
  }, [transcriptSize, pending]);

  async function submitText(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    setInput('');
    // Cloud path stays synchronous so the existing transport receives the turn
    // before the handler yields. Local mode is the only await.
    if (local.session.phase !== 'ready') {
      sendMessage({ text: trimmed });
      return;
    }
    const outcome = await local.ask(trimmed, {
      locale,
      path: pathname,
      priorQuery: priorQueryFromHistory(history),
    });
    if (outcome === 'fallback') sendMessage({ text: trimmed });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitText(input);
  }

  return (
    <div className="fixed right-6 bottom-6 z-40 flex flex-col items-end gap-3 print:hidden">
      {open ? (
        <div
          id="published-qa-panel"
          role="dialog"
          aria-labelledby="published-qa-heading"
          aria-busy={pending}
          className="flex h-[min(28rem,70vh)] w-[min(24rem,calc(100vw-2rem))] flex-col rounded-xl border border-border bg-background text-foreground"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 id="published-qa-heading" className="text-display text-lg text-foreground">
              {t('heading')}
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t('close')}
              className="text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
          <div
            ref={logRef}
            className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {order.length === 0 && !pending ? (
              <div className="flex flex-col gap-2">
                {SUGGESTION_KEYS.map((key) => (
                  <Button
                    key={key}
                    type="button"
                    variant="outline"
                    className="h-11 justify-start whitespace-normal text-left"
                    onClick={() => void submitText(t(key))}
                  >
                    {t(key)}
                  </Button>
                ))}
              </div>
            ) : null}
            {order.map((item) => {
              if (item.origin === 'local') {
                const turn = local.turns.find((entry) => entry.id === item.id);
                if (!turn || (turn.role === 'assistant' && turn.text.length === 0)) return null;
                return (
                  <div
                    key={`local-${turn.id}`}
                    className={
                      turn.role === 'user'
                        ? 'ml-8 rounded-md bg-primary/10 px-3 py-2 text-sm leading-relaxed text-foreground'
                        : 'mr-8 rounded-md bg-muted px-3 py-2 text-sm leading-relaxed text-foreground'
                    }
                  >
                    {turn.role === 'assistant' ? (
                      <p className="text-display text-xs text-primary">JZ</p>
                    ) : null}
                    {turn.role === 'assistant' ? (
                      <div>
                        {assistantCopy(turn.text, t('refused'), t('hello'), t('unavailable'))}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">{turn.text}</p>
                    )}
                    {turn.sources.length > 0 ? (
                      <div className="mt-2 border-t border-border pt-2">
                        <p className="text-xs text-muted-foreground">{t('sources')}</p>
                        <ul className="mt-1 list-disc space-y-1 pl-5">
                          {turn.sources.map((source) => {
                            const href = safeHref(source.href);
                            return (
                              <li key={`${source.href}:${source.citation}`}>
                                {href ? (
                                  <a
                                    href={href}
                                    className="text-primary underline underline-offset-2"
                                  >
                                    {source.citation}
                                  </a>
                                ) : (
                                  source.citation
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                );
              }
              const message = messages.find((entry) => entry.id === item.id);
              if (!message) return null;
              return (
                <RemoteMessage
                  key={`remote-${message.id}`}
                  message={message}
                  refusedLabel={t('refused')}
                  helloLabel={t('hello')}
                  unavailableLabel={t('unavailable')}
                  sourcesLabel={t('sources')}
                />
              );
            })}
            {showWriting ? (
              <p className="text-sm leading-relaxed text-muted-foreground">{t('writing')}</p>
            ) : null}
          </div>
          <div className="border-t border-border px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="published-qa-local" className="text-sm text-foreground">
                {t('localToggle')}
              </label>
              <input
                id="published-qa-local"
                type="checkbox"
                role="switch"
                aria-checked={local.switchOn}
                checked={local.switchOn}
                disabled={local.session.phase === 'probing' || local.session.phase === 'loading'}
                onChange={() => local.toggle()}
                className="size-4 accent-primary"
              />
            </div>
            {local.session.phase === 'probing' ? (
              <p className="mt-2 text-sm text-muted-foreground">{t('localChecking')}</p>
            ) : null}
            {local.session.phase === 'confirm' ? (
              <fieldset className="mt-2 flex min-w-0 flex-col gap-2 border-0 p-0">
                <legend
                  id="published-qa-local-confirm"
                  className="text-sm font-medium text-foreground"
                >
                  {t('localConfirmTitle')}
                </legend>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t('localConfirmBody', { size: local.session.downloadLabel ?? '~1 GB' })}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={() => local.confirm()}>
                    {t('localConfirm')}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => local.cancel()}>
                    {t('localCancel')}
                  </Button>
                </div>
              </fieldset>
            ) : null}
            {local.session.phase === 'loading' ? (
              <div className="mt-2 flex flex-col gap-2">
                <p className="text-sm text-muted-foreground" role="status">
                  {t(local.session.cached ? 'localCached' : 'localProgress', {
                    percent: local.session.progress,
                  })}
                </p>
                <progress className="w-full" max={100} value={local.session.progress} />
                <Button type="button" variant="outline" onClick={() => local.cancel()}>
                  {t('localCancel')}
                </Button>
              </div>
            ) : null}
            {local.session.phase === 'ready' ? (
              <p className="mt-2 text-sm text-muted-foreground">{t('localReady')}</p>
            ) : null}
            {local.notice ? (
              <p className="mt-2 text-sm text-muted-foreground" role="status">
                {local.notice === 'unsupported' ? t('localUnsupported') : t('localFallback')}
              </p>
            ) : null}
          </div>
          <form onSubmit={onSubmit} className="border-t border-border p-3">
            <div className="flex flex-col gap-2">
              <label htmlFor="published-qa-query" className="text-sm font-medium text-foreground">
                {t('label')}
              </label>
              <div className="flex gap-2">
                <Input
                  id="published-qa-query"
                  name="query"
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  required
                  autoComplete="off"
                  maxLength={500}
                  disabled={pending}
                  className="border-border bg-background text-foreground"
                />
                <Button type="submit" disabled={pending}>
                  {t('submit')}
                </Button>
              </div>
            </div>
            {error ? <p className="mt-2 text-sm text-error">{t('error')}</p> : null}
          </form>
        </div>
      ) : null}
      <Button
        type="button"
        size="icon"
        aria-label={t('heading')}
        aria-expanded={open}
        aria-controls={open ? 'published-qa-panel' : undefined}
        onClick={() => setOpen((current) => !current)}
      >
        <MessageCircle className="size-5" />
      </Button>
    </div>
  );
}
