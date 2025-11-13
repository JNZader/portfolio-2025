import { resolveMx } from 'node:dns/promises';
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
 * Verifica si un dominio tiene registros MX (puede recibir emails)
 */
async function checkMxRecords(domain: string): Promise<boolean> {
  try {
    const addresses = await resolveMx(domain);
    return addresses.length > 0;
  } catch (_error) {
    // Si falla la resolución DNS, el dominio no existe o no tiene MX
    return false;
  }
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
 * Valida un email de forma completa
 */
export async function validateEmail(email: string): Promise<EmailValidationResult> {
  const normalizedEmail = email.toLowerCase().trim();

  // Extraer dominio
  const emailParts = normalizedEmail.split('@');
  if (emailParts.length !== 2) {
    return {
      isValid: false,
      reason: 'Formato de email inválido',
    };
  }

  const domain = emailParts[1];

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

  //  OK
  return {
    isValid: true,
    hasMxRecords: true,
    domain,
  };
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
