import type { Metadata } from 'next';
import { Suspense } from 'react';
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
    <Section>
      <Container>
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Proyectos</h1>
          <p className="text-xl text-foreground/80">
            Explora {allProjects.length} proyectos con búsqueda y filtros interactivos
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-12">Cargando proyectos...</div>}>
          <ProjectsClient projects={allProjects} />
        </Suspense>
      </Container>
    </Section>
  );
}
