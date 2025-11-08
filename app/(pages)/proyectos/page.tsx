import type { Metadata } from 'next';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';

export const metadata: Metadata = {
  title: 'Proyectos',
  description: 'Explora mis proyectos y trabajos recientes',
};

const projects = [
  {
    id: 1,
    title: 'E-commerce Platform',
    description: 'Plataforma de comercio electrónico con Next.js y Stripe',
    tech: ['Next.js', 'TypeScript', 'Stripe', 'Tailwind'],
    image: '/placeholder-project.jpg',
    github: 'https://github.com/usuario/proyecto',
    demo: 'https://demo.com',
  },
  {
    id: 2,
    title: 'Dashboard Analytics',
    description: 'Dashboard de analytics en tiempo real con React',
    tech: ['React', 'D3.js', 'Node.js', 'PostgreSQL'],
    image: '/placeholder-project.jpg',
    github: 'https://github.com/usuario/proyecto',
    demo: 'https://demo.com',
  },
  {
    id: 3,
    title: 'Task Manager',
    description: 'Gestor de tareas colaborativo con tiempo real',
    tech: ['Next.js', 'Socket.io', 'Prisma', 'Tailwind'],
    image: '/placeholder-project.jpg',
    github: 'https://github.com/usuario/proyecto',
    demo: 'https://demo.com',
  },
];

export default function ProyectosPage() {
  return (
    <Section>
      <Container>
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Proyectos</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Explora una selección de mis trabajos más recientes
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.id}
              className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700"
            >
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <span className="text-gray-400 dark:text-gray-500">Imagen del proyecto</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {project.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{project.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex gap-4">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  >
                    GitHub →
                  </a>
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    Demo →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
