import { type NextRequest, NextResponse } from 'next/server';
import { claimToken, MESSAGES, restoreToken } from '@/lib/api/gdpr-utils';
import { logger } from '@/lib/monitoring/logger';
import { confirmRateLimiter, getClientIdentifier } from '@/lib/rate-limit/redis';
import { exportUserData } from '@/lib/services/gdpr';
import { escapeHtml } from '@/lib/utils/string';

const HTML_HEADERS = { 'Content-Type': 'text/html; charset=utf-8' } as const;

function htmlPage(body: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="robots" content="noindex, nofollow">
      <title>Confirmar exportación de datos</title>
    </head>
    <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      ${body}
    </body>
    </html>
  `;
}

/**
 * GET renders a confirmation page ONLY. It performs NO side effect: it does
 * not verify/consume the token nor export data. This prevents link-prefetchers
 * (email clients, unfurl bots, antivirus scanners, browser prefetch) from
 * silently exfiltrating the user's PII — and burning the single-use token so
 * the legitimate user can no longer use their own link — on a bare GET request.
 * The actual export happens on POST after the user clicks "Descargar mis datos".
 */
export async function GET(request: NextRequest) {
  // Rate limiting — gates page views/attempts, no side effect.
  const clientId = getClientIdentifier(request);
  const { success } = await confirmRateLimiter.limit(clientId);

  if (!success) {
    logger.warn('Data export confirm rate limit exceeded', { ip: clientId });
    return new NextResponse(
      htmlPage(`
        <h2 style="color: #dc2626;">Demasiadas solicitudes</h2>
        <p>Has realizado demasiados intentos. Intenta de nuevo en 1 hora.</p>
      `),
      { status: 429, headers: { ...HTML_HEADERS, 'Retry-After': '3600' } }
    );
  }

  // Get token from query params
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return new NextResponse(
      htmlPage(`
        <h2 style="color: #dc2626;">Enlace inválido</h2>
        <p>${MESSAGES.tokenMissing}</p>
        <p style="color: #666; font-size: 14px;">
          Solicita una nueva exportación de datos desde la página de privacidad.
        </p>
      `),
      { status: 400, headers: HTML_HEADERS }
    );
  }

  // Render the confirmation form. Submitting it POSTs the token, which is the
  // only path that verifies/consumes the token and exports the data.
  return new NextResponse(
    htmlPage(`
      <h2>Confirmar exportación de datos</h2>
      <p>Estás a punto de descargar todos tus datos personales asociados a este enlace.</p>

      <form method="POST" action="/api/data-export/confirm">
        <input type="hidden" name="token" value="${escapeHtml(token)}">
        <button type="submit"
                style="background-color: #2563eb; color: white; padding: 12px 24px;
                       border: none; text-decoration: none; border-radius: 6px;
                       display: inline-block; font-size: 16px; cursor: pointer;">
          Descargar mis datos
        </button>
      </form>

      <p style="color: #666; font-size: 14px; margin-top: 20px;">
        Si no solicitaste esta exportación, cierra esta página y no se descargará nada.
      </p>
    `),
    { status: 200, headers: HTML_HEADERS }
  );
}

/**
 * POST performs the actual export. Same logic that previously lived on GET:
 * rate-limit, verify+consume token, export, return the JSON download. Only
 * reachable via the confirmation form submit.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const { success } = await confirmRateLimiter.limit(clientId);

    if (!success) {
      logger.warn('Data export confirm rate limit exceeded', { ip: clientId });
      return NextResponse.json(
        { message: 'Demasiadas solicitudes. Intenta de nuevo en 1 hora.' },
        { status: 429, headers: { 'Retry-After': '3600' } }
      );
    }

    // Get token from the form-encoded body. A missing/unparseable body is
    // treated as a missing token (400), not a server error.
    const formData = await request.formData().catch(() => null);
    const token = formData?.get('token');

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ message: MESSAGES.tokenMissing }, { status: 400 });
    }

    // Verify and consume token
    const email = await claimToken<string>(token, 'data-export');

    if (!email) {
      return NextResponse.json({ message: MESSAGES.tokenExpired }, { status: 400 });
    }

    // Export data
    let userData: Awaited<ReturnType<typeof exportUserData>>;
    try {
      userData = await exportUserData(email);
    } catch (error) {
      await restoreToken('data-export', token, email);
      throw error;
    }

    if (!userData) {
      return NextResponse.json(
        { message: 'No se encontraron datos para este email' },
        { status: 404 }
      );
    }

    // Return JSON for download
    return new NextResponse(JSON.stringify(userData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Slug del email en el filename: caracteres fuera de [a-z0-9._-]
        // podrían romper/inyectar el header Content-Disposition.
        'Content-Disposition': `attachment; filename="data-export-${email.replace(/[^a-z0-9._-]/gi, '_')}-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    logger.error('Data export confirm failed', error as Error, {
      path: '/api/data-export/confirm',
      method: 'POST',
    });
    return NextResponse.json(
      { message: 'Error al exportar datos. Intenta de nuevo más tarde.' },
      { status: 500 }
    );
  }
}
