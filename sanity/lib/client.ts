import { createClient, type QueryParams } from '@sanity/client';
import { apiVersion, dataset, isSanityConfigured, projectId, readToken } from '../env';

/**
 * Cliente Sanity configurado
 * Usado para hacer queries GROQ desde Next.js
 *
 * `null` cuando faltan NEXT_PUBLIC_SANITY_PROJECT_ID/DATASET: el módulo debe
 * evaluar sin env vars para que las páginas públicas degraden a su fallback
 * en vez de crashear en module-evaluation (V-01).
 */
export const client = isSanityConfigured
    ? createClient({
          projectId,
          dataset,
          apiVersion,
          useCdn: true, // `false` si quieres datos siempre frescos
          perspective: 'published', // 'published' | 'previewDrafts'
          token: readToken || undefined,
      })
    : null;

/**
 * Helper para queries con type-safety
 * Rechaza con un error descriptivo cuando Sanity no está configurado; los
 * callers (páginas) lo capturan y sirven su fallback local.
 */
export async function sanityFetch<QueryResponse>({
                                                     query,
                                                     params = {},
                                                     tags,
                                                 }: {
    query: string;
    params?: QueryParams;
    tags?: string[];
}): Promise<QueryResponse> {
    if (!client) {
        throw new Error(
            'Sanity is not configured: set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET'
        );
    }
    return client.fetch<QueryResponse>(query, params, {
        next: {
            revalidate: 60, // Revalidar cada 60 segundos
            tags,
        },
    });
}
