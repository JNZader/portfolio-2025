/**
 * Formatea una fecha en español
 *
 * @example
 * formatDate('2025-01-15')
 * // => '15 de enero de 2025'
 *
 * formatDate('2025-01-15', 'short')
 * // => '15/01/2025'
 *
 * formatDate('2025-01-15', 'relative')
 * // => 'hace 2 días'
 */
export function formatDate(
  date: string | Date,
  format: 'long' | 'short' | 'relative' = 'long'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (format === 'short') {
    return dateObj.toLocaleDateString('es-ES');
  }

  if (format === 'relative') {
    return formatRelativeTime(dateObj);
  }

  // Format: 'long'
  return dateObj.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formatea tiempo relativo (hace X días/horas/minutos)
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Time intervals with English keys (avoids non-ASCII linting issues)
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  // Spanish translations for each time unit
  const translations: Record<string, { singular: string; plural: string }> = {
    year: { singular: 'año', plural: 'años' },
    month: { singular: 'mes', plural: 'meses' },
    week: { singular: 'semana', plural: 'semanas' },
    day: { singular: 'día', plural: 'días' },
    hour: { singular: 'hora', plural: 'horas' },
    minute: { singular: 'minuto', plural: 'minutos' },
  };

  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      const translation = translations[unit];
      const unitText = interval === 1 ? translation.singular : translation.plural;
      return `hace ${interval} ${unitText}`;
    }
  }

  return 'hace un momento';
}

/**
 * Calcula tiempo de lectura estimado
 *
 * @param text - Texto completo
 * @param wordsPerMinute - Palabras por minuto (default: 200)
 * @returns Minutos de lectura
 *
 * @example
 * calculateReadingTime('Lorem ipsum dolor sit amet...')
 * // => 5 (minutos)
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 200): number {
  const words = text.trim().split(/\s+/).length;
  const minutes = words / wordsPerMinute;
  return Math.ceil(minutes);
}

/**
 * Formatea número con separadores de miles
 *
 * @example
 * formatNumber(1234567)
 * // => '1,234,567'
 *
 * formatNumber(1234567, 'es-ES')
 * // => '1.234.567'
 */
export function formatNumber(num: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Formatea bytes a tamaño legible
 *
 * @example
 * formatBytes(1024)
 * // => '1 KB'
 *
 * formatBytes(1536000)
 * // => '1.46 MB'
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // Use template literal instead of string concatenation (linting best practice)
  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Trunca texto y agrega "..."
 *
 * @example
 * truncate('Lorem ipsum dolor sit amet', 10)
 * // => 'Lorem ipsu...'
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  // Use template literal instead of string concatenation (linting best practice)
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Formatea porcentaje
 *
 * @example
 * formatPercent(0.856, 1)
 * // => '85.6%'
 */
export function formatPercent(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}
