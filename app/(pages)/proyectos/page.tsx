import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RevealOnScroll } from '@/components/animations';
import ProjectsClient from '@/components/projects/ProjectsClient';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import { getCachedFeaturedProjects } from '@/lib/github/queries';
import type { Project } from '@/lib/github/types';
import { sanityFetch } from '@/sanity/lib/client';
import { projectsQuery } from '@/sanity/lib/queries';
import type { Project as SanityProject } from '@/types/sanity';

export const metadata: Metadata = {
  title: 'Proyectos',
  description: 'Explora mis proyectos y trabajos recientes con búsqueda interactiva',
};

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

export default async function ProyectosPage() {
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

  // Obtener proyectos de GitHub (con fallback)
  let githubProjects: Project[] = [];
  try {
    githubProjects = await getCachedFeaturedProjects();
  } catch (error) {
    console.error('Failed to fetch GitHub projects:', error);
  }

  // Combinar proyectos (Sanity primero, luego GitHub)
  const allProjects = [...sanityProjects, ...githubProjects];

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
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Mis Proyectos</h1>
              <p className="text-xl text-muted-foreground">
                Una colección de {allProjects.length} aplicaciones web, herramientas y experimentos
                que demuestran mis habilidades y experiencia en desarrollo.
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
                {['a', 'b', 'c', 'd', 'e', 'f'].map((id) => (
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
