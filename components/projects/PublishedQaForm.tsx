'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useLocale, useTranslations } from 'next-intl';
import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QA_NO_EVIDENCE } from '@/lib/qa/retrieve';

function messageText(text: string, refusedLabel: string): string {
  return text === QA_NO_EVIDENCE ? refusedLabel : text;
}

export function PublishedQaForm() {
  const t = useTranslations('PublishedQa');
  const locale = useLocale();
  const [input, setInput] = useState('');
  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: '/api/qa',
        body: { locale },
      })
  );
  const { messages, sendMessage, status, error } = useChat({ transport });
  const pending = status === 'submitted' || status === 'streaming';

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || pending) return;
    sendMessage({ text: trimmed });
    setInput('');
  }

  return (
    <section
      className="mb-10 border-b border-border pb-8"
      aria-labelledby="published-qa-heading"
      aria-busy={pending}
    >
      <h2 id="published-qa-heading" className="text-display text-lg text-foreground">
        {t('heading')}
      </h2>
      <div className="mt-4 space-y-3" role="log" aria-live="polite" aria-relevant="additions">
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === 'user' ? 'text-sm text-foreground' : 'text-sm text-muted-foreground'
            }
          >
            {message.parts.map((part, index) => {
              if (part.type !== 'text') return null;
              return (
                <p key={`${message.id}-${index}`} className="whitespace-pre-wrap">
                  {messageText(part.text, t('refused'))}
                </p>
              );
            })}
          </div>
        ))}
      </div>
      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <label htmlFor="published-qa-query" className="text-sm font-medium text-foreground">
            {t('label')}
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
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
      </form>
      {error ? <p className="mt-4 text-sm text-error">{t('error')}</p> : null}
    </section>
  );
}
