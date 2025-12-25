/**
 * Shared project utilities
 */

import type { Project } from '@/lib/github/types';
import type { Project as SanityProject } from '@/types/sanity';

/**
 * Convert Sanity project to unified Project format
 */
export function convertSanityProject(sanityProject: SanityProject): Project {
  return {
    id: sanityProject._id,
    title: sanityProject.title,
    description: sanityProject.excerpt,
    tech: sanityProject.technologies || [],
    image: sanityProject.mainImage ? `/projects/${sanityProject.slug.current}.jpg` : undefined,
    url: sanityProject.demoUrl ?? sanityProject.githubUrl ?? '#',
    github: sanityProject.githubUrl,
    demo: sanityProject.demoUrl,
    source: 'sanity',
    featured: sanityProject.featured,
  };
}
