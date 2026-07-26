import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@/__tests__/test-utils';
import userEvent from '@testing-library/user-event';
import { TechFilterBar } from '@/components/projects/TechFilterBar';
import type { Project } from '@/lib/github/types';

/**
 * Proyectos filters redesign — tech bar renders a deterministic top-8 by
 * frequency (localeCompare tie-break), pins dropdown-selected techs into the
 * visible bar, and overflows the rest into a "More" dropdown trigger.
 *
 * Fixture frequencies: React 5, TypeScript 4, Docker 3, Next.js 3, Go 2,
 * Tailwind 2, Astro 1, Python 1, Rust 1 — nine distinct techs, so Rust falls
 * into the dropdown.
 */
const PROJECTS: Project[] = [
  { id: 'p1', title: 'One', description: 'd', url: '/proyectos/one', tech: ['React', 'TypeScript', 'Docker', 'Go'], source: 'sanity' },
  { id: 'p2', title: 'Two', description: 'd', url: '/proyectos/two', tech: ['React', 'TypeScript', 'Docker', 'Next.js', 'Tailwind'], source: 'github' },
  { id: 'p3', title: 'Three', description: 'd', url: '/proyectos/three', tech: ['React', 'TypeScript', 'Docker', 'Next.js', 'Tailwind'], source: 'github' },
  { id: 'p4', title: 'Four', description: 'd', url: '/proyectos/four', tech: ['React', 'TypeScript', 'Next.js', 'Astro'], source: 'sanity' },
  { id: 'p5', title: 'Five', description: 'd', url: '/proyectos/five', tech: ['React', 'Go', 'Python', 'Rust'], source: 'github' },
];

const FEW_TECH_PROJECTS: Project[] = [
  { id: 'p1', title: 'One', description: 'd', url: '/proyectos/one', tech: ['React', 'TypeScript'], source: 'sanity' },
  { id: 'p2', title: 'Two', description: 'd', url: '/proyectos/two', tech: ['React', 'Docker'], source: 'github' },
];

const TOP_EIGHT = [
  'React',
  'TypeScript',
  'Docker',
  'Next.js',
  'Go',
  'Tailwind',
  'Astro',
  'Python',
];

function renderBar(selectedTechs: string[] = [], onToggleTech = vi.fn()) {
  render(
    <TechFilterBar projects={PROJECTS} selectedTechs={selectedTechs} onToggleTech={onToggleTech} />
  );
  return { onToggleTech };
}

/** Stateful harness: lifts selectedTechs like ProjectsClient does. */
function StatefulBar() {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <TechFilterBar
      projects={PROJECTS}
      selectedTechs={selected}
      onToggleTech={(tech) =>
        setSelected((prev) =>
          prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
        )
      }
    />
  );
}

describe('TechFilterBar', () => {
  it('renders exactly the top 8 techs by frequency in deterministic order', () => {
    renderBar();

    const group = screen.getByRole('group', { name: 'Filtrar por tecnología' });
    const chips = within(group).getAllByRole('checkbox');
    expect(chips.map((chip) => chip.textContent)).toEqual(TOP_EIGHT);
  });

  it('produces an identical order on re-render with the same data', () => {
    const { rerender } = render(
      <TechFilterBar projects={PROJECTS} selectedTechs={[]} onToggleTech={() => {}} />
    );
    const first = screen.getAllByRole('checkbox').map((chip) => chip.textContent);

    rerender(<TechFilterBar projects={PROJECTS} selectedTechs={[]} onToggleTech={() => {}} />);
    const second = screen.getAllByRole('checkbox').map((chip) => chip.textContent);

    expect(second).toEqual(first);
    expect(second).toEqual(TOP_EIGHT);
  });

  it('wraps the bar in a labeled group with the tech-bar region hook', () => {
    renderBar();

    const group = screen.getByRole('group', { name: 'Filtrar por tecnología' });
    expect(group).toHaveAttribute('data-region', 'tech-bar');
  });

  it('pins a selected dropdown-only tech into the visible bar', () => {
    renderBar(['Rust']);

    const group = screen.getByRole('group', { name: 'Filtrar por tecnología' });
    const rust = within(group).getByRole('checkbox', { name: 'Rust' });
    expect(rust).toHaveAttribute('aria-checked', 'true');

    // top 8 + pinned Rust = 9 visible chips
    expect(within(group).getAllByRole('checkbox')).toHaveLength(9);
  });

  it('shows the remaining count on the More trigger with listbox semantics', () => {
    renderBar();

    // 9 total - 8 top = 1 dropdown tech (singular ICU plural branch)
    const more = screen.getByRole('button', { name: '+1 más: Mostrar 1 tecnología más' });
    expect(more).toHaveAttribute('aria-haspopup', 'listbox');
    expect(more).toHaveAttribute('aria-expanded', 'false');
    expect(more.textContent).toContain('+1 más');
  });

  it('hides the More trigger when everything fits in the visible bar', () => {
    render(
      <TechFilterBar projects={FEW_TECH_PROJECTS} selectedTechs={[]} onToggleTech={() => {}} />
    );

    const group = screen.getByRole('group', { name: 'Filtrar por tecnología' });
    expect(within(group).getAllByRole('checkbox')).toHaveLength(3);
    expect(
      screen.queryByRole('button', { name: /tecnolog.as? más/i })
    ).not.toBeInTheDocument();
  });

  it('keeps the More trigger when pinning covers every dropdown tech', () => {
    renderBar(['Rust']);

    // Pinned Rust stays in the dropdown list too — the trigger never
    // disappears because a tech got selected.
    const more = screen.getByRole('button', { name: /tecnolog.a.? más/i });
    expect(more).toBeInTheDocument();
  });

  it('keeps a dropdown-selected tech in the open listbox with aria-selected and a check', async () => {
    const user = userEvent.setup();
    renderBar(['Rust']);

    await user.click(screen.getByRole('button', { name: /tecnolog.a.? más/i }));

    const listbox = screen.getByRole('listbox');
    const rust = within(listbox).getByRole('option', { name: /Rust/ });
    expect(rust).toHaveAttribute('aria-selected', 'true');
    expect(within(rust).getByTestId('filter-check')).toBeInTheDocument();
  });

  it('toggling a dropdown tech flips aria-selected without unmounting the popover', async () => {
    const user = userEvent.setup();
    render(<StatefulBar />);

    await user.click(screen.getByRole('button', { name: /tecnolog.a.? más/i }));
    const rustOption = screen.getByRole('option', { name: /Rust/ });
    expect(rustOption).toHaveAttribute('aria-selected', 'false');

    // Select from the dropdown: option stays, aria-selected flips, popover open
    await user.click(rustOption);
    const selected = screen.getByRole('option', { name: /Rust/ });
    expect(selected).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    // ...and the pinned chip appears in the visible bar too
    const bar = screen.getByRole('group', { name: 'Filtrar por tecnología' });
    expect(within(bar).getByRole('checkbox', { name: 'Rust' })).toHaveAttribute(
      'aria-checked',
      'true'
    );

    // Deselect the LAST remaining dropdown tech: popover and trigger survive
    await user.click(selected);
    expect(screen.getByRole('option', { name: /Rust/ })).toHaveAttribute(
      'aria-selected',
      'false'
    );
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tecnolog.a.? más/i })).toBeInTheDocument();
  });

  it('forwards chip toggles to onToggleTech', async () => {
    const user = userEvent.setup();
    const { onToggleTech } = renderBar();

    await user.click(screen.getByRole('checkbox', { name: 'React' }));
    expect(onToggleTech).toHaveBeenCalledWith('React');
  });
});
