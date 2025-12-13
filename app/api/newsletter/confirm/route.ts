import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { emailConfig, resend } from '@/lib/email/resend';
import NewsletterWelcome from '@/lib/email/templates/NewsletterWelcome';
import { logger } from '@/lib/monitoring/logger';
import { confirmRateLimiter, getClientIdentifier } from '@/lib/rate-limit/redis';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting para prevenir enumeración de tokens
    const clientId = getClientIdentifier(request);
    const { success } = await confirmRateLimiter.limit(clientId);

    if (!success) {
      logger.warn('Newsletter confirm rate limit exceeded', { ip: clientId });
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html lang="es">
          <head>
            <title>Demasiadas solicitudes</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: system-ui; max-width: 600px; margin: 80px auto; padding: 0 20px; text-align: center; }
              h1 { color: #F59E0B; }
            </style>
          </head>
          <body>
            <h1>Demasiadas Solicitudes</h1>
            <p>Has realizado demasiadas solicitudes. Por favor, intenta de nuevo en 1 hora.</p>
            <a href="/">Volver al inicio</a>
          </body>
        </html>
        `,
        { headers: { 'Content-Type': 'text/html', 'Retry-After': '3600' }, status: 429 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      logger.warn('Newsletter confirmation attempted without token');
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html lang="es">
          <head>
            <title>Error</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: system-ui; max-width: 600px; margin: 80px auto; padding: 0 20px; text-align: center; }
              h1 { color: #EF4444; }
            </style>
          </head>
          <body>
            <h1>❌ Token Inválido</h1>
            <p>El link de confirmación es inválido.</p>
            <a href="/">Volver al inicio</a>
          </body>
        </html>
        `,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Buscar suscriptor por token
    const subscriber = await prisma.subscriber.findUnique({
      where: { confirmToken: token },
    });

    if (!subscriber) {
      logger.warn('Newsletter confirmation with invalid token', { token });
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html lang="es">
          <head>
            <title>Error</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: system-ui; max-width: 600px; margin: 80px auto; padding: 0 20px; text-align: center; }
              h1 { color: #EF4444; }
            </style>
          </head>
          <body>
            <h1>❌ Token No Encontrado</h1>
            <p>Este link de confirmación no existe o ya fue usado.</p>
            <a href="/">Volver al inicio</a>
          </body>
        </html>
        `,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Verificar expiración
    if (subscriber.confirmTokenExp && subscriber.confirmTokenExp < new Date()) {
      logger.warn('Newsletter confirmation with expired token', {
        email: subscriber.email,
        expiredAt: subscriber.confirmTokenExp,
      });
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html lang="es">
          <head>
            <title>Error</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: system-ui; max-width: 600px; margin: 80px auto; padding: 0 20px; text-align: center; }
              h1 { color: #F59E0B; }
            </style>
          </head>
          <body>
            <h1>⏰ Token Expirado</h1>
            <p>Este link de confirmación ha expirado (válido por 24 horas).</p>
            <p>Por favor, suscríbete nuevamente.</p>
            <a href="/newsletter">Volver a suscribirme</a>
          </body>
        </html>
        `,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Ya está confirmado
    if (subscriber.status === 'ACTIVE') {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html lang="es">
          <head>
            <title>Ya Confirmado</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: system-ui; max-width: 600px; margin: 80px auto; padding: 0 20px; text-align: center; }
              h1 { color: #10B981; }
            </style>
          </head>
          <body>
            <h1>✅ Ya Confirmado</h1>
            <p>Tu suscripción ya estaba activa.</p>
            <a href="/">Volver al inicio</a>
          </body>
        </html>
        `,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Confirmar suscripción
    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'ACTIVE',
        confirmedAt: new Date(),
        confirmToken: null,
        confirmTokenExp: null,
      },
    });

    logger.info('Newsletter subscription confirmed successfully', {
      email: subscriber.email,
    });

    // Enviar email de bienvenida
    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/unsubscribe?token=${subscriber.unsubToken}`;

    try {
      await resend.emails.send({
        from: emailConfig.from,
        to: subscriber.email,
        subject: '¡Bienvenido a nuestra newsletter!',
        react: NewsletterWelcome({ unsubscribeUrl }),
      });
    } catch (emailError) {
      logger.error('Failed to send welcome email', emailError as Error, {
        email: subscriber.email,
      });
      // No fallar si el email de bienvenida falla
    }

    // Success page
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <title>¡Confirmado!</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui; max-width: 600px; margin: 80px auto; padding: 0 20px; text-align: center; }
            h1 { color: #10B981; }
            .button { display: inline-block; margin-top: 24px; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 8px; }
          </style>
        </head>
        <body>
          <h1>🎉 ¡Suscripción Confirmada!</h1>
          <p>Gracias por confirmar tu suscripción.</p>
          <p>Te hemos enviado un email de bienvenida con más información.</p>
          <a href="/" class="button">Volver al inicio</a>
        </body>
      </html>
      `,
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (error) {
    logger.error('Unexpected error in newsletter confirmation', error as Error);

    return new NextResponse(
      `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <title>Error</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui; max-width: 600px; margin: 80px auto; padding: 0 20px; text-align: center; }
            h1 { color: #EF4444; }
          </style>
        </head>
        <body>
          <h1>❌ Error</h1>
          <p>Ocurrió un error al confirmar tu suscripción.</p>
          <p>Por favor, intenta más tarde.</p>
          <a href="/">Volver al inicio</a>
        </body>
      </html>
      `,
      { headers: { 'Content-Type': 'text/html' }, status: 500 }
    );
  }
}
