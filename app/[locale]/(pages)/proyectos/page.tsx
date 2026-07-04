import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { RevealOnScroll } from '@/components/animations';
import ProjectsClient from '@/components/projects/ProjectsClient';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
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
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-tertiary/5" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
        </div>

        {/* Animated blobs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-tertiary/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '1s' }}
        />

        {/* Dot pattern overlay */}
        <div className="absolute inset-0 -z-10 opacity-[0.02] dark:opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <RevealOnScroll>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('heroTitle')}</h1>
              <p className="text-xl text-muted-foreground">
                {t('heroSubtitle', { count: allProjects.length })}
              </p>
            </RevealOnScroll>
          </div>
        </Container>
      </section>

      {/* Projects Section with Search */}
      <Section>
        <Container>
          <Suspense
            fallback={
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {SKELETON_PROJECTS.map((id) => (
                  <div key={id} className="rounded-lg border bg-card h-[420px] animate-pulse" />
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
