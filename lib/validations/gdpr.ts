import { z } from 'zod';

/**
 * Schema para solicitud de exportación de datos
 */
export const dataExportSchema = z.object({
  email: z.string().min(1, 'El email es requerido').email('Email inválido').toLowerCase().trim(),
});

export type DataExportInput = z.infer<typeof dataExportSchema>;

/**
 * Schema para solicitud de eliminación de datos
 */
export const dataDeletionSchema = z.object({
  email: z.string().min(1, 'El email es requerido').email('Email inválido').toLowerCase().trim(),
  confirmation: z.literal(true, {
    error: 'Debes confirmar que entiendes que esta acción es irreversible',
  }),
  reason: z.string().max(500, 'La razón no puede exceder 500 caracteres').optional(),
});

export type DataDeletionInput = z.infer<typeof dataDeletionSchema>;

/**
 * Schema para consentimiento de cookies
 */
export const cookieConsentSchema = z.object({
  essential: z.literal(true), // Always true
  analytics: z.boolean(),
  marketing: z.boolean(),
});

export type CookieConsentInput = z.infer<typeof cookieConsentSchema>;
