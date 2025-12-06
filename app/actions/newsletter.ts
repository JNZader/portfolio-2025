'use server';

import { nanoid } from 'nanoid';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { emailConfig, resend } from '@/lib/email/resend';
import NewsletterConfirm from '@/lib/email/templates/NewsletterConfirm';
import { logger } from '@/lib/monitoring/logger';
import { trackDatabaseQuery, trackEmailSend } from '@/lib/monitoring/performance';
import { getClientIdentifier, newsletterRateLimiter } from '@/lib/rate-limit/redis';
import { newsletterSchema } from '@/lib/validations/newsletter';

export type NewsletterActionResponse =
  | { success: true; message: string }
  | { success: false; error: string };

/**
 * Suscribir a newsletter (Step 1: Enviar email de confirmación)
 */
export async function subscribeToNewsletter(formData: FormData): Promise<NewsletterActionResponse> {
  // 1. Extraer email (fuera del try para estar disponible en catch)
  const rawData = {
    email: formData.get('email') as string,
  };

  try {
    // 2. Validar email

    const validationResult = newsletterSchema.safeParse(rawData);

    if (!validationResult.success) {
      logger.warn('Newsletter validation failed', {
        error: validationResult.error.issues[0].message,
      });
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
      logger.warn('Newsletter rate limit exceeded', {
        identifier,
        email,
      });
      return {
        success: false,
        error: 'Demasiados intentos. Por favor, intenta más tarde.',
      };
    }

    // 3. Obtener IP y User-Agent para audit
    const ipAddress = identifier !== 'anonymous' ? identifier : null;
    const userAgent = headersList.get('user-agent') || null;

    // 4. Verificar si ya existe
    const existing = await trackDatabaseQuery('subscriber.findUnique', () =>
      prisma.subscriber.findUnique({ where: { email } })
    );

    if (existing) {
      // Si ya está activo
      if (existing.status === 'ACTIVE') {
        logger.info('Newsletter subscription attempt for active subscriber', {
          email,
        });
        return {
          success: false,
          error: 'Este email ya está suscrito.',
        };
      }

      // Si está pending, reenviar confirmación
      if (existing.status === 'PENDING') {
        logger.info('Resending newsletter confirmation', {
          email,
        });
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

        await trackEmailSend('newsletter_confirm', () =>
          resend.emails.send({
            from: emailConfig.from,
            to: email,
            subject: 'Confirma tu suscripción',
            react: NewsletterConfirm({ confirmUrl }),
          })
        );

        return {
          success: true,
          message: 'Email de confirmación reenviado. Revisa tu inbox.',
        };
      }

      // Si se dio de baja antes, permitir re-suscripción
      if (existing.status === 'UNSUBSCRIBED') {
        logger.info('Re-subscribing previously unsubscribed user', {
          email,
        });

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

        // Skip email sending in test/dev if Resend is not configured
        if (process.env.RESEND_API_KEY) {
          await trackEmailSend('newsletter_confirm', () =>
            resend.emails.send({
              from: emailConfig.from,
              to: email,
              subject: 'Confirma tu suscripción',
              react: NewsletterConfirm({ confirmUrl }),
            })
          );
        } else {
          logger.warn('Skipping email send - RESEND_API_KEY not configured', {
            email,
            environment: process.env.NODE_ENV,
          });
        }

        return {
          success: true,
          message: '¡Revisa tu email! Te hemos enviado un link de confirmación.',
        };
      }
    }

    // 5. Crear nuevo suscriptor
    logger.info('Creating new newsletter subscriber', {
      email,
    });

    const confirmToken = nanoid(32);
    const confirmTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const unsubToken = nanoid(32);

    await trackDatabaseQuery('subscriber.create', () =>
      prisma.subscriber.create({
        data: {
          email,
          status: 'PENDING',
          confirmToken,
          confirmTokenExp,
          unsubToken,
          ipAddress,
          userAgent,
        },
      })
    );

    // 6. Enviar email de confirmación
    const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/confirm?token=${confirmToken}`;

    // Skip email sending in test/dev if Resend is not configured
    if (!process.env.RESEND_API_KEY) {
      logger.warn('Skipping email send - RESEND_API_KEY not configured', {
        email,
        environment: process.env.NODE_ENV,
      });
      return {
        success: true,
        message: '¡Revisa tu email! Te hemos enviado un link de confirmación.',
      };
    }

    const emailResult = await trackEmailSend('newsletter_confirm', () =>
      resend.emails.send({
        from: emailConfig.from,
        to: email,
        subject: 'Confirma tu suscripción',
        react: NewsletterConfirm({ confirmUrl }),
      })
    );

    if (emailResult.error) {
      logger.error('Failed to send newsletter confirmation email', emailResult.error as Error, {
        email,
      });
      return {
        success: false,
        error: 'Error al enviar el email. Por favor, intenta más tarde.',
      };
    }

    logger.info('Newsletter confirmation email sent successfully', {
      email,
      emailId: emailResult.data?.id,
    });

    return {
      success: true,
      message: '¡Revisa tu email! Te hemos enviado un link de confirmación.',
    };
  } catch (error) {
    logger.error('Unexpected error in newsletter subscription', error as Error, {
      email: rawData?.email,
    });
    return {
      success: false,
      error: 'Error inesperado. Por favor, intenta más tarde.',
    };
  }
}
