import { mergeLocalAndSanityProjects } from '@/lib/data/projects';
import type { Project } from '@/lib/github/types';
import { logger } from '@/lib/monitoring/logger';
import { convertSanityProject } from '@/lib/utils/project';
import type { Project as SanityProject } from '@/types/sanity';

/**
 * Proyectos curados (Sanity) con fallback a los case studies locales.
 * Mismo patrón probado en /cv: import dinámico de Sanity DENTRO del try; sin
 * las env vars de Sanity el throw cae en el catch y la página renderiza los
 * case studies versionados en vez de un 500 (V-01).
 */
export async function getSanityProjects(locale: string): Promise<Project[]> {
  try {
    const [{ sanityFetch }, { projectsQuery }] = await Promise.all([
      import('@/sanity/lib/client'),
      import('@/sanity/lib/queries'),
    ]);
    const remoteProjects = await sanityFetch<SanityProject[]>({
      query: projectsQuery,
      tags: ['project'],
    });
    return mergeLocalAndSanityProjects(remoteProjects).map((p) => convertSanityProject(p, locale));
  } catch (error) {
    logger.error('Failed to fetch Sanity projects', error as Error, {
      service: 'projects',
      path: '/proyectos',
    });
    return mergeLocalAndSanityProjects([]).map((p) => convertSanityProject(p, locale));
  }
}
