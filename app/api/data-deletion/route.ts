import { nanoid } from 'nanoid';
import { type NextRequest, NextResponse } from 'next/server';
import {
  createGdprRateLimiters,
  MESSAGES,
  storeToken,
  verifyGdprRequest,
} from '@/lib/api/gdpr-utils';
import { resend } from '@/lib/email/resend';
import { logger } from '@/lib/monitoring/logger';
import { escapeHtml } from '@/lib/utils/string';
import { dataDeletionSchema } from '@/lib/validations/gdpr';

const rateLimiters = createGdprRateLimiters('data-deletion', 2, '24 h');

export async function POST(request: NextRequest) {
  try {
    const result = await verifyGdprRequest(
      request,
      dataDeletionSchema,
      rateLimiters,
      '/api/data-deletion',
      'mañana'
    );

    if (!result.success) {
      return result.response;
    }

    const { email } = result;
    const reason = (result.body as { reason?: string }).reason;

    // Generate and store verification token with reason
    const token = nanoid(32);
    await storeToken('data-deletion', token, JSON.stringify({ email, reason }));

    // Send verification email
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const confirmUrl = `${siteUrl}/api/data-deletion/confirm?token=${token}`;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'noreply@example.com',
      to: email,
      subject: '⚠️ Confirma la eliminación de tus datos',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc2626;">⚠️ Solicitud de Eliminación de Datos</h2>
          <p>Has solicitado eliminar <strong>permanentemente</strong> todos tus datos personales.</p>

          <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="color: #991b1b; margin: 0; font-weight: bold;">Esta acción es IRREVERSIBLE</p>
            <p style="color: #991b1b; margin: 8px 0 0 0; font-size: 14px;">
              Se eliminarán: tu suscripción, preferencias e historial de consentimientos.
            </p>
          </div>

          ${reason ? `<p><strong>Razón indicada:</strong> ${escapeHtml(reason)}</p>` : ''}

          <p>Si estás seguro, haz clic en el siguiente enlace:</p>
          <p style="margin: 20px 0;">
            <a href="${confirmUrl}"
               style="background-color: #dc2626; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Confirmar eliminación
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
            Este enlace expira en <strong>15 minutos</strong>.
          </p>
          <p style="color: #666; font-size: 14px;">
            Si no solicitaste esta eliminación, ignora este email y tus datos permanecerán seguros.
          </p>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true, message: MESSAGES.emailSent });
  } catch (error) {
    logger.error('Data deletion request failed', error as Error, {
      path: '/api/data-deletion',
      method: 'POST',
    });
    return NextResponse.json({ message: MESSAGES.serverError }, { status: 500 });
  }
}
