import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined');
}

/**
 * Cliente Resend configurado
 */
export const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Configuración de emails
 */
export const emailConfig = {
  from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
  to: process.env.RESEND_TO_EMAIL || '',
};

/**
 * Helper para validar configuración
 */
export function validateEmailConfig() {
  if (!emailConfig.to) {
    throw new Error('RESEND_TO_EMAIL is not configured');
  }
}
