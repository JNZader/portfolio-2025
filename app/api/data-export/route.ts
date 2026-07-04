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
import { dataExportSchema } from '@/lib/validations/gdpr';

const rateLimiters = createGdprRateLimiters('data-export', 3, '1 h');

export async function POST(request: NextRequest) {
  try {
    const result = await verifyGdprRequest(
      request,
      dataExportSchema,
      rateLimiters,
      '/api/data-export',
      'en 1 hora'
    );

    if (!result.success) {
      return result.response;
    }

    const { email } = result;

    // Generate and store verification token
    const token = nanoid(32);
    await storeToken('data-export', token, email);

    // Send verification email
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const confirmUrl = `${siteUrl}/api/data-export/confirm?token=${token}`;

    const sendResult = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'noreply@javierzader.com',
      to: email,
      subject: 'Confirma tu solicitud de exportación de datos',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Solicitud de Exportación de Datos</h2>
          <p>Has solicitado exportar tus datos personales.</p>
          <p>Haz clic en el siguiente enlace para descargar tus datos:</p>
          <p style="margin: 20px 0;">
            <a href="${confirmUrl}"
               style="background-color: #2563eb; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Descargar mis datos
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
            Este enlace expira en <strong>15 minutos</strong>.
          </p>
          <p style="color: #666; font-size: 14px;">
            Si no solicitaste esta exportación, puedes ignorar este email.
          </p>
        </body>
        </html>
      `,
    });

    // The Resend SDK resolves with { data, error } instead of throwing on a
    // failed send, so we must inspect `error` explicitly or the failure is
    // silent. Anti-enumeration: this send only runs when the email WAS found
    // (verifyGdprRequest short-circuits the not-found path above with the SAME
    // generic { success: true, message: emailNotFound } response). Returning a
    // distinct status/shape here would leak "email exists AND send failed",
    // creating an oracle to probe existence. So we log server-side for
    // observability but return the identical generic response either way, and
    // never leak the raw Resend error to the client.
    if (sendResult.error) {
      logger.error('Failed to send export verification email', sendResult.error as Error, {
        path: '/api/data-export',
        email,
      });
    }

    // Generic message identical to the not-found path (see verifyGdprRequest)
    // so an attacker cannot distinguish whether the email exists.
    return NextResponse.json({ success: true, message: MESSAGES.emailNotFound });
  } catch (error) {
    logger.error('Data export request failed', error as Error, {
      path: '/api/data-export',
      method: 'POST',
    });
    return NextResponse.json({ message: MESSAGES.serverError }, { status: 500 });
  }
}
