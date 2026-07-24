import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import ProjectsClient from '@/components/projects/ProjectsClient';
import Container from '@/components/ui/Container';
import { InteriorHero } from '@/components/ui/InteriorHero';
import Section from '@/components/ui/Section';
import { Skeleton } from '@/components/ui/Skeleton';
import { mergeLocalAndSanityProjects } from '@/lib/data/projects';
import { getCachedFeaturedProjects } from '@/lib/github/queries';
import type { Project } from '@/lib/github/types';
import { logger } from '@/lib/monitoring/logger';
import { localeAlternates } from '@/lib/seo/alternates';
import { convertSanityProject } from '@/lib/utils/project';
import { sanityFetch } from '@/sanity/lib/client';
import { projectsQuery } from '@/sanity/lib/queries';
import type { Project as SanityProject } from '@/types/sanity';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Projects');
  return {
    title: t('metaTitle'),
    alternates: await localeAlternates('/proyectos'),
    description: t('metaDescription'),
  };
}

// ISR: Revalidar cada 1 hora
export const revalidate = 3600;

const SKELETON_PROJECTS = ['a', 'b', 'c', 'd', 'e', 'f'];

export default async function ProyectosPage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Projects');
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
      path: '/proyectos',
    });
    sanityProjects = mergeLocalAndSanityProjects([]).map((p) => convertSanityProject(p, locale));
  }

  let githubProjects: Project[] = [];
  if (githubResult.status === 'fulfilled') {
    githubProjects = githubResult.value;
  } else {
    logger.error('Failed to fetch GitHub projects', githubResult.reason as Error, {
      service: 'projects',
      path: '/proyectos',
    });
  }

  // Combinar proyectos (Sanity primero, luego GitHub)
  const curatedKeys = new Set(
    sanityProjects.map((project) => project.title.trim().toLowerCase().replace(/\s+/g, '-'))
  );
  const dedupedGithubProjects = githubProjects.filter(
    (project) => !curatedKeys.has(project.title.trim().toLowerCase().replace(/\s+/g, '-'))
  );
  const allProjects = [...sanityProjects, ...dedupedGithubProjects];

  return (
    <>
      <InteriorHero
        variant="projects"
        title={t('heroTitle')}
        description={t('heroSubtitle', { count: allProjects.length })}
      />

      {/* Projects Section with Search */}
      <Section>
        <Container>
          <Suspense
            fallback={
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {SKELETON_PROJECTS.map((id) => (
                  <div key={id} className="overflow-hidden rounded-lg border bg-card">
                    <Skeleton className="h-48 rounded-none" />
                    <div className="space-y-3 p-6">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <div className="flex gap-1.5 pt-2">
                        <Skeleton className="h-5 w-14 rounded-full" />
                        <Skeleton className="h-5 w-14 rounded-full" />
                        <Skeleton className="h-5 w-14 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            }
          >
            <ProjectsClient projects={allProjects} />
          </Suspense>
        </Container>
      </Section>
    </>
  );
}
