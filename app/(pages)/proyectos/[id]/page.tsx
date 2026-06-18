import { ArrowLeft, ExternalLink, Star } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FaGithub } from 'react-icons/fa';
import { PortableTextRenderer } from '@/components/blog/PortableTextRenderer';
import { MarkdownContent } from '@/components/markdown/MarkdownContent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import { mergeLocalAndSanityProjects } from '@/lib/data/projects';
import { getRepoReadme } from '@/lib/github/client';
import { getCachedFeaturedProjects } from '@/lib/github/queries';
import type { Project } from '@/lib/github/types';
import { logger } from '@/lib/monitoring/logger';
import { convertSanityProject } from '@/lib/utils/project';
import { getTechIcon } from '@/lib/utils/tech-icons';
import { sanityFetch } from '@/sanity/lib/client';
import { projectsQuery } from '@/sanity/lib/queries';
import type { Project as SanityProject } from '@/types/sanity';

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

// ISR: Revalidar cada 1 hora
export const revalidate = 3600;

async function getAllProjects(): Promise<Project[]> {
  // Obtener proyectos de Sanity
  let sanityProjects: Project[] = [];
  try {
    const projects = await sanityFetch<SanityProject[]>({
      query: projectsQuery,
      tags: ['project'],
    });
    sanityProjects = mergeLocalAndSanityProjects(projects).map(convertSanityProject);
  } catch (error) {
    logger.error('Failed to fetch Sanity projects', error as Error, {
      service: 'projects',
      path: '/proyectos/[id]',
    });
    sanityProjects = mergeLocalAndSanityProjects([]).map(convertSanityProject);
  }

  // Obtener proyectos de GitHub
  let githubProjects: Project[] = [];
  try {
    githubProjects = await getCachedFeaturedProjects();
  } catch (error) {
    logger.error('Failed to fetch GitHub projects', error as Error, {
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
}

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
      .map(convertSanityProject)
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
  const resolvedParams = await params;
  const projects = await getAllProjects();
  const project = projects.find((p) => p.id === resolvedParams.id);

  if (!project) {
    return {
      title: 'Proyecto no encontrado',
    };
  }

  return {
    title: project.title,
    description: project.description,
  };
}

export default async function ProjectPage({ params }: Readonly<ProjectPageProps>) {
  const resolvedParams = await params;
  const projects = await getAllProjects();
  const project = projects.find((p) => p.id === resolvedParams.id);

  if (!project) {
    notFound();
  }

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
      readme = await getRepoReadme(owner, repo);
    }
  }

  const hasLinks = Boolean(project.demo || project.github);

  return (
    <>
      {/* Back Button */}
      <div className="border-b border-border">
        <Container>
          <div className="py-4">
            <Link
              href="/proyectos"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a proyectos
            </Link>
          </div>
        </Container>
      </div>

      {/* Project Hero */}
      <Section>
        <Container>
          <div className="max-w-4xl mx-auto">
            {/* Project Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="outline" className="text-sm">
                  {project.source === 'github' ? 'GitHub' : 'Curado'}
                </Badge>
                {project.featured && (
                  <Badge variant="default" className="text-sm bg-primary">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Destacado
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4">{project.title}</h1>

              <p className="text-xl text-muted-foreground mb-6">{project.description}</p>

              {/* Stars (for GitHub projects) */}
              {project.source === 'github' && project.stars !== undefined && project.stars > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span>{project.stars} estrellas</span>
                </div>
              )}

              {/* Action Buttons */}
              {hasLinks && (
                <div className="flex flex-wrap gap-4">
                  {project.demo && (
                    <Button asChild>
                      <a href={project.demo} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver Demo
                      </a>
                    </Button>
                  )}
                  {project.github && (
                    <Button variant="outline" asChild>
                      <a href={project.github} target="_blank" rel="noopener noreferrer">
                        <FaGithub className="mr-2 h-4 w-4" />
                        {project.repoIsOrigin ? 'Ver Origen' : 'Ver Código'}
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Project Image */}
            {project.image && (
              <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-12 bg-muted">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Project Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold mb-6">Descripción del Proyecto</h2>
                {project.body && project.body.length > 0 ? (
                  <PortableTextRenderer value={project.body} />
                ) : readme ? (
                  <MarkdownContent content={readme} repoInfo={repoInfo} />
                ) : (
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-muted-foreground leading-relaxed">{project.description}</p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Technologies */}
                <div className="bg-card p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-semibold mb-4">Tecnologías</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech) => {
                      const { icon: TechIcon, color } = getTechIcon(tech);
                      return (
                        <span
                          key={tech}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs rounded-full transition-all duration-200 hover:scale-105"
                        >
                          <TechIcon className={`w-3.5 h-3.5 ${color}`} />
                          {tech}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Project Info */}
                <div className="bg-card p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-semibold mb-4">Información</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Fuente:</span>
                      <span className="ml-2 text-muted-foreground">
                        {project.source === 'github' ? 'GitHub' : 'Curado'}
                      </span>
                    </div>
                    {project.featured && (
                      <div>
                        <span className="font-medium">Estado:</span>
                        <span className="ml-2 text-muted-foreground">Destacado</span>
                      </div>
                    )}
                    {project.stars !== undefined && project.stars > 0 && (
                      <div>
                        <span className="font-medium">Estrellas:</span>
                        <span className="ml-2 text-muted-foreground">{project.stars}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Links */}
                {hasLinks && (
                  <div className="bg-card p-6 rounded-lg border border-border">
                    <h3 className="text-lg font-semibold mb-4">Enlaces</h3>
                    <div className="space-y-3">
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                        >
                          <FaGithub className="h-4 w-4" />
                          {project.repoIsOrigin ? 'Repositorio de origen' : 'Repositorio en GitHub'}
                        </a>
                      )}
                      {project.demo && (
                        <a
                          href={project.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Demo en vivo
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
