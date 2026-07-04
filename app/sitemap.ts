import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/config/site-config';
import { mergeLocalAndSanityProjects } from '@/lib/data/projects';
import { logger } from '@/lib/monitoring/logger';
import { convertSanityProject } from '@/lib/utils/project';
import { sanityFetch } from '@/sanity/lib/client';
import { postsQuery, projectsQuery } from '@/sanity/lib/queries';
import type { Post, Project } from '@/types/sanity';

// es (default) URL is prefix-less; en lives under /en. Each bilingual page is
// emitted once (es url) with its English alternate declared via hreflang.
const enUrl = (path: string) => `${SITE_URL}/en${path}`;
const bilingualAlternates = (path: string) => ({
  languages: { es: `${SITE_URL}${path}`, en: enUrl(path) },
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages. The fully-translated pages (home, sobre-mi, contacto, cv,
  // proyectos) declare es+en hreflang. The blog stays Spanish-canonical by
  // design (opt-in per post; see i18n phasing).
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: 'daily',
      priority: 1,
      alternates: bilingualAlternates('/'),
    },
    {
      url: `${SITE_URL}/sobre-mi`,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: bilingualAlternates('/sobre-mi'),
    },
    {
      url: `${SITE_URL}/proyectos`,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: bilingualAlternates('/proyectos'),
    },
    {
      url: `${SITE_URL}/blog`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/contacto`,
      changeFrequency: 'yearly',
      priority: 0.7,
      alternates: bilingualAlternates('/contacto'),
    },
    {
      url: `${SITE_URL}/cv`,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: bilingualAlternates('/cv'),
    },
    {
      url: `${SITE_URL}/privacy`,
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: bilingualAlternates('/privacy'),
    },
    {
      url: `${SITE_URL}/data-request`,
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: bilingualAlternates('/data-request'),
    },
    {
      url: `${SITE_URL}/newsletter`,
      changeFrequency: 'monthly',
      priority: 0.5,
      alternates: bilingualAlternates('/newsletter'),
    },
  ];

  // Dynamic blog posts and projects are fetched concurrently — each keeps its
  // own try/catch so one source failing never blocks the other's fallback.
  const fetchBlogPages = async (): Promise<MetadataRoute.Sitemap> => {
    try {
      const posts = await sanityFetch<Post[]>({
        query: postsQuery,
        tags: ['post'],
      });
      return posts.map((post) => ({
        url: `${SITE_URL}/blog/${post.slug.current}`,
        lastModified: new Date(post._updatedAt ?? post.publishedAt),
        changeFrequency: 'monthly',
        priority: 0.7,
      }));
    } catch (error) {
      logger.warn('Failed to fetch blog posts for sitemap', {
        service: 'sitemap',
        error: (error as Error).message,
      });
      return [];
    }
  };

  // Dynamic projects. IMPORTANT: /proyectos/[id] matches by the unified
  // Project.id (Sanity _id, or the handmade _id of local projects), NOT by
  // slug — mirror generateStaticParams so every sitemap URL actually resolves.
  const fetchProjectPages = async (): Promise<MetadataRoute.Sitemap> => {
    try {
      const projects = await sanityFetch<Project[]>({
        query: projectsQuery,
        tags: ['project'],
      });
      return mergeLocalAndSanityProjects(projects).map((project) => {
        const id = convertSanityProject(project).id;
        return {
          url: `${SITE_URL}/proyectos/${id}`,
          lastModified: new Date(project._updatedAt ?? project.publishedAt),
          changeFrequency: 'monthly',
          priority: 0.6,
          alternates: bilingualAlternates(`/proyectos/${id}`),
        };
      });
    } catch (error) {
      logger.warn('Failed to fetch projects for sitemap', {
        service: 'sitemap',
        error: (error as Error).message,
      });
      return [];
    }
  };

  const [blogResult, projectResult] = await Promise.allSettled([
    fetchBlogPages(),
    fetchProjectPages(),
  ]);

  const blogPages: MetadataRoute.Sitemap =
    blogResult.status === 'fulfilled' ? blogResult.value : [];
  const projectPages: MetadataRoute.Sitemap =
    projectResult.status === 'fulfilled' ? projectResult.value : [];

  return [...staticPages, ...blogPages, ...projectPages];
}
