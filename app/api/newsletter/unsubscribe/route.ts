import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
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
            <p>El link de cancelación es inválido.</p>
            <a href="/">Volver al inicio</a>
          </body>
        </html>
        `,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Buscar suscriptor por unsubToken
    const subscriber = await prisma.subscriber.findUnique({
      where: { unsubToken: token },
    });

    if (!subscriber) {
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
            <h1>❌ Suscripción No Encontrada</h1>
            <p>No pudimos encontrar esta suscripción.</p>
            <a href="/">Volver al inicio</a>
          </body>
        </html>
        `,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Ya está dado de baja
    if (subscriber.status === 'UNSUBSCRIBED') {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html lang="es">
          <head>
            <title>Ya Dado de Baja</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: system-ui; max-width: 600px; margin: 80px auto; padding: 0 20px; text-align: center; }
              h1 { color: #F59E0B; }
            </style>
          </head>
          <body>
            <h1>ℹ️ Ya Dado de Baja</h1>
            <p>Tu email ya estaba dado de baja de la newsletter.</p>
            <a href="/newsletter">¿Quieres volver a suscribirte?</a>
          </body>
        </html>
        `,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Dar de baja
    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'UNSUBSCRIBED',
        unsubscribedAt: new Date(),
      },
    });

    // Success page
    return new NextResponse(
      `
      <!DOCTYPE html>
        <html lang="es">
        <head>
          <title>Dado de Baja</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui; max-width: 600px; margin: 80px auto; padding: 0 20px; text-align: center; }
            h1 { color: #10B981; }
            .button { display: inline-block; margin-top: 24px; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 8px; }
          </style>
        </head>
        <body>
          <h1>✅ Dado de Baja Exitosamente</h1>
          <p>Tu email ha sido removido de nuestra newsletter.</p>
          <p>Lamentamos verte partir. Si cambias de opinión, siempre puedes volver a suscribirte.</p>
          <a href="/newsletter" class="button">Volver a suscribirme</a>
        </body>
      </html>
      `,
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);

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
          <p>Ocurrió un error al procesar tu solicitud.</p>
          <p>Por favor, intenta más tarde.</p>
          <a href="/">Volver al inicio</a>
        </body>
      </html>
      `,
      { headers: { 'Content-Type': 'text/html' }, status: 500 }
    );
  }
}
