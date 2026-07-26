'use client';

import * as Popover from '@radix-ui/react-popover';
import { Check, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { filterChipBaseClasses, filterChipUnselectedClasses } from '@/components/ui/FilterChip';
import { cn } from '@/lib/utils';

interface TechDropdownProps {
  /** Non-visible techs (already sorted with localeCompare). */
  remainingTechs: string[];
  selectedTechs: string[];
  onToggleTech: (tech: string) => void;
}

const optionId = (tech: string) => `tech-option-${tech}`;

/**
 * Overflow dropdown for the tech bar: a Radix popover anchored to the
 * "More" trigger with a typeahead filter input and a multiselect listbox.
 * Focus stays in the input while arrows move aria-activedescendant;
 * Enter/Space toggles without closing; Esc/outside-click close via Radix
 * and return focus to the trigger.
 */
export function TechDropdown({
  remainingTechs,
  selectedTechs,
  onToggleTech,
}: Readonly<TechDropdownProps>) {
  const t = useTranslations('Projects');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeTech, setActiveTech] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = 'tech-dropdown-listbox';

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      // Typeahead is per-open: a reopened dropdown starts unfiltered.
      setQuery('');
      setActiveTech(null);
    }
  };

  const normalizedQuery = query.trim().toLowerCase();
  const matches = normalizedQuery
    ? remainingTechs.filter((tech) => tech.toLowerCase().includes(normalizedQuery))
    : remainingTechs;
  const active = activeTech && matches.includes(activeTech) ? activeTech : (matches[0] ?? null);

  const moveActive = (direction: 1 | -1) => {
    if (matches.length === 0) return;
    const index = active ? matches.indexOf(active) : 0;
    const next = (index + direction + matches.length) % matches.length;
    setActiveTech(matches[next]);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveActive(-1);
        break;
      case 'Enter':
      case ' ':
        // Toggle the active option without closing (multiselect listbox).
        if (active) {
          event.preventDefault();
          onToggleTech(active);
        }
        break;
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-label={t('techMoreAria', { count: remainingTechs.length })}
          className={cn(filterChipBaseClasses, filterChipUnselectedClasses)}
        >
          {t('techMore', { count: remainingTechs.length })}
          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={4}
          collisionPadding={8}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
          className="z-50 max-h-80 w-72 overflow-y-auto rounded-md border border-border bg-popover p-2 shadow-md"
        >
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            aria-label={t('techSearchPlaceholder')}
            placeholder={t('techSearchPlaceholder')}
            className="mb-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          />
          {matches.length > 0 ? (
            <div
              id={listboxId}
              role="listbox"
              aria-multiselectable="true"
              aria-activedescendant={active ? optionId(active) : undefined}
              tabIndex={-1}
              className="space-y-1"
            >
              {matches.map((tech) => {
                const selected = selectedTechs.includes(tech);
                return (
                  // biome-ignore lint/a11y/useFocusableInteractive: options are navigated via aria-activedescendant; DOM focus stays in the filter input by design
                  <div
                    key={tech}
                    id={optionId(tech)}
                    role="option"
                    aria-selected={selected}
                    onClick={() => onToggleTech(tech)}
                    onKeyDown={handleKeyDown}
                    className={cn(
                      'flex min-h-11 cursor-pointer items-center gap-2 rounded-md px-3 text-sm',
                      selected ? 'bg-primary/10 text-primary' : 'text-foreground/80',
                      tech === active && 'bg-accent'
                    )}
                  >
                    {selected && (
                      <Check
                        data-testid="filter-check"
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                    )}
                    {tech}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="px-3 py-2 text-sm text-muted-foreground">{t('techNoResults')}</p>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
