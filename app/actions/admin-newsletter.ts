'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { emailConfig, resend } from '@/lib/email/resend';
import NewsletterTemplate from '@/lib/email/templates/NewsletterTemplate';
import { logger } from '@/lib/monitoring/logger';

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

    const subject = formData.get('subject') as string;
    const content = formData.get('content') as string;

    if (!subject || !content) {
      return { success: false, error: 'Subject and content are required' };
    }

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

    const subject = formData.get('subject') as string;
    const content = formData.get('content') as string;

    if (!subject || !content) {
      return { success: false, error: 'Subject and content are required' };
    }

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

      await Promise.all(
        chunk.map(async (sub) => {
          try {
            await resend.emails.send({
              from: emailConfig.from,
              to: sub.email,
              subject: subject,
              react: NewsletterTemplate({
                subject,
                content,
                unsubscribeUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/unsubscribe?token=${sub.unsubToken}`,
              }),
            });
            sentCount++;
          } catch (err) {
            logger.error(`Failed to send newsletter to ${sub.email}`, err as Error);
          }
        })
      );

      // Pequeña pausa opcional para respetar rate limits si fuera masivo
      // await new Promise(r => setTimeout(r, 100));
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
