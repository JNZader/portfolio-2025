'use server';

import DOMPurify from 'isomorphic-dompurify';
import { headers } from 'next/headers';
import { emailConfig, resend, validateEmailConfig } from '@/lib/email/resend';
import ContactEmail from '@/lib/email/templates/ContactEmail';
import { contactRateLimiter, getClientIdentifier } from '@/lib/rate-limit/redis';
import { contactSchema, sanitizeContactData } from '@/lib/validations/contact';
import { validateEmail } from '@/lib/validations/email-validator';

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

    // 6. Validación avanzada de email (DNS/MX records, dominios desechables)
    // Nota: Los typos se validan solo en el cliente, el servidor no los rechaza
    const emailValidation = await validateEmail(sanitizedData.email);

    if (!emailValidation.isValid) {
      console.log('❌ Email validation failed:', emailValidation.reason);
      return {
        success: false,
        error: emailValidation.suggestion
          ? `${emailValidation.reason}`
          : `Email inválido: ${emailValidation.reason}`,
      };
    }

    console.log('✅ Email validation passed:', {
      domain: emailValidation.domain,
      hasMxRecords: emailValidation.hasMxRecords,
    });

    // 7. Rate limiting
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

    // 8. Enviar email al propietario (el email ya fue validado con DNS)
    const ownerEmailResult = await resend.emails.send({
      from: emailConfig.from,
      to: emailConfig.to,
      subject: `✅ Nuevo Contacto: ${sanitizedData.subject}`,
      react: ContactEmail({
        name: sanitizedData.name,
        email: sanitizedData.email,
        subject: sanitizedData.subject,
        message: `✅ Email verificado (dominio: ${emailValidation.domain}, MX records: OK)\n\n${sanitizedData.message}`,
      }),
      // Tags y headers para facilitar filtrado en Gmail
      tags: [
        {
          name: 'category',
          value: 'contact-form',
        },
      ],
      headers: {
        'X-Entity-Ref-ID': 'portfolio-contact-form',
        'X-Priority': '1', // Alta prioridad
      },
    });

    if (ownerEmailResult.error) {
      console.error('Error sending owner email:', ownerEmailResult.error);
      return {
        success: false,
        error: 'Error al enviar el mensaje. Por favor, intenta más tarde.',
      };
    }

    // 9. Success
    return {
      success: true,
      message: '¡Mensaje enviado con éxito! ✅ Te responderé en 24-48 horas hábiles.',
    };
  } catch (error) {
    console.error('Contact form error:', error);
    return {
      success: false,
      error: 'Error inesperado. Por favor, intenta más tarde.',
    };
  }
}
