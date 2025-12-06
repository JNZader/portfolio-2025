/**
 * Hace todas las propiedades opcionales excepto las especificadas
 */
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/**
 * Hace todas las propiedades requeridas excepto las especificadas
 */
export type RequiredExcept<T, K extends keyof T> = Required<T> & Partial<Pick<T, K>>;

/**
 * Extrae el tipo de un array
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

/**
 * Extrae el tipo de una Promise
 */
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

/**
 * Hace propiedades profundamente opcionales
 */
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Hace propiedades profundamente requeridas
 */
export type DeepRequired<T> = {
    [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Crea tipo con valores específicos para ciertas keys
 */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Tipo para objetos con keys dinámicas
 */
export type Dictionary<T = unknown> = Record<string, T>;

/**
 * Tipo para valores de un enum/objeto
 */
export type ValueOf<T> = T[keyof T];

/**
 * Tipo para funciones async
 */
export type AsyncFunction<TArgs extends unknown[] = unknown[], TReturn = unknown> = (
  ...args: TArgs
) => Promise<TReturn>;