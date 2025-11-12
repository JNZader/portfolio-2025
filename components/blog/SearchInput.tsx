'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isValidSearchTerm } from '@/lib/utils/search';

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estado local del input
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  // Debounced value (500ms delay)
  const [debouncedSearch] = useDebounce(searchInput, 500);

  // Efecto para actualizar URL cuando cambia el debounced value
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const currentSearch = params.get('search') || '';

    // Solo actualizar si el valor debounced es diferente del actual
    if (debouncedSearch && isValidSearchTerm(debouncedSearch)) {
      if (currentSearch !== debouncedSearch) {
        params.set('search', debouncedSearch);
        params.delete('page'); // Reset a página 1
        const query = params.toString();
        router.push(`/blog${query ? `?${query}` : ''}`);
      }
    } else if (currentSearch) {
      // Solo borrar si había búsqueda activa
      params.delete('search');
      const query = params.toString();
      router.push(`/blog${query ? `?${query}` : ''}`);
    }
  }, [debouncedSearch, router, searchParams]);

  const handleClear = () => {
    setSearchInput('');
  };

  return (
    <div className="relative">
      <div className="relative">
        {/* Search icon */}
        <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-muted-foreground)]" />

        {/* Input */}
        <Input
          type="search"
          placeholder="Buscar artículos..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10 pr-10"
          aria-label="Buscar artículos"
        />

        {/* Clear button */}
        {searchInput && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
            aria-label="Limpiar búsqueda"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Helper text */}
      {searchInput.length > 0 && searchInput.length < 2 && (
        <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
          Escribe al menos 2 caracteres
        </p>
      )}
    </div>
  );
}

// Icons
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
    >
      <title>Buscar</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
    >
      <title>Limpiar</title>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
