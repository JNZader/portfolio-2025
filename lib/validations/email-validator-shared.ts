/**
 * Funciones compartidas para validación de emails
 * Usadas tanto en cliente como en servidor (sin dependencias de Node.js)
 */

import { COMMON_DOMAINS, DISPOSABLE_DOMAINS, TYPO_MAP } from './constants';

/**
 * Resultado de la validación de email
 */
export interface EmailValidationResult {
  isValid: boolean;
  reason?: string;
  suggestion?: string;
  hasMxRecords?: boolean;
  isDisposable?: boolean;
  domain?: string;
}

/**
 * Verifica si es un dominio desechable/temporal
 */
export function isDisposableDomain(domain: string): boolean {
  return DISPOSABLE_DOMAINS.includes(domain.toLowerCase());
}

/**
 * Calcula distancia de Levenshtein entre dos strings
 */
export function getEditDistance(str1: string, str2: string): number {
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
 * Calcula similaridad entre dos strings (0-1)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1;

  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Encuentra typos comunes en dominios
 */
export function findTypoSuggestion(domain: string): string | undefined {
  const lowerDomain = domain.toLowerCase();

  // Verificar en el mapa de typos comunes
  if (TYPO_MAP[lowerDomain]) {
    return TYPO_MAP[lowerDomain];
  }

  // Buscar dominios similares usando distancia de Levenshtein
  for (const commonDomain of COMMON_DOMAINS) {
    const similarity = calculateSimilarity(lowerDomain, commonDomain);
    // Solo sugerir si es similar PERO NO exactamente igual
    if (similarity > 0.8 && similarity < 1) {
      return commonDomain;
    }
  }

  return undefined;
}

/**
 * Extrae y valida el formato básico del email
 */
export function parseEmail(email: string): { localPart: string; domain: string } | null {
  const normalizedEmail = email.toLowerCase().trim();
  const emailParts = normalizedEmail.split('@');

  if (emailParts.length !== 2) {
    return null;
  }

  return { localPart: emailParts[0], domain: emailParts[1] };
}

/**
 * Validación rápida (sin DNS lookup) para uso en cliente
 */
export function quickValidateEmail(email: string): EmailValidationResult {
  const parsed = parseEmail(email);

  if (!parsed) {
    return { isValid: false, reason: 'Formato de email inválido' };
  }

  const { localPart, domain } = parsed;

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
      reason: `¿Quisiste decir ${localPart}@${suggestion}?`,
      suggestion: `${localPart}@${suggestion}`,
      domain,
    };
  }

  return { isValid: true, domain };
}
