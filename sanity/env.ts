/**
 * Sanity Environment Variables
 * Validación y tipado de variables de entorno
 *
 * NO assert a nivel de módulo: las páginas públicas (/proyectos, /blog, /cv)
 * deben degradar a su fallback local cuando falta la config, no crashear con
 * un 500 en module-evaluation. Los consumidores comprueban `isSanityConfigured`
 * y los contextos que EXIGEN Sanity (Studio) usan `requireSanityEnv()`.
 */

export const apiVersion =
    process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2024-01-01';

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? '';

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '';

/**
 * true solo cuando la config mínima para hablar con Sanity está presente.
 */
export const isSanityConfigured = dataset !== '' && projectId !== '';

/**
 * Usado para server-side requests (opcional)
 */
export const readToken = process.env.SANITY_API_READ_TOKEN ?? '';

/**
 * Contextos que no pueden operar sin Sanity (p. ej. sanity.config.ts del
 * Studio) llaman a esto para fallar con un mensaje claro en arranque.
 */
export function requireSanityEnv(): { dataset: string; projectId: string } {
    if (!isSanityConfigured) {
        throw new Error(
            'Missing environment variables: NEXT_PUBLIC_SANITY_PROJECT_ID and/or NEXT_PUBLIC_SANITY_DATASET'
        );
    }
    return { dataset, projectId };
}
