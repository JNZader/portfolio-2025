import { Resend } from 'resend';

/**
 * Cliente Resend configurado
 * Falls back to a dummy key for CI builds, but will throw error on actual usage
 */
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_dummy_key_for_ci_build';
export const resend = new Resend(RESEND_API_KEY);

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
