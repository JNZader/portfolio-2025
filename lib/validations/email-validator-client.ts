/**
 * Validación de email solo para CLIENTE (sin DNS lookup)
 * Este archivo no usa módulos de Node.js y puede ejecutarse en el navegador
 */

import { COMMON_DOMAINS, DISPOSABLE_DOMAINS, TYPO_MAP } from './constants';

/**
 * Resultado de la validación de email
 */
export interface EmailValidationResult {
  isValid: boolean;
  reason?: string;
  suggestion?: string;
  domain?: string;
  isDisposable?: boolean;
}

/**
 * Verifica si es un dominio desechable/temporal
 */
function isDisposableDomain(domain: string): boolean {
  return DISPOSABLE_DOMAINS.includes(domain.toLowerCase());
}

/**
 * Encuentra typos comunes en dominios
 */
function findTypoSuggestion(domain: string): string | undefined {
  const lowerDomain = domain.toLowerCase();

  // Verificar en el mapa de typos comunes
  if (TYPO_MAP[lowerDomain]) {
    return TYPO_MAP[lowerDomain];
  }

  // Buscar dominios similares usando distancia de Levenshtein simple
  for (const commonDomain of COMMON_DOMAINS) {
    const similarity = calculateSimilarity(lowerDomain, commonDomain);
    // Solo sugerir si es similar PERO NO exactamente igual
    if (similarity > 0.8 && similarity < 1.0) {
      return commonDomain;
    }
  }

  return undefined;
}

/**
 * Calcula similaridad entre dos strings (0-1)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calcula distancia de Levenshtein
 */
function getEditDistance(str1: string, str2: string): number {
  const costs: number[] = [];
  for (let i = 0; i <= str1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= str2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (str1.charAt(i - 1) !== str2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[str2.length] = lastValue;
  }
  return costs[str2.length];
}

/**
 * Validación rápida (sin DNS lookup) para uso en cliente
 */
export function quickValidateEmail(email: string): EmailValidationResult {
  const normalizedEmail = email.toLowerCase().trim();
  const emailParts = normalizedEmail.split('@');

  if (emailParts.length !== 2) {
    return { isValid: false, reason: 'Formato de email inválido' };
  }

  const domain = emailParts[1];

  // Verificar si es desechable
  if (isDisposableDomain(domain)) {
    return {
      isValid: false,
      reason: 'Email temporal o desechable no permitido',
      isDisposable: true,
      domain,
    };
  }

  // Verificar typos
  const suggestion = findTypoSuggestion(domain);
  if (suggestion) {
    return {
      isValid: false,
      reason: `¿Quisiste decir ${emailParts[0]}@${suggestion}?`,
      suggestion: `${emailParts[0]}@${suggestion}`,
      domain,
    };
  }

  return { isValid: true, domain };
}
