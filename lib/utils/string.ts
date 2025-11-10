/**
 * Convierte texto a slug URL-friendly
 *
 * @example
 * slugify('Hola Mundo con Ñ y Acentos')
 * // => 'hola-mundo-con-n-y-acentos'
 *
 * slugify('¡TypeScript & React!')
 * // => 'typescript-react'
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD') // Normaliza caracteres Unicode
    .replace(/[\u0300-\u036f]/g, '') // Quita acentos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/[^\w-]+/g, '') // Quita caracteres especiales
    .replace(/--+/g, '-') // Múltiples guiones a uno
    .replace(/^-+/, '') // Quita guiones al inicio
    .replace(/-+$/, ''); // Quita guiones al final
}

/**
 * Capitaliza primera letra
 *
 * @example
 * capitalize('hello world')
 * // => 'Hello world'
 */
export function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Capitaliza cada palabra (Title Case)
 *
 * @example
 * capitalizeWords('hello world from typescript')
 * // => 'Hello World From Typescript'
 */
export function capitalizeWords(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Extrae iniciales de un nombre
 *
 * @example
 * getInitials('Juan Pérez García')
 * // => 'JPG'
 */
export function getInitials(name: string, maxLength: number = 2): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, maxLength)
    .join('');
}

/**
 * Genera excerpt de texto
 *
 * @example
 * excerpt('Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 20)
 * // => 'Lorem ipsum dolor sit...'
 */
export function excerpt(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;

  // Intenta cortar en el último espacio antes del límite
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  // Use template literals instead of string concatenation (linting best practice)
  return lastSpace > 0 ? `${truncated.slice(0, lastSpace)}...` : `${truncated}...`;
}

/**
 * Pluraliza palabra en español
 *
 * @example
 * pluralize(1, 'proyecto')
 * // => '1 proyecto'
 *
 * pluralize(5, 'proyecto')
 * // => '5 proyectos'
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  const pluralForm = plural || `${singular}s`;
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/**
 * Limpia y normaliza espacios
 *
 * @example
 * cleanWhitespace('  hello    world  ')
 * // => 'hello world'
 */
export function cleanWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}
