'use server';

import { nanoid } from 'nanoid';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { emailConfig, resend } from '@/lib/email/resend';
import NewsletterConfirm from '@/lib/email/templates/NewsletterConfirm';
import { getClientIdentifier, newsletterRateLimiter } from '@/lib/rate-limit/redis';
import { newsletterSchema } from '@/lib/validations/newsletter';

export type NewsletterActionResponse =
  | { success: true; message: string }
  | { success: false; error: string };

/**
 * Suscribir a newsletter (Step 1: Enviar email de confirmación)
 */
export async function subscribeToNewsletter(formData: FormData): Promise<NewsletterActionResponse> {
  try {
    // 1. Extraer y validar email
    const rawData = {
      email: formData.get('email') as string,
    };

    const validationResult = newsletterSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0].message,
      };
    }

    const { email } = validationResult.data;

    // 2. Rate limiting
    const headersList = await headers();
    const request = new Request('http://localhost', {
      headers: headersList,
    });
    const identifier = getClientIdentifier(request);

    const { success: rateLimitSuccess } = await newsletterRateLimiter.limit(identifier);

    if (!rateLimitSuccess) {
      return {
        success: false,
        error: 'Demasiados intentos. Por favor, intenta más tarde.',
      };
    }

    // 3. Obtener IP y User-Agent para audit
    const ipAddress = identifier !== 'anonymous' ? identifier : null;
    const userAgent = headersList.get('user-agent') || null;

    // 4. Verificar si ya existe
    const existing = await prisma.subscriber.findUnique({
      where: { email },
    });

    if (existing) {
      // Si ya está activo
      if (existing.status === 'ACTIVE') {
        return {
          success: false,
          error: 'Este email ya está suscrito.',
        };
      }

      // Si está pending, reenviar confirmación
      if (existing.status === 'PENDING') {
        // Generar nuevo token
        const confirmToken = nanoid(32);
        const confirmTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

        await prisma.subscriber.update({
          where: { email },
          data: {
            confirmToken,
            confirmTokenExp,
          },
        });

        // Enviar email de confirmación
        const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/confirm?token=${confirmToken}`;

        await resend.emails.send({
          from: emailConfig.from,
          to: email,
          subject: 'Confirma tu suscripción',
          react: NewsletterConfirm({ confirmUrl }),
        });

        return {
          success: true,
          message: 'Email de confirmación reenviado. Revisa tu inbox.',
        };
      }

      // Si se dio de baja antes, permitir re-suscripción
      if (existing.status === 'UNSUBSCRIBED') {
        const confirmToken = nanoid(32);
        const confirmTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await prisma.subscriber.update({
          where: { email },
          data: {
            status: 'PENDING',
            confirmToken,
            confirmTokenExp,
            unsubscribedAt: null,
            ipAddress,
            userAgent,
          },
        });

        const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/confirm?token=${confirmToken}`;

        await resend.emails.send({
          from: emailConfig.from,
          to: email,
          subject: 'Confirma tu suscripción',
          react: NewsletterConfirm({ confirmUrl }),
        });

        return {
          success: true,
          message: '¡Revisa tu email! Te hemos enviado un link de confirmación.',
        };
      }
    }

    // 5. Crear nuevo suscriptor
    const confirmToken = nanoid(32);
    const confirmTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const unsubToken = nanoid(32);

    await prisma.subscriber.create({
      data: {
        email,
        status: 'PENDING',
        confirmToken,
        confirmTokenExp,
        unsubToken,
        ipAddress,
        userAgent,
      },
    });

    // 6. Enviar email de confirmación
    const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/confirm?token=${confirmToken}`;

    const emailResult = await resend.emails.send({
      from: emailConfig.from,
      to: email,
      subject: 'Confirma tu suscripción',
      react: NewsletterConfirm({ confirmUrl }),
    });

    if (emailResult.error) {
      console.error('Error sending confirmation email:', emailResult.error);
      return {
        success: false,
        error: 'Error al enviar el email. Por favor, intenta más tarde.',
      };
    }

    return {
      success: true,
      message: '¡Revisa tu email! Te hemos enviado un link de confirmación.',
    };
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    return {
      success: false,
      error: 'Error inesperado. Por favor, intenta más tarde.',
    };
  }
}
