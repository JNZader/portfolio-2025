'use client';

import { Search, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/SearchInput';
import type { Project } from '@/lib/github/types';
import ProjectCard from './ProjectCard';
import { type ProjectSource, SourceSegmentedControl } from './SourceSegmentedControl';
import { TechFilterBar } from './TechFilterBar';

interface ProjectsClientProps {
  projects: Project[];
}

const PROJECT_SOURCES: readonly ProjectSource[] = ['all', 'sanity', 'github'];

/**
 * Composition root: state + URL sync + the always-visible filter layout
 * (search, source segmented control, tech chip bar). No toggle panel —
 * every filter dimension is visible on initial render.
 */
export default function ProjectsClient({ projects }: Readonly<ProjectsClientProps>) {
  const t = useTranslations('Projects');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Validate the hydrated source param: a corrupted value (e.g.
  // ?source=banana) falls back to 'all' so every segment keeps a checked
  // state and the radiogroup stays keyboard-reachable (roving tabindex).
  const rawSource = searchParams.get('source') as ProjectSource | null;
  const initialSource: ProjectSource =
    rawSource && PROJECT_SOURCES.includes(rawSource) ? rawSource : 'all';

  // Estado para búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '');
  const [selectedTechs, setSelectedTechs] = useState<string[]>(
    searchParams.get('tech')?.split(',').filter(Boolean) ?? []
  );
  const [selectedSource, setSelectedSource] = useState<ProjectSource>(initialSource);

  // Debounced URL sync: the input stays instantly responsive (local state +
  // live filtering), but the router.replace side-effect is debounced so we
  // don't push a history/URL update on every keystroke. El debounce vive en
  // SearchInput; aquí solo recibimos el valor ya asentado.
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

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

  // Sincroniza la URL con la búsqueda debounceada (no en cada keystroke).
  // biome-ignore lint/correctness/useExhaustiveDependencies: solo debe re-ejecutarse cuando cambia el valor debounceado, no en cada render por updateURL/selectedTechs/selectedSource
  useEffect(() => {
    updateURL(debouncedSearchQuery, selectedTechs, selectedSource);
  }, [debouncedSearchQuery]);

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
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
    router.replace(pathname);
  };

  const hasActiveFilters = searchQuery || selectedTechs.length > 0 || selectedSource !== 'all';

  return (
    <div className="space-y-6">
      {/* Filtros siempre visibles: búsqueda + fuente + tecnologías */}
      <div data-region="filter" className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div data-region="search" className="min-w-0 flex-1">
            <SearchInput
              value={searchQuery}
              onChange={handleSearchChange}
              onDebouncedChange={setDebouncedSearchQuery}
              placeholder={t('searchPlaceholder')}
              ariaLabel={t('searchAria')}
              clearAriaLabel={t('clearSearchAria')}
            />
          </div>

          <SourceSegmentedControl value={selectedSource} onChange={handleSourceChange} />

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
              <X className="h-4 w-4" />
              {t('clear')}
            </Button>
          )}
        </div>

        <TechFilterBar
          projects={projects}
          selectedTechs={selectedTechs}
          onToggleTech={toggleTech}
        />
      </div>

      {/* Resultados — live region: anuncia a SR el conteo al filtrar */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p aria-live="polite">
          {t('count', { filtered: filteredProjects.length, total: projects.length })}
          {hasActiveFilters && t('filteredSuffix')}
        </p>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1">
            {searchQuery && (
              <Badge variant="outline" className="text-xs">
                {t('searchBadge', { query: searchQuery })}
              </Badge>
            )}
            {selectedSource !== 'all' && (
              <Badge variant="outline" className="text-xs">
                {selectedSource === 'sanity' ? t('sourceCurated') : t('sourceGithub')}
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
          {filteredProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} priority={index < 3} />
          ))}
        </div>
      ) : (
        // Empty state
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{t('emptyTitle')}</h3>
          <p className="text-muted-foreground mb-4">{t('emptyHint')}</p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              {t('clearAll')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
