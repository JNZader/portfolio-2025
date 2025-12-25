import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';
import { REGEX_PATTERNS } from '@/lib/constants';

/**
 * Schema de validación para formulario de contacto
 */
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre debe tener máximo 100 caracteres')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/,
      'El nombre solo puede contener letras, espacios, guiones y apóstrofes'
    ),

  email: z
    .string()
    .min(1, 'El email es requerido')
    .regex(REGEX_PATTERNS.email, 'Email inválido')
    .max(255, 'El email es demasiado largo'),

  subject: z
    .string()
    .min(5, 'El asunto debe tener al menos 5 caracteres')
    .max(200, 'El asunto debe tener máximo 200 caracteres'),

  message: z
    .string()
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(1000, 'El mensaje debe tener máximo 1000 caracteres'),
});

/**
 * Type inferido del schema
 */
export type ContactFormData = z.infer<typeof contactSchema>;

/**
 * Schema para sanitización adicional
 */
export const sanitizeContactData = (data: ContactFormData): ContactFormData => {
  return {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    subject: data.subject.trim(),
    message: data.message.trim(),
  };
};

/**
 * Sanitiza texto eliminando todos los tags HTML
 * Usa sanitize-html que es compatible con serverless (sin jsdom)
 */
export function sanitizeText(text: string): string {
  return sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} });
}
