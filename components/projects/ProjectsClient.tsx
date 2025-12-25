'use client';

import { Filter, Search, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Project } from '@/lib/github/types';
import ProjectCard from './ProjectCard';

type ProjectSource = 'all' | 'sanity' | 'github';

interface ProjectsClientProps {
  projects: Project[];
}

export default function ProjectsClient({ projects }: Readonly<ProjectsClientProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Estado para búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '');
  const [selectedTechs, setSelectedTechs] = useState<string[]>(
    searchParams.get('tech')?.split(',').filter(Boolean) ?? []
  );
  const [selectedSource, setSelectedSource] = useState<ProjectSource>(
    (searchParams.get('source') as ProjectSource) ?? 'all'
  );
  const [showFilters, setShowFilters] = useState(false);

  // Extraer todas las tecnologías únicas
  const allTechs = useMemo(() => {
    const techSet = new Set<string>();
    for (const project of projects) {
      for (const tech of project.tech) {
        techSet.add(tech);
      }
    }
    return Array.from(techSet).sort((a, b) => a.localeCompare(b));
  }, [projects]);

  // Filtrar proyectos
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Filtro de búsqueda
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tech.some((tech) => tech.toLowerCase().includes(searchQuery.toLowerCase()));

      // Filtro de tecnologías
      const matchesTech =
        selectedTechs.length === 0 || selectedTechs.some((tech) => project.tech.includes(tech));

      // Filtro de fuente
      const matchesSource = selectedSource === 'all' || project.source === selectedSource;

      return matchesSearch && matchesTech && matchesSource;
    });
  }, [projects, searchQuery, selectedTechs, selectedSource]);

  // Actualizar URL params
  const updateURL = (query: string, techs: string[], source: ProjectSource) => {
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

  const handleSourceChange = (source: ProjectSource) => {
    setSelectedSource(source);
    updateURL(searchQuery, selectedTechs, source);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTechs([]);
    setSelectedSource('all');
    setShowFilters(false);
    router.replace(pathname);
  };

  const hasActiveFilters = searchQuery || selectedTechs.length > 0 || selectedSource !== 'all';

  const activeFiltersCount = [
    searchQuery && 1,
    selectedTechs.length,
    selectedSource !== 'all' && 1,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar proyectos por nombre, tecnología, descripción..."
            className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
              <X className="h-4 w-4" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="p-4 border border-border rounded-lg bg-muted/30 space-y-4">
          {/* Filtro por fuente */}
          <div>
            <h4 className="text-sm font-medium mb-2">Fuente</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedSource === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSourceChange('all')}
              >
                Todos
              </Button>
              <Button
                variant={selectedSource === 'sanity' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSourceChange('sanity')}
              >
                Curados
              </Button>
              <Button
                variant={selectedSource === 'github' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSourceChange('github')}
              >
                GitHub
              </Button>
            </div>
          </div>

          {/* Filtro por tecnología */}
          <div>
            <h4 className="text-sm font-medium mb-2">Tecnologías</h4>
            <div className="flex flex-wrap gap-2">
              {allTechs.map((tech) => (
                <Button
                  key={tech}
                  variant={selectedTechs.includes(tech) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleTech(tech)}
                  className="text-xs"
                >
                  {tech}
                  {selectedTechs.includes(tech) && <X className="ml-1 h-3 w-3" />}
                </Button>
              ))}
            </div>
            {selectedTechs.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Mostrando proyectos que usan alguna de las tecnologías seleccionadas
              </p>
            )}
          </div>
        </div>
      )}

      {/* Resultados */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          {filteredProjects.length} de {projects.length} proyectos
          {hasActiveFilters && ' (filtrados)'}
        </p>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1">
            {searchQuery && (
              <Badge variant="outline" className="text-xs">
                Búsqueda: &ldquo;{searchQuery}&rdquo;
              </Badge>
            )}
            {selectedSource !== 'all' && (
              <Badge variant="outline" className="text-xs">
                {selectedSource === 'sanity' ? 'Curados' : 'GitHub'}
              </Badge>
            )}
            {selectedTechs.map((tech) => (
              <Badge key={tech} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
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
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No se encontraron proyectos</h3>
          <p className="text-muted-foreground mb-4">Intenta ajustar tus filtros o búsqueda</p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Limpiar todos los filtros
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
