import { groq } from 'next-sanity';
import type {
  ResumeDataRaw,
  SanityResumeData,
} from '@/lib/types/resume';
import { logger } from '@/lib/monitoring/logger';
import { sanityFetch } from './client';

/**
 * Proyectos
 */
export const projectsQuery = groq`
  *[_type == "project"] | order(publishedAt desc) {
    _id,
    _updatedAt,
    title,
    slug,
    excerpt,
    mainImage,
    technologies,
    demoUrl,
    githubUrl,
    featured,
    publishedAt
  }
`;

export const featuredProjectsQuery = groq`
  *[_type == "project" && featured == true] | order(publishedAt desc) [0...3] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    technologies,
    demoUrl,
    githubUrl
  }
`;

export const projectBySlugQuery = groq`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    technologies,
    demoUrl,
    githubUrl,
    featured,
    publishedAt,
    body
  }
`;

/**
 * Blog Posts
 */
export const postsQuery = groq`
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    _updatedAt,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    readingTime,
    featured,
    categories[]-> {
      _id,
      title,
      slug,
      color
    },
    author
  }
`;

export const featuredPostsQuery = groq`
  *[_type == "post" && featured == true] | order(publishedAt desc) [0...3] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    readingTime,
    categories[]-> {
      _id,
      title,
      slug,
      color
    }
  }
`;

export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    readingTime,
    featured,
    categories[]-> {
      _id,
      title,
      slug,
      color
    },
    author,
    seo,
    markdownBody,
    body
  }
`;

export const postsByCategoryQuery = groq`
  *[_type == "post" && $categorySlug in categories[]->slug.current] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    readingTime,
    categories[]-> {
      _id,
      title,
      slug,
      color
    }
  }
`;

/**
 * Categorías
 */
export const categoriesQuery = groq`
  *[_type == "category"] | order(title asc) {
    _id,
    title,
    slug,
    description,
    color,
    "postCount": count(*[_type == "post" && references(^._id)])
  }
`;

export const categoryBySlugQuery = groq`
  *[_type == "category" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    color
  }
`;

/**
 * Posts con paginación Y búsqueda
 */
export const paginatedPostsQuery = groq`{
  "posts": *[
    _type == "post" &&
    (!defined($category) || $category in categories[]->slug.current) &&
    (!defined($search) || [title, excerpt, markdownBody, pt::text(body)] match $search)
  ] | order(publishedAt desc) [$start...$end] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    readingTime,
    featured,
    categories[]-> {
      _id,
      title,
      slug,
      color
    },
    author
  },
  "total": count(*[
    _type == "post" &&
    (!defined($category) || $category in categories[]->slug.current) &&
    (!defined($search) || [title, excerpt, markdownBody, pt::text(body)] match $search)
  ])
}`;


/**
 * Posts destacados para sidebar
 */
export const sidebarPostsQuery = groq`
  *[_type == "post" && featured == true] | order(publishedAt desc) [0...5] {
    _id,
    title,
    slug,
    publishedAt,
    readingTime
  }
`;

/**
 * Posts relacionados (misma categoría)
 */
export const relatedPostsQuery = groq`
  *[
    _type == "post" &&
    slug.current != $slug &&
    count((categories[]->slug.current)[@ in $categories]) > 0
  ] | order(publishedAt desc) [0...3] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    readingTime,
    categories[]-> {
      _id,
      title,
      slug,
      color
    }
  }
`;

/**
 * Todos los slugs (para generateStaticParams)
 */
export const allPostSlugsQuery = groq`
  *[_type == "post" && defined(slug.current)][].slug.current
`;

/**
 * Resume / CV (singleton)
 */
export const resumeQuery = groq`
  *[_type == "resume"][0] {
    personalInfo,
    summary,
    experience,
    projects,
    education,
    skills,
    softSkills,
    languages
  }
`;

/**
 * Transform Sanity skills array to Record<string, string[]>
 * Sanity stores: [{ category: "Lenguajes", items: ["Java", "Python"] }]
 * API expects: { "Lenguajes": ["Java", "Python"] }
 */
export function transformSkills(
  skills: SanityResumeData['skills'],
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const skill of skills) {
    result[skill.category] = skill.items;
  }
  return result;
}

/**
 * Fetch resume data from Sanity with fallback to static JSON
 *
 * - Fetches from Sanity CMS with ISR (60s revalidation)
 * - Falls back to lib/data/resume.json on null/error
 * - Transforms skills from Sanity array format to Record format
 */
export async function fetchResumeData(): Promise<ResumeDataRaw> {
  try {
    const sanityData = await sanityFetch<SanityResumeData | null>({
      query: resumeQuery,
      tags: ['resume'],
    });

    if (sanityData) {
      const requiredFields = ['personalInfo', 'summary', 'education', 'languages'] as const;
      const missingFields = requiredFields.filter(
        (field) => !sanityData[field],
      );

      if (missingFields.length === 0) {
        return {
          personalInfo: sanityData.personalInfo,
          summary: sanityData.summary,
          experience: sanityData.experience ?? [],
          projects: sanityData.projects,
          education: sanityData.education ?? [],
          skills: transformSkills(sanityData.skills ?? []),
          softSkills: sanityData.softSkills,
          languages: sanityData.languages ?? [],
        };
      }

      logger.warn(
        'Sanity resume data is incomplete, using JSON fallback',
        { missingFields },
      );
    } else {
      logger.warn('Sanity resume document not found, using JSON fallback');
    }
  } catch (error) {
    logger.warn('Failed to fetch resume from Sanity, using JSON fallback', {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Fallback to static JSON
  const { default: fallbackData } = await import('@/lib/data/resume.json');
  return fallbackData as ResumeDataRaw;
}