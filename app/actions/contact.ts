'use server';

import DOMPurify from 'isomorphic-dompurify';
import { headers } from 'next/headers';
import { emailConfig, resend, validateEmailConfig } from '@/lib/email/resend';
import ContactConfirm from '@/lib/email/templates/ContactConfirm';
import ContactEmail from '@/lib/email/templates/ContactEmail';
import { contactRateLimiter, getClientIdentifier } from '@/lib/rate-limit/redis';
import { contactSchema, sanitizeContactData } from '@/lib/validations/contact';

/**
 * Response type para la acción
 */
export type ContactActionResponse =
  | { success: true; message: string }
  | { success: false; error: string };

/**
 * Server Action para enviar email de contacto
 */
export async function sendContactEmail(formData: FormData): Promise<ContactActionResponse> {
  try {
    // 1. Validar configuración
    validateEmailConfig();

    // 2. Extraer datos del FormData
    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    // 3. Validar con Zod
    const validationResult = contactSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0].message,
      };
    }

    // 4. Sanitizar datos
    const data = sanitizeContactData(validationResult.data);

    // 5. Sanitización adicional contra XSS
    const sanitizedData = {
      name: DOMPurify.sanitize(data.name, { ALLOWED_TAGS: [] }),
      email: DOMPurify.sanitize(data.email, { ALLOWED_TAGS: [] }),
      subject: DOMPurify.sanitize(data.subject, { ALLOWED_TAGS: [] }),
      message: DOMPurify.sanitize(data.message, { ALLOWED_TAGS: [] }),
    };

    // 6. Rate limiting
    const headersList = await headers();
    const request = new Request('http://localhost', {
      headers: headersList,
    });
    const identifier = getClientIdentifier(request);

    const { success: rateLimitSuccess } = await contactRateLimiter.limit(identifier);

    if (!rateLimitSuccess) {
      return {
        success: false,
        error: 'Has alcanzado el límite de envíos. Por favor, intenta más tarde.',
      };
    }

    // 7. Enviar email al propietario del portfolio
    const ownerEmailResult = await resend.emails.send({
      from: emailConfig.from,
      to: emailConfig.to,
      subject: `Contacto: ${sanitizedData.subject}`,
      react: ContactEmail({
        name: sanitizedData.name,
        email: sanitizedData.email,
        subject: sanitizedData.subject,
        message: sanitizedData.message,
      }),
    });

    if (ownerEmailResult.error) {
      console.error('Error sending owner email:', ownerEmailResult.error);
      return {
        success: false,
        error: 'Error al enviar el mensaje. Por favor, intenta más tarde.',
      };
    }

    // 8. Enviar email de confirmación al usuario
    try {
      await resend.emails.send({
        from: emailConfig.from,
        to: sanitizedData.email,
        subject: 'Confirmación de mensaje recibido',
        react: ContactConfirm({
          name: sanitizedData.name,
        }),
      });
    } catch (confirmError) {
      // No fallar si el email de confirmación falla
      console.error('Error sending confirmation email:', confirmError);
    }

    // 9. Success
    return {
      success: true,
      message:
        '¡Mensaje enviado con éxito! Te responderé pronto. Revisa tu email para una confirmación.',
    };
  } catch (error) {
    console.error('Contact form error:', error);
    return {
      success: false,
      error: 'Error inesperado. Por favor, intenta más tarde.',
    };
  }
}
