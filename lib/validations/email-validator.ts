/**
 * Validación de email para SERVIDOR (con DNS lookup)
 * Este archivo usa módulos de Node.js y solo puede ejecutarse en el servidor
 */

import { resolveMx } from 'node:dns/promises';
import {
  type EmailValidationResult,
  isDisposableDomain,
  parseEmail,
} from './email-validator-shared';

// Re-export shared functions for convenience
export { type EmailValidationResult, quickValidateEmail } from './email-validator-shared';

/**
 * Verifica si un dominio tiene registros MX (puede recibir emails)
 */
async function checkMxRecords(domain: string): Promise<boolean> {
  try {
    const addresses = await resolveMx(domain);
    return addresses.length > 0;
  } catch {
    // DNS resolution failed - domain doesn't exist or has no MX records
    // This is expected for invalid domains, so we return false
    return false;
  }
}

/**
 * Valida un email de forma completa (con verificación de MX records)
 * Solo para uso en servidor
 */
export async function validateEmail(email: string): Promise<EmailValidationResult> {
  const parsed = parseEmail(email);

  if (!parsed) {
    return {
      isValid: false,
      reason: 'Formato de email inválido',
    };
  }

  const { domain } = parsed;

  // 1. Verificar si es dominio desechable
  if (isDisposableDomain(domain)) {
    return {
      isValid: false,
      reason: 'Email temporal o desechable no permitido',
      isDisposable: true,
      domain,
    };
  }

  // 2. Verificar registros MX (dominio puede recibir emails)
  // Nota: NO validamos typos en el servidor - eso ya lo hace el cliente
  const hasMxRecords = await checkMxRecords(domain);

  if (!hasMxRecords) {
    return {
      isValid: false,
      reason: 'El dominio del email no existe o no puede recibir correos',
      hasMxRecords: false,
      domain,
    };
  }

  // OK
  return {
    isValid: true,
    hasMxRecords: true,
    domain,
  };
}
