import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/config/site-config';
import { mergeLocalAndSanityProjects } from '@/lib/data/projects';
import { logger } from '@/lib/monitoring/logger';
import { convertSanityProject } from '@/lib/utils/project';
import { sanityFetch } from '@/sanity/lib/client';
import { postsQuery, projectsQuery } from '@/sanity/lib/queries';
import type { Post, Project } from '@/types/sanity';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/sobre-mi`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/proyectos`,
      changeFrequency: 'weekly',
      priority: 0.9,
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
    },
    {
      url: `${SITE_URL}/cv`,
      changeFrequency: 'monthly',
      priority: 0.8,
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
      lastModified: new Date(post._updatedAt ?? post.publishedAt),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));
  } catch (error) {
    logger.warn('Failed to fetch blog posts for sitemap', {
      service: 'sitemap',
      error: (error as Error).message,
    });
  }

  // Dynamic projects. IMPORTANT: /proyectos/[id] matches by the unified
  // Project.id (Sanity _id, or the handmade _id of local projects), NOT by
  // slug — mirror generateStaticParams so every sitemap URL actually resolves.
  let projectPages: MetadataRoute.Sitemap = [];
  try {
    const projects = await sanityFetch<Project[]>({
      query: projectsQuery,
      tags: ['project'],
    });
    projectPages = mergeLocalAndSanityProjects(projects).map((project) => ({
      url: `${SITE_URL}/proyectos/${convertSanityProject(project).id}`,
      lastModified: new Date(project._updatedAt ?? project.publishedAt),
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
