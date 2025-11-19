import { ArrowLeft, ExternalLink, Star } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FaGithub } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import { getRepoReadme } from '@/lib/github/client';
import { getCachedFeaturedProjects } from '@/lib/github/queries';
import type { Project } from '@/lib/github/types';
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

/**
 * Convertir proyectos de Sanity al formato de la aplicación
 */
function convertSanityProject(sanityProject: SanityProject): Project {
  return {
    id: sanityProject._id,
    title: sanityProject.title,
    description: sanityProject.excerpt,
    tech: sanityProject.technologies || [],
    image: sanityProject.mainImage ? `/projects/${sanityProject.slug.current}.jpg` : undefined,
    url: sanityProject.demoUrl || sanityProject.githubUrl || '#',
    github: sanityProject.githubUrl,
    demo: sanityProject.demoUrl,
    source: 'sanity',
    featured: sanityProject.featured,
  };
}

async function getAllProjects(): Promise<Project[]> {
  // Obtener proyectos de Sanity
  let sanityProjects: Project[] = [];
  try {
    const projects = await sanityFetch<SanityProject[]>({
      query: projectsQuery,
      tags: ['project'],
    });
    sanityProjects = projects.map(convertSanityProject);
  } catch (error) {
    console.error('Failed to fetch Sanity projects:', error);
  }

  // Obtener proyectos de GitHub
  let githubProjects: Project[] = [];
  try {
    githubProjects = await getCachedFeaturedProjects();
  } catch (error) {
    console.error('Failed to fetch GitHub projects:', error);
  }

  return [...sanityProjects, ...githubProjects];
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

export default async function ProjectPage({ params }: ProjectPageProps) {
  const resolvedParams = await params;
  const projects = await getAllProjects();
  const project = projects.find((p) => p.id === resolvedParams.id);

  if (!project) {
    notFound();
  }

  // Obtener README si es un proyecto de GitHub
  let readme: string | null = null;
  if (project.source === 'github' && project.github) {
    // Extraer owner y repo de la URL de GitHub
    const match = project.github.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (match) {
      const [, owner, repo] = match;
      readme = await getRepoReadme(owner, repo);
    }
  }

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
                      Ver Código
                    </a>
                  </Button>
                )}
              </div>
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
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <h2>Descripción del Proyecto</h2>
                  {readme ? (
                    <ReactMarkdown
                      components={{
                        // Evitar renderizar imágenes muy grandes
                        img: ({ alt, ...props }) => (
                          // biome-ignore lint/performance/noImgElement: external images from README need native img
                          <img
                            {...props}
                            alt={alt || ''}
                            className="max-w-full h-auto rounded-lg"
                            loading="lazy"
                          />
                        ),
                        // Links externos
                        a: ({ ...props }) => (
                          <a {...props} target="_blank" rel="noopener noreferrer" />
                        ),
                      }}
                    >
                      {readme}
                    </ReactMarkdown>
                  ) : (
                    <p>{project.description}</p>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Technologies */}
                <div className="bg-card p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-semibold mb-4">Tecnologías</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
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
                        Repositorio en GitHub
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
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
