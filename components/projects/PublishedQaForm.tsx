'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { MessageCircle, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QA_GREETING, QA_NO_EVIDENCE } from '@/lib/qa/retrieve';

const MARKDOWN_LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

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

function listItemText(line: string): string {
  return line.slice(1).replace(/^\s/, '');
}

function inlineCopy(text: string): ReactNode {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  for (const match of text.matchAll(MARKDOWN_LINK)) {
    const index = match.index ?? 0;
    if (index > lastIndex) nodes.push(text.slice(lastIndex, index));
    const href = safeHref(match[2] ?? '');
    if (href) {
      nodes.push(
        <a key={key} href={href} className="text-primary underline underline-offset-2">
          {match[1]}
        </a>
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

function assistantCopy(text: string, refusedLabel: string, helloLabel: string): ReactNode {
  if (text === QA_NO_EVIDENCE) return refusedLabel;
  if (text === QA_GREETING) return helloLabel;

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

    const paragraph: string[] = [];
    while (index < lines.length && !isListLine(lines[index] ?? '')) {
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

export function PublishedQaForm() {
  const t = useTranslations('PublishedQa');
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const requestRef = useRef({ locale, path: pathname });
  const logRef = useRef<HTMLDivElement>(null);
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
  const pending = status === 'submitted' || status === 'streaming';

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
    if (messages.length === 0 && !pending) return;
    log.scrollTop = log.scrollHeight;
  }, [messages, pending]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || pending) return;
    sendMessage({ text: trimmed });
    setInput('');
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
            {messages.map((message) => (
              <div
                key={message.id}
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
                  if (part.type !== 'text') return null;
                  if (message.role === 'assistant') {
                    return (
                      <div key={`${message.id}-assistant-${part.text}`}>
                        {assistantCopy(part.text, t('refused'), t('hello'))}
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
              </div>
            ))}
            {pending ? (
              <p className="text-sm leading-relaxed text-muted-foreground">{t('writing')}</p>
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
