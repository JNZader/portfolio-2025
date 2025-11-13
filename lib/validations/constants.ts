/**
 * Constantes compartidas para validación de emails
 * Usadas tanto en cliente como en servidor
 */

/**
 * Lista de dominios desechables/temporales más comunes
 * Actualizada con los proveedores más populares de 2024-2025
 */
export const DISPOSABLE_DOMAINS = [
  // Servicios temporales más populares
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  'guerrillamail.info',
  'guerrillamail.biz',
  'guerrillamail.de',
  'guerrillamailblock.com',
  'mailinator.com',
  '10minutemail.com',
  'throwaway.email',
  'getnada.com',
  'maildrop.cc',
  'sharklasers.com',
  'grr.la',
  'spam4.me',
  'mintemail.com',
  'mytemp.email',
  'delaeb.com',
  'mailto.plus',
  'emailondeck.com',
  'trashmail.com',

  // Servicios adicionales comunes
  'yopmail.com',
  'fakeinbox.com',
  'dispostable.com',
  'tempinbox.com',
  'mohmal.com',
  'airmail.cc',
  'mail-temp.com',
  'moakt.com',
  'trashmail.net',
  'disposable.com',
  'emailtemporario.com.br',
];

/**
 * Dominios válidos más comunes (para sugerencias de typos)
 */
export const COMMON_DOMAINS = [
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'yahoo.com',
  'icloud.com',
  'live.com',
  'msn.com',
  'me.com',
  'mac.com',
  'protonmail.com',
  'aol.com',
];

/**
 * Mapa de typos comunes en dominios de email
 * Mapea: dominio_con_typo → dominio_correcto
 */
export const TYPO_MAP: Record<string, string> = {
  // Gmail
  'gmail.con': 'gmail.com',
  'gmail.cm': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmil.com': 'gmail.com',
  'gmaul.com': 'gmail.com',
  'gnail.com': 'gmail.com',

  // Hotmail
  'hotmail.con': 'hotmail.com',
  'hotmail.cm': 'hotmail.com',
  'hotmil.com': 'hotmail.com',
  'hotmial.com': 'hotmail.com',

  // Yahoo
  'yahoo.con': 'yahoo.com',
  'yahoo.cm': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yaho.com': 'yahoo.com',

  // Outlook
  'outlook.con': 'outlook.com',
  'outlook.cm': 'outlook.com',
  'outlok.com': 'outlook.com',
  'outook.com': 'outlook.com',

  // iCloud
  'icloud.con': 'icloud.com',
  'icloud.cm': 'icloud.com',
  'iclud.com': 'icloud.com',
  'iclould.com': 'icloud.com',
};
