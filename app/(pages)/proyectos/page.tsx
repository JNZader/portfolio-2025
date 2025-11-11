import type { Metadata } from 'next';
import { Suspense } from 'react';
import ProjectsClient from '@/components/projects/ProjectsClient';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import { getCachedFeaturedProjects } from '@/lib/github/queries';
import type { Project } from '@/lib/github/types';

export const metadata: Metadata = {
  title: 'Proyectos',
  description: 'Explora mis proyectos y trabajos recientes con búsqueda interactiva',
};

// ISR: Revalidar cada 1 hora
export const revalidate = 3600;

// Proyectos hardcodeados (o desde Sanity si ya tienes configurado)
const hardcodedProjects: Project[] = [
  {
    id: 'portfolio-2025',
    title: 'Portfolio 2025',
    description: 'Portfolio personal con Next.js 16, React 19 y TypeScript',
    tech: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    image: '/projects/portfolio.jpg',
    url: 'https://portfolio.com',
    github: 'https://github.com/usuario/portfolio-2025',
    demo: 'https://portfolio.com',
    source: 'sanity',
    featured: true,
  },
  {
    id: 'ecommerce-app',
    title: 'E-commerce App',
    description: 'Tienda online con carrito de compras y pasarela de pago',
    tech: ['Next.js', 'Stripe', 'PostgreSQL', 'Prisma'],
    image: '/projects/ecommerce.jpg',
    url: 'https://shop.com',
    github: 'https://github.com/usuario/ecommerce',
    demo: 'https://shop.com',
    source: 'sanity',
    featured: true,
  },
  // ... más proyectos
];

export default async function ProyectosPage() {
  // Obtener proyectos de GitHub (con fallback)
  let githubProjects: Project[] = [];
  try {
    githubProjects = await getCachedFeaturedProjects();
  } catch (error) {
    console.error('Failed to fetch GitHub projects:', error);
    // Fallback: continuar sin proyectos de GitHub
  }

  // Combinar proyectos
  const allProjects = [...hardcodedProjects, ...githubProjects];

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
