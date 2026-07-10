import { type NextRequest, NextResponse } from 'next/server';
import { claimToken, MESSAGES, restoreToken } from '@/lib/api/gdpr-utils';
import { getSiteUrl } from '@/lib/config/site-url';
import { resend } from '@/lib/email/resend';
import { logger } from '@/lib/monitoring/logger';
import { confirmRateLimiter, getClientIdentifier } from '@/lib/rate-limit/redis';
import { deleteUserData } from '@/lib/services/gdpr';
import { escapeHtml } from '@/lib/utils/string';

interface DeletionTokenData {
  email: string;
  reason?: string;
}

const HTML_HEADERS = { 'Content-Type': 'text/html; charset=utf-8' } as const;

function htmlPage(body: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="robots" content="noindex, nofollow">
      <title>Confirmar eliminación de datos</title>
    </head>
    <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      ${body}
    </body>
    </html>
  `;
}

/**
 * GET renders a confirmation page ONLY. It performs NO destructive action:
 * it does not verify/consume the token, delete data, or send email. This
 * prevents link-prefetchers (email clients, unfurl bots, antivirus scanners,
 * browser prefetch) from silently deleting user data on a bare GET request.
 * The actual deletion happens on POST after the user clicks "Confirmar".
 */
export async function GET(request: NextRequest) {
  // Rate limiting — gates page views/attempts, no destructive side effect.
  const clientId = getClientIdentifier(request);
  const { success } = await confirmRateLimiter.limit(clientId);

  if (!success) {
    logger.warn('Data deletion confirm rate limit exceeded', { ip: clientId });
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
          Solicita una nueva eliminación de datos desde la página de privacidad.
        </p>
      `),
      { status: 400, headers: HTML_HEADERS }
    );
  }

  // Render the confirmation form. Submitting it POSTs the token, which is the
  // only path that verifies/consumes the token and deletes the data.
  return new NextResponse(
    htmlPage(`
      <h2 style="color: #dc2626;">⚠️ Confirmar eliminación de datos</h2>
      <p>Estás a punto de eliminar <strong>permanentemente</strong> todos tus datos personales.</p>

      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="color: #991b1b; margin: 0; font-weight: bold;">Esta acción es IRREVERSIBLE</p>
        <p style="color: #991b1b; margin: 8px 0 0 0; font-size: 14px;">
          Se eliminarán: tu suscripción, preferencias e historial de consentimientos.
        </p>
      </div>

      <form method="POST" action="/api/data-deletion/confirm">
        <input type="hidden" name="token" value="${escapeHtml(token)}">
        <button type="submit"
                style="background-color: #dc2626; color: white; padding: 12px 24px;
                       border: none; text-decoration: none; border-radius: 6px;
                       display: inline-block; font-size: 16px; cursor: pointer;">
          Confirmar eliminación
        </button>
      </form>

      <p style="color: #666; font-size: 14px; margin-top: 20px;">
        Si no solicitaste esta eliminación, cierra esta página y tus datos permanecerán seguros.
      </p>
    `),
    { status: 200, headers: HTML_HEADERS }
  );
}

/**
 * POST performs the actual, irreversible deletion. Same logic that previously
 * lived on GET: rate-limit, verify+consume token, delete, confirm by email,
 * redirect. Only reachable via the confirmation form submit.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const { success } = await confirmRateLimiter.limit(clientId);

    if (!success) {
      logger.warn('Data deletion confirm rate limit exceeded', { ip: clientId });
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
    const data = await claimToken<string>(token, 'data-deletion');

    if (!data) {
      return NextResponse.json({ message: MESSAGES.tokenExpired }, { status: 400 });
    }

    // Parse token data
    const { email, reason } = JSON.parse(data) as DeletionTokenData;

    // Delete user data
    let result: Awaited<ReturnType<typeof deleteUserData>>;
    try {
      result = await deleteUserData(email);
    } catch (error) {
      await restoreToken('data-deletion', token, data);
      throw error;
    }

    if (!result.success) {
      await restoreToken('data-deletion', token, data);
      return NextResponse.json({ message: result.message }, { status: 404 });
    }

    // Send confirmation email
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'noreply@javierzader.com',
        to: email,
        subject: 'Datos eliminados correctamente',
        html: `
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8">
          </head>
          <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Datos Eliminados Correctamente</h2>
            <p>Hemos procesado tu solicitud de eliminación de datos.</p>
            <p>Toda la información asociada a tu email ha sido eliminada permanentemente de nuestros sistemas.</p>
            ${reason ? `<p><strong>Razón indicada:</strong> ${escapeHtml(reason)}</p>` : ''}
            <p style="color: #666; font-size: 14px;">
              Si esto fue un error, puedes volver a suscribirte en cualquier momento.
            </p>
          </body>
          </html>
        `,
      });
    } catch (emailError) {
      logger.error('Failed to send deletion confirmation email', emailError as Error, {
        path: '/api/data-deletion/confirm',
        email,
      });
    }

    // Redirect to confirmation page
    return NextResponse.redirect(`${getSiteUrl()}/data-request?deleted=true`);
  } catch (error) {
    logger.error('Data deletion confirm failed', error as Error, {
      path: '/api/data-deletion/confirm',
      method: 'POST',
    });
    return NextResponse.json(
      { message: 'Error al eliminar datos. Intenta de nuevo más tarde.' },
      { status: 500 }
    );
  }
}
