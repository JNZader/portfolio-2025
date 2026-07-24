import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@/__tests__/test-utils';
import userEvent from '@testing-library/user-event';
import ProjectsClient from '@/components/projects/ProjectsClient';
import type { Project } from '@/lib/github/types';

vi.mock('@/i18n/navigation', () => ({
  Link: ({
    children,
    href,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

/**
 * Batch 6 — filter chip redesign (Goncy feedback): selected filters must read
 * as toggle chips with a bare check (no circle, no tiny X), not as a loading
 * or draggable affordance.
 */
const PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'Alpha',
    description: 'First project',
    url: '/proyectos/alpha',
    tech: ['React', 'TypeScript'],
    source: 'sanity',
  },
  {
    id: 'p2',
    title: 'Beta',
    description: 'Second project',
    url: '/proyectos/beta',
    tech: ['Docker'],
    source: 'github',
  },
];

async function openFiltersPanel() {
  const user = userEvent.setup();
  const { container } = render(<ProjectsClient projects={PROJECTS} />);
  await user.click(screen.getByRole('button', { name: /filtros/i }));
  const panel = container.querySelector('#project-filters');
  if (!panel) throw new Error('filters panel did not open');
  return { user, panel: within(panel as HTMLElement) };
}

describe('projects filter chips', () => {
  it('selected tech chip shows a bare check and no X affordance', async () => {
    const { user, panel } = await openFiltersPanel();

    const reactChip = panel.getByRole('button', { name: 'React' });
    expect(reactChip).toHaveAttribute('aria-pressed', 'false');
    expect(within(reactChip).queryByTestId('filter-check')).not.toBeInTheDocument();

    await user.click(reactChip);

    const selected = panel.getByRole('button', { name: 'React' });
    expect(selected).toHaveAttribute('aria-pressed', 'true');
    expect(within(selected).getByTestId('filter-check')).toBeInTheDocument();
    expect(selected.querySelector('.lucide-x')).not.toBeInTheDocument();
  });

  it('selected source chip shows a check while the others stay unchecked', async () => {
    const { user, panel } = await openFiltersPanel();

    await user.click(panel.getByRole('button', { name: 'GitHub' }));

    const github = panel.getByRole('button', { name: 'GitHub' });
    expect(github).toHaveAttribute('aria-pressed', 'true');
    expect(within(github).getByTestId('filter-check')).toBeInTheDocument();

    const all = panel.getByRole('button', { name: 'Todos' });
    expect(all).toHaveAttribute('aria-pressed', 'false');
    expect(within(all).queryByTestId('filter-check')).not.toBeInTheDocument();
  });
});
