'use client';

import { Filter, Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { isValidSearchTerm } from '@/lib/utils/search';
import type { Category } from '@/types/sanity';

interface BlogFiltersProps {
  categories: Category[];
  totalPosts: number;
}

export function BlogFilters({ categories, totalPosts }: BlogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estado local
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  const [debouncedSearch] = useDebounce(searchInput, 500);

  // Valores actuales de URL
  const currentCategory = searchParams.get('category');
  const currentSearch = searchParams.get('search');

  // Efecto para actualizar URL cuando cambia el debounced search
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const urlSearch = params.get('search') || '';

    if (debouncedSearch && isValidSearchTerm(debouncedSearch)) {
      if (urlSearch !== debouncedSearch) {
        params.set('search', debouncedSearch);
        params.delete('page');
        router.push(`/blog?${params.toString()}`);
      }
    } else if (urlSearch) {
      params.delete('search');
      const query = params.toString();
      router.push(`/blog${query ? `?${query}` : ''}`);
    }
  }, [debouncedSearch, router, searchParams]);

  const handleCategoryClick = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (slug) {
      params.set('category', slug);
      params.delete('page');
    } else {
      params.delete('category');
      params.delete('page');
    }

    const query = params.toString();
    router.push(`/blog${query ? `?${query}` : ''}`);
  };

  const clearFilters = () => {
    setSearchInput('');
    setShowFilters(false);
    router.push('/blog');
  };

  const hasActiveFilters = currentSearch || currentCategory;

  const activeFiltersCount = [currentSearch && 1, currentCategory && 1].filter(Boolean).length;

  const activeCategory = categories.find((cat) => cat.slug.current === currentCategory);

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar artículos por título, contenido, tags..."
            className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
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

      {/* Helper text para búsqueda */}
      {searchInput.length > 0 && searchInput.length < 2 && (
        <p className="text-xs text-muted-foreground">Escribe al menos 2 caracteres</p>
      )}

      {/* Panel de filtros */}
      {showFilters && (
        <div className="p-4 border border-border rounded-lg bg-muted/30 space-y-4">
          {/* Filtro por categoría */}
          <div>
            <h4 className="text-sm font-medium mb-2">Categoría</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={!currentCategory ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryClick(null)}
              >
                Todas
              </Button>
              {categories.map((category) => (
                <Button
                  key={category._id}
                  variant={currentCategory === category.slug.current ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryClick(category.slug.current)}
                >
                  {category.title}
                  {category.postCount !== undefined && (
                    <span className="ml-1 text-xs opacity-70">({category.postCount})</span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Resultados */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          {totalPosts} artículo{totalPosts !== 1 ? 's' : ''}
          {hasActiveFilters && ' (filtrados)'}
        </p>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1">
            {currentSearch && (
              <Badge variant="outline" className="text-xs">
                Búsqueda: &ldquo;{currentSearch}&rdquo;
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
