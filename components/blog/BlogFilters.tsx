'use client';

import { Filter, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useState, useTransition } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/SearchInput';
import { useRouter } from '@/i18n/navigation';
import { isValidSearchTerm } from '@/lib/utils/search';
import type { Category } from '@/types/sanity';

interface BlogFiltersProps {
  categories: Category[];
  totalPosts: number;
}

export function BlogFilters({ categories, totalPosts }: Readonly<BlogFiltersProps>) {
  const router = useRouter();
  const t = useTranslations('Blog');
  const searchParams = useSearchParams();
  const filtersPanelId = useId();
  const [isPending, startTransition] = useTransition();

  // Estado local
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
  const [showFilters, setShowFilters] = useState(false);

  // Valor debounceado emitido por SearchInput (URL sync)
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('search') ?? '');

  // Valores actuales de URL
  const currentCategory = searchParams.get('category');
  const currentSearch = searchParams.get('search');

  // Efecto para actualizar URL cuando cambia el debounced search
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const urlSearch = params.get('search') ?? '';

    if (debouncedSearch && isValidSearchTerm(debouncedSearch)) {
      if (urlSearch === debouncedSearch) {
        // No changes needed
      } else {
        params.set('search', debouncedSearch);
        params.delete('page');
        startTransition(() => {
          router.push(`/blog?${params.toString()}`);
        });
      }
    } else if (urlSearch) {
      params.delete('search');
      const query = params.toString();
      const url = query ? `/blog?${query}` : '/blog';
      startTransition(() => {
        router.push(url);
      });
    }
  }, [debouncedSearch, router, searchParams]);

  const handleCategoryClick = useCallback(
    (slug: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (slug) {
        params.set('category', slug);
        params.delete('page');
      } else {
        params.delete('category');
        params.delete('page');
      }

      const query = params.toString();
      const url = query ? `/blog?${query}` : '/blog';
      startTransition(() => {
        router.push(url);
      });
    },
    [searchParams, router]
  );

  const clearFilters = useCallback(() => {
    setSearchInput('');
    setShowFilters(false);
    startTransition(() => {
      router.push('/blog');
    });
  }, [router]);

  const hasActiveFilters = currentSearch ?? currentCategory;

  const activeFiltersCount = [currentSearch && 1, currentCategory && 1].filter(Boolean).length;

  const activeCategory = categories.find((cat) => cat.slug.current === currentCategory);

  return (
    <div className={`space-y-4 ${isPending ? 'opacity-70' : ''}`}>
      {/* Barra de búsqueda */}
      <search className="flex flex-col sm:flex-row gap-4">
        <SearchInput
          id="blog-search"
          value={searchInput}
          onChange={setSearchInput}
          onDebouncedChange={setDebouncedSearch}
          placeholder={t('searchPlaceholder')}
          ariaLabel={t('searchLabel')}
          clearAriaLabel={t('clearSearch')}
        />

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
            aria-expanded={showFilters}
            aria-controls={filtersPanelId}
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
      </search>

      {/* Helper text para búsqueda */}
      {searchInput.length > 0 && searchInput.length < 2 && (
        <p className="text-xs text-muted-foreground">{t('minimumChars')}</p>
      )}

      {/* Panel de filtros */}
      {showFilters && (
        <section
          id={filtersPanelId}
          className="p-4 border border-border rounded-lg bg-muted/30 space-y-4"
          aria-label={t('searchFilters')}
        >
          {/* Filtro por categoría */}
          <fieldset className="border-0 p-0 m-0">
            <legend className="text-sm font-medium mb-2 block">{t('category')}</legend>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={currentCategory ? 'outline' : 'default'}
                size="sm"
                onClick={() => handleCategoryClick(null)}
                aria-pressed={!currentCategory}
              >
                {t('all')}
              </Button>
              {categories.map((category) => {
                const isSelected = currentCategory === category.slug.current;
                return (
                  <Button
                    key={category._id}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleCategoryClick(category.slug.current)}
                    aria-pressed={isSelected}
                  >
                    {category.title}
                    {category.postCount !== undefined && (
                      <span className="ml-1 text-xs opacity-70">({category.postCount})</span>
                    )}
                  </Button>
                );
              })}
            </div>
          </fieldset>
        </section>
      )}

      {/* Resultados */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <output aria-live="polite" className="contents">
          {t('results', { count: totalPosts })}
          {hasActiveFilters && ` (${t('filtered')})`}
        </output>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1">
            {currentSearch && (
              <Badge variant="outline" className="text-xs">
                {t('searchBadge', { search: currentSearch })}
              </Badge>
            )}
            {activeCategory && (
              <Badge variant="outline" className="text-xs">
                {activeCategory.title}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
