import { Ratelimit } from '@upstash/ratelimit';
import { nanoid } from 'nanoid';
import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { resend } from '@/lib/email/resend';
import { redis } from '@/lib/rate-limit/redis';
import { dataDeletionSchema } from '@/lib/validations/gdpr';

// Rate limiter por email: 2 solicitudes por día
const deletionRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(process.env.NODE_ENV === 'development' ? 100 : 2, '24 h'),
  prefix: 'ratelimit:data-deletion',
});

// Rate limiter por IP: 5 solicitudes por hora (más restrictivo)
const ipRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(process.env.NODE_ENV === 'development' ? 100 : 5, '1 h'),
  prefix: 'ratelimit:data-deletion-ip',
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
    const validationResult = dataDeletionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { email, reason } = validationResult.data;

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
    const { success } = await deletionRateLimiter.limit(email);
    if (!success) {
      return NextResponse.json(
        { message: 'Demasiadas solicitudes. Intenta de nuevo mañana.' },
        { status: 429 }
      );
    }

    // 6. Generar token de verificación
    const token = nanoid(32);

    // Guardar token y razón en Redis (expira en 15 minutos)
    await redis.set(`data-deletion:${token}`, JSON.stringify({ email, reason }), { ex: 900 });

    // 7. Enviar email de verificación
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const confirmUrl = `${siteUrl}/api/data-deletion/confirm?token=${token}`;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@example.com',
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

          ${reason ? `<p><strong>Razón indicada:</strong> ${reason}</p>` : ''}

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

    return NextResponse.json({
      success: true,
      message: 'Te enviamos un email de verificación. Revisa tu bandeja de entrada.',
    });
  } catch (error) {
    console.error('Data deletion request error:', error);
    return NextResponse.json(
      { message: 'Error al procesar la solicitud. Intenta de nuevo más tarde.' },
      { status: 500 }
    );
  }
}
