import { type NextRequest, NextResponse } from 'next/server';
import { getSiteUrl } from '@/lib/config/site-url';
import { prisma } from '@/lib/db/prisma';
import { emailConfig, resend } from '@/lib/email/resend';
import NewsletterWelcome from '@/lib/email/templates/NewsletterWelcome';
import { getApiTranslator } from '@/lib/i18n/api-translator';
import { logger } from '@/lib/monitoring/logger';
import { confirmRateLimiter, getClientIdentifier } from '@/lib/rate-limit/redis';
import { escapeHtml } from '@/lib/utils/string';

const HTML_HEADERS = { 'Content-Type': 'text/html; charset=utf-8' } as const;
const NAMESPACE = 'NewsletterConfirmPage';

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
  const { success } = await confirmRateLimiter.limit(clientId);
  if (!success) {
    logger.warn('Newsletter confirm rate limit exceeded', { ip: clientId });
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
  return prisma.subscriber.findUnique({ where: { confirmToken: token } });
}

function isExpired(subscriber: Subscriber): boolean {
  return Boolean(subscriber.confirmTokenExp && subscriber.confirmTokenExp < new Date());
}

/**
 * Resolve the subscriber state for a token. Returns the HTTP status and the
 * i18n keys of the page to render, plus the subscriber when it can still be
 * confirmed. Shared by GET (render only) and POST (render + mutate).
 */
function resolveState(
  subscriber: Subscriber | null
):
  | { kind: 'not-found' }
  | { kind: 'expired' }
  | { kind: 'already-active' }
  | { kind: 'confirmable'; subscriber: Subscriber } {
  if (!subscriber) return { kind: 'not-found' };
  if (isExpired(subscriber)) return { kind: 'expired' };
  if (subscriber.status === 'ACTIVE') return { kind: 'already-active' };
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
  if (state.kind === 'expired') {
    return new NextResponse(
      htmlPage(
        t('expiredTitle'),
        `
          <h1 style="color: #F59E0B;">${t('expiredHeading')}</h1>
          <p>${t('expiredBody')}</p>
          <p>${t('expiredResubscribe')}</p>
          <a href="/newsletter">${t('resubscribeLink')}</a>
        `
      ),
      { status: 410, headers: HTML_HEADERS }
    );
  }
  // already-active
  return new NextResponse(
    htmlPage(
      t('alreadyTitle'),
      `
        <h1 style="color: #10B981;">${t('alreadyHeading')}</h1>
        <p>${t('alreadyBody')}</p>
        <a href="/">${t('backHome')}</a>
      `
    ),
    { status: 200, headers: HTML_HEADERS }
  );
}

/**
 * GET renders a confirmation page ONLY. It performs NO side effect: the token
 * is looked up (read-only) but the subscription is NOT confirmed. This
 * prevents link-prefetchers (email clients, unfurl bots, antivirus scanners,
 * browser prefetch) from silently confirming the subscription without human
 * intent on a bare GET request. The actual confirmation happens on POST after
 * the user clicks the button.
 */
export async function GET(request: NextRequest) {
  const t = getApiTranslator(request, NAMESPACE);

  try {
    if (await isRateLimited(request)) {
      return rateLimitResponse(t);
    }

    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      logger.warn('Newsletter confirmation attempted without token');
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
      if (state.kind === 'not-found') {
        // No loguear el valor del token (higiene: los tokens no van a logs)
        logger.warn('Newsletter confirmation with invalid token');
      }
      return statePageResponse(t, state);
    }

    // Render the confirmation form. Submitting it POSTs the token, which is
    // the only path that confirms the subscription.
    return new NextResponse(
      htmlPage(
        t('confirmTitle'),
        `
          <h1>${t('confirmHeading')}</h1>
          <p>${t('confirmBody')}</p>

          <form method="POST" action="/api/newsletter/confirm">
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
    logger.error('Unexpected error in newsletter confirmation', error as Error, {
      path: '/api/newsletter/confirm',
      method: 'GET',
    });
    return serverErrorResponse(t);
  }
}

/**
 * POST performs the actual confirmation. Same lookup/validation as GET, then
 * flips the subscriber to ACTIVE via a conditional update (single winner even
 * under concurrent submits) and sends the welcome email. The token row is
 * retained so a re-POST after success renders the friendly 'already
 * confirmed' page instead of a 404. Only reachable via the confirmation form
 * submit.
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

    // Confirmar suscripción con transición condicional: solo la fila que siga
    // PENDING y con ESTE token puede pasar a ACTIVE. Si dos POSTs concurrentes
    // resuelven el token como confirmable, solo UNO gana (count === 1) y envía
    // el email de bienvenida; el perdedor cae en la página de "ya confirmado".
    // El confirmToken se CONSERVA (misma convención que unsubToken en la ruta
    // de unsubscribe): permite distinguir un re-POST (página amigable 200) de
    // un token que nunca existió (404). Se limpia confirmTokenExp para que el
    // link consumido no degenere a 410 al expirar.
    const { count } = await prisma.subscriber.updateMany({
      where: { id: subscriber.id, status: 'PENDING', confirmToken: token },
      data: {
        status: 'ACTIVE',
        confirmedAt: new Date(),
        confirmTokenExp: null,
      },
    });

    if (count === 0) {
      // Otro request ya confirmó esta suscripción (doble submit/refresh).
      return statePageResponse(t, { kind: 'already-active' });
    }

    logger.info('Newsletter subscription confirmed successfully', {
      email: subscriber.email,
    });

    // Enviar email de bienvenida
    const unsubscribeUrl = `${getSiteUrl()}/api/newsletter/unsubscribe?token=${subscriber.unsubToken}`;

    try {
      await resend.emails.send({
        from: emailConfig.from,
        to: subscriber.email,
        subject: t('welcomeEmailSubject'),
        react: NewsletterWelcome({ unsubscribeUrl }),
      });
    } catch (emailError) {
      logger.error('Failed to send welcome email', emailError as Error, {
        email: subscriber.email,
      });
      // No fallar si el email de bienvenida falla
    }

    return new NextResponse(
      htmlPage(
        t('successTitle'),
        `
          <h1 style="color: #10B981;">${t('successHeading')}</h1>
          <p>${t('successBody')}</p>
          <p>${t('successEmailSent')}</p>
          <a href="/" class="button">${t('backHome')}</a>
        `
      ),
      { status: 200, headers: HTML_HEADERS }
    );
  } catch (error) {
    logger.error('Unexpected error in newsletter confirmation', error as Error, {
      path: '/api/newsletter/confirm',
      method: 'POST',
    });
    return serverErrorResponse(t);
  }
}
