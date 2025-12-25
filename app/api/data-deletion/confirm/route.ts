import { type NextRequest, NextResponse } from 'next/server';
import { MESSAGES, verifyAndConsumeToken } from '@/lib/api/gdpr-utils';
import { resend } from '@/lib/email/resend';
import { logger } from '@/lib/monitoring/logger';
import { confirmRateLimiter, getClientIdentifier } from '@/lib/rate-limit/redis';
import { deleteUserData } from '@/lib/services/gdpr';

interface DeletionTokenData {
  email: string;
  reason?: string;
}

export async function GET(request: NextRequest) {
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

    // Get token from query params
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ message: MESSAGES.tokenMissing }, { status: 400 });
    }

    // Verify and consume token
    const data = await verifyAndConsumeToken<string>(token, 'data-deletion');

    if (!data) {
      return NextResponse.json({ message: MESSAGES.tokenExpired }, { status: 400 });
    }

    // Parse token data
    const { email, reason } = JSON.parse(data) as DeletionTokenData;

    // Delete user data
    const result = await deleteUserData(email);

    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: 404 });
    }

    // Send confirmation email
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'noreply@example.com',
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
            ${reason ? `<p><strong>Razón indicada:</strong> ${reason}</p>` : ''}
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
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    return NextResponse.redirect(`${siteUrl}/data-request?deleted=true`);
  } catch (error) {
    logger.error('Data deletion confirm failed', error as Error, {
      path: '/api/data-deletion/confirm',
      method: 'GET',
    });
    return NextResponse.json(
      { message: 'Error al eliminar datos. Intenta de nuevo más tarde.' },
      { status: 500 }
    );
  }
}
