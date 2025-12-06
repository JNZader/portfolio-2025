import type { MetadataRoute } from 'next';
import { logger } from '@/lib/monitoring/logger';
import { sanityFetch } from '@/sanity/lib/client';
import { postsQuery, projectsQuery } from '@/sanity/lib/queries';
import type { Post, Project } from '@/types/sanity';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://javierzader.dev';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/sobre-mi`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/proyectos`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/contacto`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.7,
    },
  ];

  // Dynamic blog posts
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await sanityFetch<Post[]>({
      query: postsQuery,
      tags: ['post'],
    });
    blogPages = posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug.current}`,
      lastModified: new Date(post._updatedAt || post.publishedAt),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));
  } catch (error) {
    logger.warn('Failed to fetch blog posts for sitemap', {
      service: 'sitemap',
      error: (error as Error).message,
    });
  }

  // Dynamic projects (opcional, si quieres incluir proyectos individuales)
  let projectPages: MetadataRoute.Sitemap = [];
  try {
    const projects = await sanityFetch<Project[]>({
      query: projectsQuery,
      tags: ['project'],
    });
    projectPages = projects.map((project) => ({
      url: `${SITE_URL}/proyectos/${project.slug.current}`,
      lastModified: new Date(project._updatedAt || project.publishedAt),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
  } catch (error) {
    logger.warn('Failed to fetch projects for sitemap', {
      service: 'sitemap',
      error: (error as Error).message,
    });
  }

  return [...staticPages, ...blogPages, ...projectPages];
}
