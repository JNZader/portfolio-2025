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

// Type for subscriber from database query
type SubscriberRecord = NonNullable<Awaited<ReturnType<typeof prisma.subscriber.findUnique>>>;

// Helper: Generate confirmation token with 24h expiry
function generateConfirmToken() {
  return {
    token: nanoid(32),
    expiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
}

// Helper: Build confirmation URL
function buildConfirmUrl(token: string): string {
  return `${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/confirm?token=${token}`;
}

// Helper: Send confirmation email (returns true if sent or skipped in dev)
async function sendConfirmationEmail(email: string, confirmUrl: string): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    logger.warn('Skipping email send - RESEND_API_KEY not configured', {
      email,
      environment: process.env.NODE_ENV,
    });
    return true; // Consider "sent" in dev mode
  }

  const result = await trackEmailSend('newsletter_confirm', () =>
    resend.emails.send({
      from: emailConfig.from,
      to: email,
      subject: 'Confirma tu suscripción',
      react: NewsletterConfirm({ confirmUrl }),
    })
  );

  if (result.error) {
    logger.error('Failed to send newsletter confirmation email', result.error as Error, { email });
    return false;
  }

  logger.info('Newsletter confirmation email sent successfully', {
    email,
    emailId: result.data?.id,
  });
  return true;
}

// Helper: Handle existing subscriber based on status
async function handleExistingSubscriber(
  existing: SubscriberRecord,
  email: string,
  ipAddress: string | null,
  userAgent: string | null
): Promise<NewsletterActionResponse | null> {
  // Already active
  if (existing.status === 'ACTIVE') {
    logger.info('Newsletter subscription attempt for active subscriber', { email });
    return { success: false, error: 'Este email ya está suscrito.' };
  }

  // Pending - resend confirmation
  if (existing.status === 'PENDING') {
    logger.info('Resending newsletter confirmation', { email });
    const { token, expiry } = generateConfirmToken();

    await prisma.subscriber.update({
      where: { email },
      data: { confirmToken: token, confirmTokenExp: expiry },
    });

    await sendConfirmationEmail(email, buildConfirmUrl(token));
    return { success: true, message: 'Email de confirmación reenviado. Revisa tu inbox.' };
  }

  // Unsubscribed - allow re-subscription
  if (existing.status === 'UNSUBSCRIBED') {
    logger.info('Re-subscribing previously unsubscribed user', { email });
    const { token, expiry } = generateConfirmToken();

    await prisma.subscriber.update({
      where: { email },
      data: {
        status: 'PENDING',
        confirmToken: token,
        confirmTokenExp: expiry,
        unsubscribedAt: null,
        ipAddress,
        userAgent,
      },
    });

    await sendConfirmationEmail(email, buildConfirmUrl(token));
    return {
      success: true,
      message: '¡Revisa tu email! Te hemos enviado un link de confirmación.',
    };
  }

  return null; // Unknown status, continue with normal flow
}

/**
 * Suscribir a newsletter (Step 1: Enviar email de confirmación)
 */
export async function subscribeToNewsletter(formData: FormData): Promise<NewsletterActionResponse> {
  const rawData = { email: formData.get('email') as string };

  try {
    // 1. Validate email
    const validationResult = newsletterSchema.safeParse(rawData);
    if (!validationResult.success) {
      logger.warn('Newsletter validation failed', {
        error: validationResult.error.issues[0].message,
      });
      return { success: false, error: validationResult.error.issues[0].message };
    }

    const { email } = validationResult.data;

    // 2. Rate limiting
    const headersList = await headers();
    const request = new Request('http://localhost', { headers: headersList });
    const identifier = getClientIdentifier(request);

    const { success: rateLimitSuccess } = await newsletterRateLimiter.limit(identifier);
    if (rateLimitSuccess) {
      // 3. Get IP and User-Agent for audit
      const ipAddress = identifier === 'anonymous' ? null : identifier;
      const userAgent = headersList.get('user-agent') ?? null;

      // 4. Check if subscriber exists
      const existing = await trackDatabaseQuery('subscriber.findUnique', () =>
        prisma.subscriber.findUnique({ where: { email } })
      );

      if (existing) {
        const result = await handleExistingSubscriber(existing, email, ipAddress, userAgent);
        if (result) return result;
      }

      // 5. Create new subscriber
      logger.info('Creating new newsletter subscriber', { email });
      const { token: confirmToken, expiry: confirmTokenExp } = generateConfirmToken();
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

      // 6. Send confirmation email
      const emailSent = await sendConfirmationEmail(email, buildConfirmUrl(confirmToken));
      if (emailSent) {
        return {
          success: true,
          message: '¡Revisa tu email! Te hemos enviado un link de confirmación.',
        };
      }
      return { success: false, error: 'Error al enviar el email. Por favor, intenta más tarde.' };
    }
    logger.warn('Newsletter rate limit exceeded', { identifier, email });
    return { success: false, error: 'Demasiados intentos. Por favor, intenta más tarde.' };
  } catch (error) {
    logger.error('Unexpected error in newsletter subscription', error as Error, {
      email: rawData?.email,
    });
    return { success: false, error: 'Error inesperado. Por favor, intenta más tarde.' };
  }
}
