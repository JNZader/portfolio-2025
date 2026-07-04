import { z } from 'zod';
import { REGEX_PATTERNS } from '@/lib/constants';

/**
 * Schema para suscripción a newsletter
 */
export const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, 'errEmailRequired')
    .regex(REGEX_PATTERNS.email, 'errEmailInvalid')
    .max(255, 'errEmailTooLong')
    .toLowerCase()
    .trim(),
});

export type NewsletterFormData = z.infer<typeof newsletterSchema>;

/**
 * Schema para confirmación
 */
export const confirmTokenSchema = z.object({
  token: z.string().min(1, 'errTokenRequired'),
});

/**
 * Schema para unsubscribe
 */
export const unsubscribeTokenSchema = z.object({
  token: z.string().min(1, 'errTokenRequired'),
});
