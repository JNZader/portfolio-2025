import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RevealOnScroll } from '@/components/animations';
import ProjectsClient from '@/components/projects/ProjectsClient';
import Container from '@/components/ui/Container';
import Section, { SECTION_BG } from '@/components/ui/Section';
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
      <Section background={SECTION_BG.GRADIENT} spacing="xl">
        <Container>
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
      </Section>

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
