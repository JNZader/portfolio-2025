/**
 * Shared project utilities
 */

import type { Project } from '@/lib/github/types';
import { getImageUrl } from '@/sanity/lib/image';
import type { Project as SanityProject } from '@/types/sanity';

/**
 * Convert Sanity project to unified Project format
 */
export function convertSanityProject(sanityProject: SanityProject, locale = 'es'): Project {
  return {
    id: sanityProject._id,
    title: sanityProject.title,
    description:
      locale === 'en' ? (sanityProject.excerptEn ?? sanityProject.excerpt) : sanityProject.excerpt,
    tech: sanityProject.technologies || [],
    // Resolve the real Sanity CDN URL from the image asset. Previously this
    // pointed at a static /projects/{slug}.jpg that doesn't exist in /public,
    // so every Sanity project's <Image> 404'd. getImageUrl builds a cdn.sanity.io
    // URL (already allowed in next.config remotePatterns + CSP).
    image: sanityProject.mainImage?.asset?._ref
      ? getImageUrl(sanityProject.mainImage, 1200)
      : undefined,
    url: sanityProject.demoUrl ?? sanityProject.githubUrl ?? '#',
    github: sanityProject.githubUrl,
    demo: sanityProject.demoUrl,
    source: 'sanity',
    featured: sanityProject.featured,
    privateCaseStudy: sanityProject.privateCaseStudy,
    repoIsOrigin: sanityProject.repoIsOrigin,
    publishedAt: sanityProject.publishedAt,
    body: sanityProject.body,
    bodyEn: sanityProject.bodyEn,
  };
}
