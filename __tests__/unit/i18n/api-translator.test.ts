import { describe, expect, it } from 'vitest';

// API route handlers live outside the `[locale]` segment, so they resolve a
// translator explicitly from the request's Accept-Language header, defaulting
// to Spanish (the site default). All user-facing strings in the newsletter
// confirm/unsubscribe pages come from next-intl messages, never hardcoded.

import { getApiTranslator } from '@/lib/i18n/api-translator';

const KEY = 'confirmButton';

function requestWithAcceptLanguage(acceptLanguage?: string): Request {
  return new Request('http://localhost/api/test', {
    headers: acceptLanguage ? { 'accept-language': acceptLanguage } : {},
  });
}

describe('getApiTranslator', () => {
  it('resolves English messages when Accept-Language prefers English', () => {
    const t = getApiTranslator(requestWithAcceptLanguage('en-US,en;q=0.9'), 'NewsletterConfirmPage');

    expect(t(KEY)).toBe('Confirm subscription');
  });

  it('defaults to Spanish when Accept-Language is missing', () => {
    const t = getApiTranslator(requestWithAcceptLanguage(), 'NewsletterConfirmPage');

    expect(t(KEY)).toBe('Confirmar suscripción');
  });

  it('defaults to Spanish when Accept-Language prefers Spanish', () => {
    const t = getApiTranslator(requestWithAcceptLanguage('es-AR,es;q=0.8'), 'NewsletterConfirmPage');

    expect(t(KEY)).toBe('Confirmar suscripción');
  });

  it('defaults to Spanish for unsupported locales', () => {
    const t = getApiTranslator(requestWithAcceptLanguage('fr-FR,fr;q=0.9'), 'NewsletterConfirmPage');

    expect(t(KEY)).toBe('Confirmar suscripción');
  });
});
