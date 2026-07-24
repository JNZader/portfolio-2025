'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useDebounce } from 'use-debounce';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  /** Controlled value (instant, local state in the consumer). */
  value: string;
  /** Called on every keystroke. */
  onChange: (value: string) => void;
  /** Called once per settled value after `debounceMs` (URL sync, etc). */
  onDebouncedChange?: (value: string) => void;
  debounceMs?: number;
  placeholder: string;
  ariaLabel: string;
  clearAriaLabel: string;
  id?: string;
  className?: string;
}

/**
 * Shared search field: leading icon, h-12 input, 44px clear button and
 * built-in debounce. Labels/placeholders are provided by the consumer
 * via next-intl so each namespace keeps its own copy.
 */
export function SearchInput({
  value,
  onChange,
  onDebouncedChange,
  debounceMs = 500,
  placeholder,
  ariaLabel,
  clearAriaLabel,
  id,
  className,
}: Readonly<SearchInputProps>) {
  const [debouncedValue] = useDebounce(value, debounceMs);
  const lastEmittedRef = useRef(value);

  // Solo emitir cuando el valor debounceado difiere del último emitido;
  // evita disparar el callback en el montaje con el valor inicial de la URL.
  useEffect(() => {
    if (!onDebouncedChange) return;
    if (debouncedValue === lastEmittedRef.current) return;
    lastEmittedRef.current = debouncedValue;
    onDebouncedChange(debouncedValue);
  }, [debouncedValue, onDebouncedChange]);

  return (
    <div className={cn('relative flex-1', className)}>
      <Search
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        id={id}
        name="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="pl-10 pr-12"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-0.5 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={clearAriaLabel}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
