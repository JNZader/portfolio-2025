'use client';

import { Check, Filter, Search, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/SearchInput';
import type { Project } from '@/lib/github/types';
import ProjectCard from './ProjectCard';

type ProjectSource = 'all' | 'sanity' | 'github';

/**
 * Chips de filtro (toggle): el seleccionado lleva un check desnudo (sin
 * círculo) + tinte primary suave; el no seleccionado se queda en gris muted.
 * Nada de filled-vs-outline a secas — se leía como "cargando" o como slider.
 */
const chipClassName = (selected: boolean) =>
  selected
    ? 'border-primary/50 bg-primary/10 text-primary hover:bg-primary/15'
    : 'text-muted-foreground hover:text-foreground';

interface ProjectsClientProps {
  projects: Project[];
}

export default function ProjectsClient({ projects }: Readonly<ProjectsClientProps>) {
  const t = useTranslations('Projects');
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

  // Debounced URL sync: the input stays instantly responsive (local state +
  // live filtering), but the router.replace side-effect is debounced so we
  // don't push a history/URL update on every keystroke. El debounce vive en
  // SearchInput; aquí solo recibimos el valor ya asentado.
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

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
        <SearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          onDebouncedChange={setDebouncedSearchQuery}
          placeholder={t('searchPlaceholder')}
          ariaLabel={t('searchAria')}
          clearAriaLabel={t('clearSearchAria')}
        />

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            aria-controls="project-filters"
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            {t('filters')}
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
              <X className="h-4 w-4" />
              {t('clear')}
            </Button>
          )}
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div
          id="project-filters"
          className="p-4 border border-border rounded-lg bg-muted/30 space-y-4"
        >
          {/* Filtro por fuente — aria-pressed + check: la selección no puede
              comunicarse solo por color */}
          <div>
            <h4 className="text-sm font-medium mb-2">{t('sourceHeading')}</h4>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { value: 'all', label: t('sourceAll') },
                  { value: 'sanity', label: t('sourceCurated') },
                  { value: 'github', label: t('sourceGithub') },
                ] as const
              ).map(({ value, label }) => {
                const isSelected = selectedSource === value;
                return (
                  <Button
                    key={value}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSourceChange(value)}
                    aria-pressed={isSelected}
                    className={chipClassName(isSelected)}
                  >
                    {isSelected && (
                      <Check
                        data-testid="filter-check"
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                    )}
                    {label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Filtro por tecnología */}
          <div>
            <h4 className="text-sm font-medium mb-2">{t('techHeading')}</h4>
            <div className="flex flex-wrap gap-2">
              {allTechs.map((tech) => {
                const isSelected = selectedTechs.includes(tech);
                return (
                  <Button
                    key={tech}
                    variant="outline"
                    size="sm"
                    onClick={() => toggleTech(tech)}
                    aria-pressed={isSelected}
                    className={`text-xs ${chipClassName(isSelected)}`}
                  >
                    {isSelected && (
                      <Check
                        data-testid="filter-check"
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                    )}
                    {tech}
                  </Button>
                );
              })}
            </div>
            {selectedTechs.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">{t('techHint')}</p>
            )}
          </div>
        </div>
      )}

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
