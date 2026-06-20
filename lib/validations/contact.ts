import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';
import { REGEX_PATTERNS } from '@/lib/constants';

/**
 * Motivos de contacto — `key` se guarda/valida, `label` se muestra en el email.
 * Mantener las keys sincronizadas con el `z.enum` de abajo.
 */
export const CONTACT_REASONS = {
  job: 'Oportunidad laboral (full-time)',
  freelance: 'Proyecto freelance',
  consulting: 'Consultoría / asesoría',
  other: 'Otro',
} as const;

/**
 * Timeline estimado (opcional) — mismo patrón key/label que los motivos.
 */
export const CONTACT_TIMELINES = {
  immediate: 'Inmediato / Urgente',
  short: '1-3 meses',
  mid: '3-6 meses',
  exploring: 'Solo explorando',
} as const;

export type ContactReason = keyof typeof CONTACT_REASONS;
export type ContactTimeline = keyof typeof CONTACT_TIMELINES;

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

  // Motivo de contacto (reemplaza al antiguo "asunto" de texto libre).
  // El select arranca en '' → el enum lo rechaza y dispara el mensaje custom.
  reason: z.enum(['job', 'freelance', 'consulting', 'other'], {
    error: 'Elegí un motivo para que pueda priorizar tu mensaje',
  }),

  // Empresa u organización (opcional).
  company: z.string().max(100, 'El nombre de la empresa es demasiado largo').optional(),

  // Timeline estimado (opcional). El select vacío manda '' → lo aceptamos.
  timeline: z.enum(['immediate', 'short', 'mid', 'exploring']).or(z.literal('')).optional(),

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
    reason: data.reason,
    company: data.company?.trim() || undefined,
    timeline: data.timeline || undefined,
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
