import { createClient, type QueryParams } from '@sanity/client';
import { apiVersion, dataset, projectId, readToken } from '../env';

/**
 * Cliente Sanity configurado
 * Usado para hacer queries GROQ desde Next.js
 */
export const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: true, // `false` si quieres datos siempre frescos
    perspective: 'published', // 'published' | 'previewDrafts'
    token: readToken || undefined,
});

/**
 * Helper para queries con type-safety
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
    return client.fetch<QueryResponse>(query, params, {
        next: {
            revalidate: 60, // Revalidar cada 60 segundos
            tags,
        },
    });
}