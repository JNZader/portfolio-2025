'use client';

import { useLocale, useTranslations } from 'next-intl';
import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type QaResult =
  | { kind: 'hit'; text: string; href: string; name: string }
  | { kind: 'refused' }
  | { kind: 'error' };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function citationName(citation: unknown, title: unknown): string | null {
  if (typeof citation === 'string' && citation.trim()) return citation.trim();
  if (typeof title === 'string' && title.trim()) return title.trim();
  return null;
}

export function PublishedQaForm() {
  const t = useTranslations('PublishedQa');
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<QaResult | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || pending) return;

    setPending(true);
    setResult(null);

    try {
      const response = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed, locale }),
      });

      if (!response.ok) {
        setResult({ kind: 'error' });
        return;
      }

      const body: unknown = await response.json();
      if (!isRecord(body) || typeof body.status !== 'string') {
        setResult({ kind: 'error' });
        return;
      }

      if (body.status === 'refused') {
        setResult({ kind: 'refused' });
        return;
      }

      if (body.status === 'hit') {
        const text = typeof body.text === 'string' ? body.text : '';
        const href = typeof body.href === 'string' ? body.href : '';
        const name = citationName(body.citation, body.title);
        if (!text || !href || !name) {
          setResult({ kind: 'error' });
          return;
        }
        setResult({ kind: 'hit', text, href, name });
        return;
      }

      setResult({ kind: 'error' });
    } catch {
      setResult({ kind: 'error' });
    } finally {
      setPending(false);
    }
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
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              required
              autoComplete="off"
              className="border-border bg-background text-foreground"
            />
            <Button type="submit" disabled={pending}>
              {t('submit')}
            </Button>
          </div>
        </div>
      </form>
      <div className="mt-4" aria-live="polite">
        {result?.kind === 'hit' ? (
          <div className="space-y-2">
            <blockquote className="border-l-2 border-border pl-4 text-foreground">
              {result.text}
            </blockquote>
            <a href={result.href} className="text-primary underline-offset-4 hover:underline">
              {result.name}
            </a>
          </div>
        ) : null}
        {result?.kind === 'refused' ? (
          <p className="text-sm text-muted-foreground">{t('refused')}</p>
        ) : null}
        {result?.kind === 'error' ? <p className="text-sm text-error">{t('error')}</p> : null}
      </div>
    </section>
  );
}
