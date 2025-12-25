/**
 * Validación de email solo para CLIENTE (sin DNS lookup)
 * Este archivo no usa módulos de Node.js y puede ejecutarse en el navegador
 *
 * Re-exporta las funciones compartidas desde el módulo común
 */

export {
  type EmailValidationResult,
  findTypoSuggestion,
  isDisposableDomain,
  parseEmail,
  quickValidateEmail,
} from './email-validator-shared';
