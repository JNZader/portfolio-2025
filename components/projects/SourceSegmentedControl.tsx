'use client';

import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import {
  filterChipBaseClasses,
  filterChipSelectedClasses,
  filterChipUnselectedClasses,
} from '@/components/ui/FilterChip';
import { cn } from '@/lib/utils';

export type ProjectSource = 'all' | 'sanity' | 'github';

interface SourceSegmentedControlProps {
  value: ProjectSource;
  onChange: (source: ProjectSource) => void;
}

const OPTIONS = [
  { value: 'all', labelKey: 'sourceAll' },
  { value: 'sanity', labelKey: 'sourceCurated' },
  { value: 'github', labelKey: 'sourceGithub' },
] as const;

/**
 * Source facet promoted to an always-visible segmented control. Radio-group
 * semantics (single-select) with roving tabindex: arrows move focus AND
 * selection (focus-follows-selection), Home/End jump to the ends. Below
 * `sm` the three segments share the full row width equally.
 */
export function SourceSegmentedControl({
  value,
  onChange,
}: Readonly<SourceSegmentedControlProps>) {
  const t = useTranslations('Projects');
  const segmentRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const moveTo = (index: number) => {
    // Focus follows selection (roving tabindex radio-group convention).
    onChange(OPTIONS[index].value);
    segmentRefs.current[index]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    const last = OPTIONS.length - 1;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        moveTo(index === last ? 0 : index + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        moveTo(index === 0 ? last : index - 1);
        break;
      case 'Home':
        event.preventDefault();
        moveTo(0);
        break;
      case 'End':
        event.preventDefault();
        moveTo(last);
        break;
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={t('sourceLabel')}
      data-region="control"
      className="flex w-full sm:w-auto"
    >
      {OPTIONS.map((option, index) => {
        const checked = value === option.value;
        return (
          <button
            key={option.value}
            ref={(element) => {
              segmentRefs.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              filterChipBaseClasses,
              'flex-1 sm:flex-initial',
              index === 0 ? 'rounded-l-md' : 'rounded-none -ml-px',
              index === OPTIONS.length - 1 && 'rounded-r-md',
              checked ? filterChipSelectedClasses : filterChipUnselectedClasses
            )}
          >
            {checked && (
              <Check data-testid="filter-check" className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {t(option.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
