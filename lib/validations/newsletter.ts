import { z } from 'zod';
import { REGEX_PATTERNS } from '@/lib/constants';

/**
 * Schema para suscripción a newsletter
 */
export const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .regex(REGEX_PATTERNS.email, 'Email inválido')
    .max(255, 'El email es demasiado largo')
    .toLowerCase()
    .trim(),
});

export type NewsletterFormData = z.infer<typeof newsletterSchema>;

/**
 * Schema para confirmación
 */
export const confirmTokenSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
});

/**
 * Schema para unsubscribe
 */
export const unsubscribeTokenSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
});
