'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { Project } from '@/lib/github/types';
import ProjectCard from './ProjectCard';

interface ProjectsClientProps {
  projects: Project[];
}

export default function ProjectsClient({ projects }: ProjectsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Estado para búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedTechs, setSelectedTechs] = useState<string[]>(
    searchParams.get('tech')?.split(',').filter(Boolean) || []
  );
  const [selectedSource, setSelectedSource] = useState<'all' | 'sanity' | 'github'>(
    (searchParams.get('source') as 'all' | 'sanity' | 'github') || 'all'
  );

  // Extraer todas las tecnologías únicas
  const allTechs = useMemo(() => {
    const techSet = new Set<string>();
    for (const project of projects) {
      for (const tech of project.tech) {
        techSet.add(tech);
      }
    }
    return Array.from(techSet).sort();
  }, [projects]);

  // Filtrar proyectos
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Filtro de búsqueda
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Filtro de tecnologías
      const matchesTech =
        selectedTechs.length === 0 || selectedTechs.some((tech) => project.tech.includes(tech));

      // Filtro de fuente
      const matchesSource = selectedSource === 'all' || project.source === selectedSource;

      return matchesSearch && matchesTech && matchesSource;
    });
  }, [projects, searchQuery, selectedTechs, selectedSource]);

  // Actualizar URL params (opcional)
  const updateURL = (query: string, techs: string[], source: 'all' | 'sanity' | 'github') => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (techs.length > 0) params.set('tech', techs.join(','));
    if (source !== 'all') params.set('source', source);

    const newURL = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newURL, { scroll: false });
  };

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    updateURL(value, selectedTechs, selectedSource);
  };

  const toggleTech = (tech: string) => {
    const newTechs = selectedTechs.includes(tech)
      ? selectedTechs.filter((t) => t !== tech)
      : [...selectedTechs, tech];
    setSelectedTechs(newTechs);
    updateURL(searchQuery, newTechs, selectedSource);
  };

  const handleSourceChange = (source: 'all' | 'sanity' | 'github') => {
    setSelectedSource(source);
    updateURL(searchQuery, selectedTechs, source);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTechs([]);
    setSelectedSource('all');
    router.replace(pathname);
  };

  const hasActiveFilters = searchQuery || selectedTechs.length > 0 || selectedSource !== 'all';

  return (
    <div>
      {/* Barra de búsqueda */}
      <div className="mb-8">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Buscar proyectos por título o descripción..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Limpiar búsqueda"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-8 space-y-4">
        {/* Filtro por fuente */}
        <div>
          <h3 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Fuente</h3>
          <div className="flex flex-wrap gap-2">
            {(['all', 'sanity', 'github'] as const).map((source) => (
              <button
                type="button"
                key={source}
                onClick={() => handleSourceChange(source)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  selectedSource === source
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {source === 'all' ? 'Todos' : source === 'sanity' ? 'Curados' : 'GitHub'}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro por tecnología */}
        <div>
          <h3 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">Tecnologías</h3>
          <div className="flex flex-wrap gap-2">
            {allTechs.map((tech) => (
              <button
                type="button"
                key={tech}
                onClick={() => toggleTech(tech)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  selectedTechs.includes(tech)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>

        {/* Botón limpiar filtros */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredProjects.length} {filteredProjects.length === 1 ? 'proyecto' : 'proyectos'}{' '}
              encontrado{filteredProjects.length === 1 ? '' : 's'}
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Grid de proyectos */}
      {filteredProjects.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        // Empty state
        <div className="text-center py-12">
          <svg
            className="mx-auto w-16 h-16 text-gray-300 dark:text-gray-700 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
            No se encontraron proyectos
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Intenta ajustar tus filtros o búsqueda
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Limpiar todos los filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}
