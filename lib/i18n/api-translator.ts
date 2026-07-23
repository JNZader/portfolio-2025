import { createTranslator } from 'next-intl';
import en from '@/messages/en.json';
import es from '@/messages/es.json';

const messages = { es, en } as const;

/**
 * Translator for API route handlers: `t(key)` with string keys. Route
 * handlers compose keys dynamically (page builders receive key names), so the
 * strict per-key literal typing that next-intl applies to React components is
 * deliberately loosened at this single boundary. Keys still must exist in
 * BOTH messages files — key parity is enforced by the route tests, which fail
 * on next-intl's MISSING_MESSAGE output.
 */
export type ApiTranslator = (key: string) => string;

type ApiNamespace = 'NewsletterConfirmPage' | 'NewsletterUnsubscribePage';

/**
 * Resolve a next-intl translator for API route handlers.
 *
 * Route handlers live outside the `[locale]` segment, so they cannot rely on
 * the request-scoped locale that pages get from next-intl middleware. We
 * negotiate from the Accept-Language header instead, defaulting to Spanish
 * (the site default) when the header is missing or unsupported.
 */
export function getApiTranslator(request: Request, namespace: ApiNamespace): ApiTranslator {
  const acceptLanguage = request.headers.get('accept-language') ?? '';
  const preferred = acceptLanguage.split(',')[0]?.trim().toLowerCase() ?? '';
  const locale = preferred.startsWith('en') ? 'en' : 'es';

  const t = createTranslator({ locale, messages: messages[locale], namespace });
  return t as unknown as ApiTranslator;
}
