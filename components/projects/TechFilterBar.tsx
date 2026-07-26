'use client';

import { useTranslations } from 'next-intl';
import { FilterChip } from '@/components/ui/FilterChip';
import type { Project } from '@/lib/github/types';
import { TechDropdown } from './TechDropdown';

interface TechFilterBarProps {
  projects: Project[];
  selectedTechs: string[];
  onToggleTech: (tech: string) => void;
}

const TOP_N = 8;

/**
 * Always-visible technology chip bar: the top 8 techs by frequency across
 * the project list (deterministic: frequency desc, localeCompare tie-break)
 * UNION any selected techs outside the top 8 (pinned at the end, sorted),
 * with everything outside the top 8 reachable through the "More" dropdown.
 * The dropdown excludes ONLY the top 8 — selected (pinned) techs stay in
 * the listbox with aria-selected so toggling them never unmounts the open
 * popover. Purely presentational derivation — no memoization (React
 * Compiler).
 */
export function TechFilterBar({
  projects,
  selectedTechs,
  onToggleTech,
}: Readonly<TechFilterBarProps>) {
  const t = useTranslations('Projects');

  const frequency = new Map<string, number>();
  for (const project of projects) {
    for (const tech of project.tech) {
      frequency.set(tech, (frequency.get(tech) ?? 0) + 1);
    }
  }

  const sorted = [...frequency.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const topN = sorted.slice(0, TOP_N).map(([tech]) => tech);
  const pinned = selectedTechs
    .filter((tech) => frequency.has(tech) && !topN.includes(tech))
    .sort((a, b) => a.localeCompare(b));
  const visible = [...topN, ...pinned];
  // The dropdown hides only the top 8: pinned selections remain listed so
  // toggling a tech from the open listbox never removes the option
  // mid-interaction (it flips aria-selected and shows a check instead).
  const remaining = [...frequency.keys()]
    .filter((tech) => !topN.includes(tech))
    .sort((a, b) => a.localeCompare(b));

  return (
    // biome-ignore lint/a11y/useSemanticElements: design contract is a labeled group wrapper, not a form fieldset
    <div
      role="group"
      aria-label={t('techBarLabel')}
      data-region="tech-bar"
      className="flex flex-wrap gap-2"
    >
      {visible.map((tech) => (
        <FilterChip
          key={tech}
          selected={selectedTechs.includes(tech)}
          onToggle={() => onToggleTech(tech)}
        >
          {tech}
        </FilterChip>
      ))}
      {remaining.length > 0 && (
        <TechDropdown
          remainingTechs={remaining}
          selectedTechs={selectedTechs}
          onToggleTech={onToggleTech}
        />
      )}
    </div>
  );
}
