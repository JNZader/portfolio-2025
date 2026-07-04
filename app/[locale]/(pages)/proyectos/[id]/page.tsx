import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cache } from 'react';
import type { CreativeWork, SoftwareSourceCode, WithContext } from 'schema-dts';
import { ProjectDetail } from '@/components/projects/ProjectDetail';
import { SITE_URL } from '@/lib/config/site-config';
import { mergeLocalAndSanityProjects } from '@/lib/data/projects';
import { getRepoReadme } from '@/lib/github/client';
import { getCachedFeaturedProjects } from '@/lib/github/queries';
import type { Project } from '@/lib/github/types';
import { logger } from '@/lib/monitoring/logger';
import { localeAlternates } from '@/lib/seo/alternates';
import { ogLocaleFields } from '@/lib/seo/metadata';
import { generateBreadcrumbSchema } from '@/lib/seo/schema';
import { convertSanityProject } from '@/lib/utils/project';
import { sanityFetch } from '@/sanity/lib/client';
import { projectsQuery } from '@/sanity/lib/queries';
import type { Project as SanityProject } from '@/types/sanity';

interface ProjectPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

// ISR: Revalidar cada 1 hora
export const revalidate = 3600;

const getAllProjects = cache(async (locale = 'es'): Promise<Project[]> => {
  // Sanity y GitHub son fetches independientes — en paralelo, cada uno con su
  // propio fallback (allSettled preserva el manejo de error por fuente).
  const [sanityResult, githubResult] = await Promise.allSettled([
    sanityFetch<SanityProject[]>({
      query: projectsQuery,
      tags: ['project'],
    }),
    getCachedFeaturedProjects(),
  ]);

  let sanityProjects: Project[] = [];
  if (sanityResult.status === 'fulfilled') {
    sanityProjects = mergeLocalAndSanityProjects(sanityResult.value).map((p) =>
      convertSanityProject(p, locale)
    );
  } else {
    logger.error('Failed to fetch Sanity projects', sanityResult.reason as Error, {
      service: 'projects',
      path: '/proyectos/[id]',
    });
    sanityProjects = mergeLocalAndSanityProjects([]).map((p) => convertSanityProject(p, locale));
  }

  let githubProjects: Project[] = [];
  if (githubResult.status === 'fulfilled') {
    githubProjects = githubResult.value;
  } else {
    logger.error('Failed to fetch GitHub projects', githubResult.reason as Error, {
      service: 'projects',
      path: '/proyectos/[id]',
    });
  }

  const curatedKeys = new Set(
    sanityProjects.map((project) => project.title.trim().toLowerCase().replace(/\s+/g, '-'))
  );

  return [
    ...sanityProjects,
    ...githubProjects.filter(
      (project) => !curatedKeys.has(project.title.trim().toLowerCase().replace(/\s+/g, '-'))
    ),
  ];
});

/**
 * Pre-render the curated/Sanity project detail pages at build time (SSG),
 * mirroring the blog. Eliminates the serverless cold start on a cold first
 * visit. GitHub-only projects aren't pre-rendered here (avoids hitting the
 * GitHub API on every build); they fall back to on-demand ISR via the default
 * dynamicParams behaviour and the `revalidate` above.
 */
export async function generateStaticParams() {
  // Skip static generation in CI with dummy credentials
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!projectId || projectId === 'dummy-project-id') {
    return [];
  }

  try {
    const projects = await sanityFetch<SanityProject[]>({
      query: projectsQuery,
      tags: ['project'],
    });

    return mergeLocalAndSanityProjects(projects)
      .map((p) => convertSanityProject(p))
      .map((project) => ({ id: project.id }));
  } catch (error) {
    logger.warn('Failed to fetch project ids for static generation', {
      service: 'projects',
      path: '/proyectos/[id]',
      error: (error as Error).message,
    });
    return [];
  }
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'ProjectDetail' });
  const projects = await getAllProjects(locale);
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return {
      title: t('notFound'),
    };
  }

  return {
    title: project.title,
    description: project.description,
    alternates: await localeAlternates(`/proyectos/${id}`),
    openGraph: {
      title: project.title,
      description: project.description,
      url: `/proyectos/${id}`,
      type: 'article',
      ...ogLocaleFields(locale),
      images: project.image
        ? [
            {
              url: project.image,
              width: 1200,
              height: 630,
              alt: project.title,
            },
          ]
        : undefined,
    },
  };
}

export default async function ProjectPage({ params }: Readonly<ProjectPageProps>) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('ProjectDetail');
  const tMarkdown = await getTranslations('MarkdownContent');
  const projects = await getAllProjects(locale);
  const project = projects.find((p) => p.id === id);

  if (!project) {
    notFound();
  }

  const body = locale === 'en' ? (project.bodyEn ?? project.body) : project.body;

  // Obtener README si es un proyecto de GitHub
  let readme: string | null = null;
  let repoInfo: { owner: string; repo: string } | undefined;
  if (project.source === 'github' && project.github) {
    // Extraer owner y repo de la URL de GitHub usando RegExp.exec()
    const githubUrlRegex = /github\.com\/([^/]+)\/([^/]+)/;
    const match = githubUrlRegex.exec(project.github);
    if (match) {
      const [, owner, repo] = match;
      repoInfo = { owner, repo };
      readme = await getRepoReadme(owner, repo, locale);
    }
  }

  const hasLinks = Boolean(project.demo || project.github);

  // Structured data: SoftwareSourceCode when a repo exists, CreativeWork otherwise.
  const projectUrl = `${SITE_URL}/proyectos/${project.id}`;
  const author = {
    '@type': 'Person' as const,
    name: 'Javier Zader',
    url: SITE_URL,
  };
  const projectSchema: WithContext<SoftwareSourceCode | CreativeWork> = project.github
    ? {
        '@context': 'https://schema.org',
        '@type': 'SoftwareSourceCode',
        name: project.title,
        description: project.description,
        url: projectUrl,
        codeRepository: project.github,
        ...(project.demo ? { sameAs: project.demo } : {}),
        programmingLanguage: project.tech,
        keywords: project.tech.join(', '),
        author,
        ...(project.publishedAt ? { datePublished: project.publishedAt } : {}),
        image: project.image,
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: project.title,
        description: project.description,
        url: projectUrl,
        ...(project.demo ? { sameAs: project.demo } : {}),
        keywords: project.tech.join(', '),
        author,
        ...(project.publishedAt ? { datePublished: project.publishedAt } : {}),
        image: project.image,
      };

  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: t('breadcrumbHome'), url: '/' },
      { name: t('breadcrumbProjects'), url: '/proyectos' },
      { name: project.title, url: `/proyectos/${project.id}` },
    ],
    locale
  );

  return (
    <ProjectDetail
      project={project}
      locale={locale}
      t={t}
      tMarkdown={tMarkdown}
      body={body}
      readme={readme}
      repoInfo={repoInfo}
      hasLinks={hasLinks}
      projectSchema={projectSchema}
      breadcrumbSchema={breadcrumbSchema}
    />
  );
}
