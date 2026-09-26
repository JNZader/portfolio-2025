'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { MessageCircle, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QA_NO_EVIDENCE } from '@/lib/qa/retrieve';

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

function assistantCopy(text: string, refusedLabel: string): ReactNode {
  if (text === QA_NO_EVIDENCE) return refusedLabel;

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

export function PublishedQaForm() {
  const t = useTranslations('PublishedQa');
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const requestRef = useRef({ locale, path: pathname });
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
                    ? 'ml-8 rounded-md bg-primary/10 px-3 py-2 text-sm text-foreground'
                    : 'mr-8 rounded-md bg-muted px-3 py-2 text-sm text-foreground'
                }
              >
                {message.parts.map((part, index) => {
                  if (part.type !== 'text') return null;
                  return (
                    <p key={`${message.id}-${index}`} className="whitespace-pre-wrap">
                      {message.role === 'assistant'
                        ? assistantCopy(part.text, t('refused'))
                        : part.text}
                    </p>
                  );
                })}
              </div>
            ))}
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
