import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getApiTranslator } from '@/lib/i18n/api-translator';
import { logger } from '@/lib/monitoring/logger';
import { getClientIdentifier, unsubscribeRateLimiter } from '@/lib/rate-limit/redis';
import { escapeHtml } from '@/lib/utils/string';

const HTML_HEADERS = { 'Content-Type': 'text/html; charset=utf-8' } as const;
const NAMESPACE = 'NewsletterUnsubscribePage';

type Translator = ReturnType<typeof getApiTranslator>;

function htmlPage(title: string, body: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="robots" content="noindex, nofollow">
      <title>${title}</title>
      <style>
        body { font-family: system-ui; max-width: 600px; margin: 80px auto; padding: 0 20px; text-align: center; }
        .button { display: inline-block; margin-top: 24px; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 8px; border: none; font-size: 16px; cursor: pointer; }
      </style>
    </head>
    <body>
      ${body}
    </body>
    </html>
  `;
}

function errorPage(
  t: Translator,
  titleKey: string,
  headingKey: string,
  bodyKey: string,
  color: string
) {
  return htmlPage(
    t(titleKey),
    `
      <h1 style="color: ${color};">${t(headingKey)}</h1>
      <p>${t(bodyKey)}</p>
      <a href="/">${t('backHome')}</a>
    `
  );
}

async function isRateLimited(request: NextRequest): Promise<boolean> {
  const clientId = getClientIdentifier(request);
  const { success } = await unsubscribeRateLimiter.limit(clientId);
  if (!success) {
    logger.warn('Unsubscribe rate limit exceeded', { ip: clientId });
  }
  return !success;
}

function rateLimitResponse(t: Translator): NextResponse {
  return new NextResponse(
    htmlPage(
      t('rateLimitTitle'),
      `
        <h1 style="color: #F59E0B;">${t('rateLimitHeading')}</h1>
        <p>${t('rateLimitBody')}</p>
        <a href="/">${t('backHome')}</a>
      `
    ),
    { status: 429, headers: { ...HTML_HEADERS, 'Retry-After': '3600' } }
  );
}

function serverErrorResponse(t: Translator): NextResponse {
  return new NextResponse(
    htmlPage(
      t('errorTitle'),
      `
        <h1 style="color: #EF4444;">${t('errorHeading')}</h1>
        <p>${t('errorBody')}</p>
        <p>${t('errorRetry')}</p>
        <a href="/">${t('backHome')}</a>
      `
    ),
    { status: 500, headers: HTML_HEADERS }
  );
}

type Subscriber = NonNullable<Awaited<ReturnType<typeof findByToken>>>;

function findByToken(token: string) {
  return prisma.subscriber.findUnique({ where: { unsubToken: token } });
}

/**
 * Resolve the subscriber state for a token. Shared by GET (render only) and
 * POST (render + mutate).
 */
function resolveState(
  subscriber: Subscriber | null
):
  | { kind: 'not-found' }
  | { kind: 'already-unsubscribed' }
  | { kind: 'confirmable'; subscriber: Subscriber } {
  if (!subscriber) return { kind: 'not-found' };
  if (subscriber.status === 'UNSUBSCRIBED') return { kind: 'already-unsubscribed' };
  return { kind: 'confirmable', subscriber };
}

function statePageResponse(t: Translator, state: ReturnType<typeof resolveState>): NextResponse {
  if (state.kind === 'not-found') {
    return new NextResponse(
      errorPage(t, 'notFoundTitle', 'notFoundHeading', 'notFoundBody', '#EF4444'),
      {
        status: 404,
        headers: HTML_HEADERS,
      }
    );
  }
  // already-unsubscribed
  return new NextResponse(
    htmlPage(
      t('alreadyTitle'),
      `
        <h1 style="color: #F59E0B;">${t('alreadyHeading')}</h1>
        <p>${t('alreadyBody')}</p>
        <a href="/newsletter">${t('resubscribeLink')}</a>
      `
    ),
    { status: 200, headers: HTML_HEADERS }
  );
}

/**
 * GET renders a confirmation page ONLY. It performs NO side effect: the token
 * is looked up (read-only) but the subscriber is NOT unsubscribed. This
 * prevents link-prefetchers (email clients, unfurl bots, antivirus scanners,
 * browser prefetch) from silently unsubscribing the recipient — every
 * newsletter email contains this link — on a bare GET request. The actual
 * unsubscribe happens on POST after the user clicks the button.
 */
export async function GET(request: NextRequest) {
  const t = getApiTranslator(request, NAMESPACE);

  try {
    if (await isRateLimited(request)) {
      return rateLimitResponse(t);
    }

    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return new NextResponse(
        errorPage(t, 'invalidTitle', 'invalidHeading', 'invalidBody', '#EF4444'),
        {
          status: 400,
          headers: HTML_HEADERS,
        }
      );
    }

    const state = resolveState(await findByToken(token));

    if (state.kind !== 'confirmable') {
      return statePageResponse(t, state);
    }

    // Render the confirmation form. Submitting it POSTs the token, which is
    // the only path that unsubscribes.
    return new NextResponse(
      htmlPage(
        t('confirmTitle'),
        `
          <h1>${t('confirmHeading')}</h1>
          <p>${t('confirmBody')}</p>

          <form method="POST" action="/api/newsletter/unsubscribe">
            <input type="hidden" name="token" value="${escapeHtml(token)}">
            <button type="submit" class="button">${t('confirmButton')}</button>
          </form>

          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            ${t('confirmDisclaimer')}
          </p>
        `
      ),
      { status: 200, headers: HTML_HEADERS }
    );
  } catch (error) {
    logger.error('Newsletter unsubscribe failed', error as Error, {
      path: '/api/newsletter/unsubscribe',
      method: 'GET',
    });
    return serverErrorResponse(t);
  }
}

/**
 * POST performs the actual unsubscribe. Same lookup/validation as GET, then
 * flips the subscriber to UNSUBSCRIBED. Only reachable via the confirmation
 * form submit.
 */
export async function POST(request: NextRequest) {
  const t = getApiTranslator(request, NAMESPACE);

  try {
    if (await isRateLimited(request)) {
      return rateLimitResponse(t);
    }

    // Get token from the form-encoded body. A missing/unparseable body is
    // treated as a missing token (400), not a server error.
    const formData = await request.formData().catch(() => null);
    const token = formData?.get('token');

    if (!token || typeof token !== 'string') {
      return new NextResponse(
        errorPage(t, 'invalidTitle', 'invalidHeading', 'invalidBody', '#EF4444'),
        {
          status: 400,
          headers: HTML_HEADERS,
        }
      );
    }

    const state = resolveState(await findByToken(token));

    if (state.kind !== 'confirmable') {
      return statePageResponse(t, state);
    }

    const { subscriber } = state;

    // Dar de baja
    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'UNSUBSCRIBED',
        unsubscribedAt: new Date(),
      },
    });

    logger.info('Newsletter unsubscribe confirmed', { email: subscriber.email });

    return new NextResponse(
      htmlPage(
        t('successTitle'),
        `
          <h1 style="color: #10B981;">${t('successHeading')}</h1>
          <p>${t('successBody')}</p>
          <p>${t('successFarewell')}</p>
          <a href="/newsletter" class="button">${t('resubscribeLink')}</a>
        `
      ),
      { status: 200, headers: HTML_HEADERS }
    );
  } catch (error) {
    logger.error('Newsletter unsubscribe failed', error as Error, {
      path: '/api/newsletter/unsubscribe',
      method: 'POST',
    });
    return serverErrorResponse(t);
  }
}
