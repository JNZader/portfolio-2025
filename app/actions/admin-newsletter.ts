'use server';

import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { emailConfig, resend } from '@/lib/email/resend';
import NewsletterTemplate from '@/lib/email/templates/NewsletterTemplate';
import { logger } from '@/lib/monitoring/logger';

/**
 * Schema de validación para newsletter broadcast
 */
const newsletterSchema = z.object({
  subject: z
    .string()
    .min(5, 'El asunto debe tener al menos 5 caracteres')
    .max(200, 'El asunto no puede exceder 200 caracteres'),
  content: z
    .string()
    .min(10, 'El contenido debe tener al menos 10 caracteres')
    .max(50000, 'El contenido no puede exceder 50,000 caracteres'),
});

export type BroadcastResult = {
  success: boolean;
  message?: string;
  count?: number;
  error?: string;
};

/**
 * Validar si el usuario actual es admin
 */
async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    throw new Error('Unauthorized');
  }
  return session.user;
}

/**
 * Enviar email de prueba al admin actual
 */
export async function sendTestNewsletter(formData: FormData): Promise<BroadcastResult> {
  try {
    const user = await requireAdmin();

    // Si isAdmin es true, asumimos que tiene email, pero validamos por seguridad
    const adminEmail = user.email;
    if (!adminEmail) {
      return { success: false, error: 'Admin email not found' };
    }

    // Validar inputs con Zod
    const validation = newsletterSchema.safeParse({
      subject: formData.get('subject'),
      content: formData.get('content'),
    });

    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    const { subject, content } = validation.data;

    const { error } = await resend.emails.send({
      from: emailConfig.from,
      to: adminEmail,
      subject: `[TEST] ${subject}`,
      react: NewsletterTemplate({
        subject,
        content,
        unsubscribeUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/unsubscribe?token=test-token`,
      }),
    });

    if (error) {
      logger.error('Failed to send test email', error);
      return { success: false, error: 'Error sending test email' };
    }

    return { success: true, message: `Test email sent to ${adminEmail}` };
  } catch (error) {
    logger.error('Error in sendTestNewsletter', error as Error);
    return { success: false, error: 'Unauthorized or unexpected error' };
  }
}

/**
 * Enviar broadcast a todos los suscriptores activos
 */
export async function sendNewsletterBroadcast(formData: FormData): Promise<BroadcastResult> {
  try {
    await requireAdmin();

    // Validar inputs con Zod
    const validation = newsletterSchema.safeParse({
      subject: formData.get('subject'),
      content: formData.get('content'),
    });

    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    const { subject, content } = validation.data;

    // 1. Obtener suscriptores activos
    const subscribers = await prisma.subscriber.findMany({
      where: { status: 'ACTIVE' },
      select: { email: true, unsubToken: true },
    });

    if (subscribers.length === 0) {
      return { success: false, error: 'No active subscribers found' };
    }

    logger.info(`Starting newsletter broadcast to ${subscribers.length} subscribers`);

    // 2. Enviar en lotes (Resend soporta batching, o podemos hacer loop)
    // Para simplificar y personalizar el unsubscribe link, usaremos loop concurrente limitado
    // O si Resend tuviera variables de reemplazo, usaríamos batch.
    // Por ahora, loop simple con promesas concurrentes de grupos pequeños.

    let sentCount = 0;
    const BATCH_SIZE = 10; // Enviar de a 10 para no saturar

    // Dividir en chunks
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const chunk = subscribers.slice(i, i + BATCH_SIZE);

      // Usar Promise.allSettled para conteo preciso y manejo robusto de errores
      const results = await Promise.allSettled(
        chunk.map((sub) =>
          resend.emails.send({
            from: emailConfig.from,
            to: sub.email,
            subject: subject,
            react: NewsletterTemplate({
              subject,
              content,
              unsubscribeUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/unsubscribe?token=${sub.unsubToken}`,
            }),
          })
        )
      );

      // Contar éxitos y loguear fallos
      for (let j = 0; j < results.length; j++) {
        const result = results[j];
        if (result.status === 'fulfilled') {
          sentCount++;
        } else {
          logger.error(`Failed to send newsletter to ${chunk[j].email}`, result.reason as Error);
        }
      }
    }

    logger.info(`Newsletter broadcast completed. Sent: ${sentCount}/${subscribers.length}`);

    return {
      success: true,
      message: `Newsletter sent successfully to ${sentCount} subscribers`,
      count: sentCount,
    };
  } catch (error) {
    logger.error('Error in sendNewsletterBroadcast', error as Error);
    return { success: false, error: 'Unauthorized or unexpected error' };
  }
}
