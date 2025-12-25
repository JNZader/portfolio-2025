/**
 * Type Guards para validación de tipos en runtime
 */

/**
 * Verifica si un valor es string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Verifica si un valor es number
 */
export function isNumber(value: unknown): value is number {
  // Use Number.isNaN instead of global isNaN (avoids type coercion)
  return typeof value === 'number' && !Number.isNaN(value);
}

/**
 * Verifica si un valor es boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Verifica si un valor es null o undefined
 */
export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Verifica si un valor existe (no null ni undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Verifica si un valor es un array
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Verifica si un valor es un objeto
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Verifica si un valor es una función
 */
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

/**
 * Verifica si un valor es una Promise
 */
export function isPromise<T = unknown>(value: unknown): value is Promise<T> {
  return value instanceof Promise;
}

/**
 * Verifica si un string es un email válido
 * Uses length limit to prevent ReDoS attacks (RFC 5321: max 254 chars)
 */
export function isEmail(value: string): boolean {
  // Fail fast: RFC 5321 max email length is 254 characters
  if (value.length > 254) return false;

  // More specific regex to prevent backtracking:
  // - Local part: alphanumeric + allowed special chars
  // - Domain: alphanumeric + hyphens
  // - TLD: required, 2+ alphabetic chars
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9][a-zA-Z0-9-]*(?:\.[a-zA-Z0-9][a-zA-Z0-9-]*)*\.[a-zA-Z]{2,}$/;
  return emailRegex.test(value);
}

/**
 * Verifica si un string es una URL válida
 */
export function isUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Verifica si estamos en el cliente (browser)
 */
export function isClient(): boolean {
  return typeof globalThis !== 'undefined';
}

/**
 * Verifica si estamos en el servidor
 */
export function isServer(): boolean {
  return typeof globalThis === 'undefined';
}
