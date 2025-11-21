import { Ratelimit } from '@upstash/ratelimit';
import { nanoid } from 'nanoid';
import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { resend } from '@/lib/email/resend';
import { redis } from '@/lib/rate-limit/redis';
import { dataExportSchema } from '@/lib/validations/gdpr';

// Rate limiter por email: 3 solicitudes por hora
const exportRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(process.env.NODE_ENV === 'development' ? 100 : 3, '1 h'),
  prefix: 'ratelimit:data-export',
});

// Rate limiter por IP: 5 solicitudes por hora (más restrictivo)
const ipRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(process.env.NODE_ENV === 'development' ? 100 : 5, '1 h'),
  prefix: 'ratelimit:data-export-ip',
});

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting por IP (primero, para prevenir enumeración)
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const { success: ipSuccess } = await ipRateLimiter.limit(ip);
    if (!ipSuccess) {
      return NextResponse.json(
        { message: 'Demasiadas solicitudes desde tu IP. Intenta de nuevo en 1 hora.' },
        { status: 429 }
      );
    }

    // 2. Parse body
    const body = await request.json();

    // 3. Validate
    const validationResult = dataExportSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // 4. Verificar que el email existe en la base de datos
    const subscriber = await prisma.subscriber.findUnique({
      where: { email },
    });

    if (!subscriber) {
      // No revelar si el email existe o no (seguridad)
      return NextResponse.json({
        success: true,
        message: 'Si el email existe en nuestro sistema, recibirás un enlace de verificación.',
      });
    }

    // 5. Rate limiting por email
    const { success } = await exportRateLimiter.limit(email);
    if (!success) {
      return NextResponse.json(
        { message: 'Demasiadas solicitudes. Intenta de nuevo en 1 hora.' },
        { status: 429 }
      );
    }

    // 6. Generar token de verificación
    const token = nanoid(32);

    // Guardar token en Redis (expira en 15 minutos)
    await redis.set(`data-export:${token}`, email, { ex: 900 });

    // 7. Enviar email de verificación
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const confirmUrl = `${siteUrl}/api/data-export/confirm?token=${token}`;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@example.com',
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

    return NextResponse.json({
      success: true,
      message: 'Te enviamos un email de verificación. Revisa tu bandeja de entrada.',
    });
  } catch (error) {
    console.error('Data export request error:', error);
    return NextResponse.json(
      { message: 'Error al procesar la solicitud. Intenta de nuevo más tarde.' },
      { status: 500 }
    );
  }
}
