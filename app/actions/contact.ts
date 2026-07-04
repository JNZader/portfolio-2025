'use server';

import { headers } from 'next/headers';
import { emailConfig, resend, validateEmailConfig } from '@/lib/email/resend';
import ContactConfirm from '@/lib/email/templates/ContactConfirm';
import ContactEmail from '@/lib/email/templates/ContactEmail';
import { logger } from '@/lib/monitoring/logger';
import { measureAsync, trackEmailSend } from '@/lib/monitoring/performance';
import { contactRateLimiter, getClientIdentifier } from '@/lib/rate-limit/redis';
import {
  CONTACT_REASONS,
  CONTACT_TIMELINES,
  contactSchema,
  sanitizeContactData,
  sanitizeText,
} from '@/lib/validations/contact';
import { validateEmail } from '@/lib/validations/email-validator';

/**
 * Response type para la acción
 */
export type ContactActionResponse =
  | { success: true; messageKey: string }
  | { success: false; errorKey: string };

/**
 * Server Action para enviar email de contacto
 */
export async function sendContactEmail(formData: FormData): Promise<ContactActionResponse> {
  // 2. Extraer datos del FormData (fuera del try para estar disponible en catch)
  const rawData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    reason: formData.get('reason') as string,
    company: formData.get('company') ?? undefined,
    timeline: formData.get('timeline') ?? undefined,
    message: formData.get('message') as string,
  };

  try {
    // 1. Validar configuración
    validateEmailConfig();

    // 3. Validar con Zod
    const validationResult = contactSchema.safeParse(rawData);

    if (!validationResult.success) {
      logger.warn('Contact form validation failed', {
        email: rawData.email,
        error: validationResult.error.issues[0].message,
      });
      return {
        success: false,
        errorKey: validationResult.error.issues[0].message,
      };
    }

    // 4. Sanitizar datos
    const data = sanitizeContactData(validationResult.data);

    // 5. Sanitización adicional contra XSS.
    // reason/timeline son keys controladas → no necesitan sanitizado de HTML.
    const sanitizedData = {
      name: sanitizeText(data.name),
      email: sanitizeText(data.email),
      company: data.company ? sanitizeText(data.company) : undefined,
      message: sanitizeText(data.message),
    };

    // Labels legibles y asunto compuesto: "[Motivo] · Empresa · Timeline".
    const reasonLabel = CONTACT_REASONS[data.reason];
    const timelineLabel = data.timeline ? CONTACT_TIMELINES[data.timeline] : undefined;
    const emailSubject = `[${reasonLabel}]${
      sanitizedData.company ? ` · ${sanitizedData.company}` : ''
    }${timelineLabel ? ` · ${timelineLabel}` : ''}`;

    // 6. Validación avanzada de email (DNS/MX records, dominios desechables)
    // Nota: Los typos se validan solo en el cliente, el servidor no los rechaza
    const emailValidation = await measureAsync(
      'email_validation',
      () => validateEmail(sanitizedData.email),
      { email: sanitizedData.email }
    );

    if (!emailValidation.isValid) {
      logger.warn('Email validation failed', {
        email: sanitizedData.email,
        reason: emailValidation.reason,
        suggestion: emailValidation.suggestion,
      });
      return {
        success: false,
        errorKey: 'toastEmailInvalid',
      };
    }

    logger.info('Email validation passed', {
      email: sanitizedData.email,
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
      logger.warn('Contact form rate limit exceeded', {
        identifier,
        email: sanitizedData.email,
      });
      return {
        success: false,
        errorKey: 'toastRateLimit',
      };
    }

    // 8. Enviar email al propietario (el email ya fue validado con DNS)
    const ownerEmailResult = await trackEmailSend('contact', () =>
      resend.emails.send({
        from: emailConfig.from,
        to: emailConfig.to,
        subject: `✅ Nuevo Contacto: ${emailSubject}`,
        react: ContactEmail({
          name: sanitizedData.name,
          email: sanitizedData.email,
          reason: reasonLabel,
          company: sanitizedData.company,
          timeline: timelineLabel,
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
      })
    );

    if (ownerEmailResult.error) {
      logger.error('Failed to send contact email', ownerEmailResult.error as Error, {
        email: sanitizedData.email,
        subject: emailSubject,
      });
      return {
        success: false,
        errorKey: 'toastSendError',
      };
    }

    // 9. Enviar email de confirmación al remitente (solo si el dominio está verificado)
    // Esto requiere que RESEND_FROM_EMAIL sea de un dominio verificado en Resend
    const confirmEmailResult = await trackEmailSend('contact_confirm', () =>
      resend.emails.send({
        from: emailConfig.from,
        to: sanitizedData.email,
        subject: '✅ Mensaje recibido - Javier Zader',
        react: ContactConfirm({
          name: sanitizedData.name,
        }),
      })
    );

    if (confirmEmailResult.error) {
      // Log pero no falla - el mensaje principal ya fue enviado
      logger.warn('Failed to send contact confirmation email', {
        email: sanitizedData.email,
        error: confirmEmailResult.error,
      });
    } else {
      logger.info('Contact confirmation email sent', {
        email: sanitizedData.email,
        emailId: confirmEmailResult.data?.id,
      });
    }

    // 10. Success
    logger.info('Contact form submitted successfully', {
      email: sanitizedData.email,
      subject: emailSubject,
      emailId: ownerEmailResult.data?.id,
    });

    return {
      success: true,
      messageKey: 'toastSuccess',
    };
  } catch (error) {
    logger.error('Unexpected error in contact form', error as Error, {
      email: rawData?.email,
    });
    return {
      success: false,
      errorKey: 'toastUnexpected',
    };
  }
}
