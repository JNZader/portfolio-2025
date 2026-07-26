import { render as rtlRender } from '@testing-library/react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@/__tests__/test-utils';
import userEvent from '@testing-library/user-event';
import ProjectsClient from '@/components/projects/ProjectsClient';
import type { Project } from '@/lib/github/types';
import enMessages from '@/messages/en.json';

/**
 * Proyectos filters redesign — the filter area is always visible: no
 * "Filtros" toggle, no collapsible panel. Search, the source segmented
 * control and the tech chip bar render on initial load; URL persistence
 * round-trips q/tech/source, pinning dropdown-only techs into the bar.
 */
const replaceMock = vi.fn();
let currentSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: replaceMock, prefetch: vi.fn() }),
  usePathname: () => '/proyectos',
  useSearchParams: () => currentSearchParams,
}));

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
 * Nine distinct techs: React 5, TypeScript 4, Docker 3, Next.js 3, Go 2,
 * Tailwind 2, Astro 1, Python 1, Rust 1 — Rust lives only in the dropdown.
 */
const PROJECTS: Project[] = [
  { id: 'p1', title: 'Alpha', description: 'First project', url: '/proyectos/alpha', tech: ['React', 'TypeScript', 'Docker', 'Go'], source: 'sanity' },
  { id: 'p2', title: 'Beta', description: 'Second project', url: '/proyectos/beta', tech: ['React', 'TypeScript', 'Docker', 'Next.js', 'Tailwind'], source: 'github' },
  { id: 'p3', title: 'Gamma', description: 'Third project', url: '/proyectos/gamma', tech: ['React', 'TypeScript', 'Docker', 'Next.js', 'Tailwind'], source: 'github' },
  { id: 'p4', title: 'Delta', description: 'Fourth project', url: '/proyectos/delta', tech: ['React', 'TypeScript', 'Next.js', 'Astro'], source: 'sanity' },
  { id: 'p5', title: 'Epsilon', description: 'Fifth project', url: '/proyectos/epsilon', tech: ['React', 'Go', 'Python', 'Rust'], source: 'github' },
];

function renderEn() {
  return rtlRender(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <ProjectsClient projects={PROJECTS} />
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  replaceMock.mockClear();
  currentSearchParams = new URLSearchParams();
});

describe('always-visible projects filter layout', () => {
  it('renders search, source control and tech bar with no toggle or panel', () => {
    render(<ProjectsClient projects={PROJECTS} />);

    expect(screen.queryByRole('button', { name: /filtros/i })).not.toBeInTheDocument();
    expect(document.querySelector('#project-filters')).not.toBeInTheDocument();

    expect(screen.getByRole('searchbox', { name: 'Buscar proyectos' })).toBeVisible();
    expect(screen.getByRole('radiogroup', { name: 'Filtrar por fuente' })).toBeVisible();
    expect(screen.getByRole('group', { name: 'Filtrar por tecnología' })).toBeVisible();
  });

  it('renders the same always-visible layout in English', () => {
    renderEn();

    expect(screen.queryByRole('button', { name: /filters/i })).not.toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search projects' })).toBeVisible();
    expect(screen.getByRole('radiogroup', { name: 'Filter by source' })).toBeVisible();
    expect(screen.getByRole('group', { name: 'Filter by technology' })).toBeVisible();
  });

  it('exposes the data-region hooks used by the skeleton parity check', () => {
    const { container } = render(<ProjectsClient projects={PROJECTS} />);

    for (const region of ['filter', 'search', 'control', 'tech-bar']) {
      expect(container.querySelector(`[data-region="${region}"]`)).not.toBeNull();
    }
  });

  it('gates the clear button on active filters and resets state + URL', async () => {
    const user = userEvent.setup();
    render(<ProjectsClient projects={PROJECTS} />);

    expect(screen.queryByRole('button', { name: 'Limpiar' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: 'React' }));
    const clear = screen.getByRole('button', { name: 'Limpiar' });
    expect(clear).toBeVisible();

    await user.click(clear);
    expect(screen.getByRole('checkbox', { name: 'React' })).toHaveAttribute(
      'aria-checked',
      'false'
    );
    expect(screen.queryByRole('button', { name: 'Limpiar' })).not.toBeInTheDocument();
    expect(replaceMock).toHaveBeenLastCalledWith('/proyectos');
  });
});

describe('projects filter chips (shared FilterChip)', () => {
  it('tech chips expose checkbox semantics with a bare check only when selected', async () => {
    const user = userEvent.setup();
    render(<ProjectsClient projects={PROJECTS} />);

    const react = screen.getByRole('checkbox', { name: 'React' });
    expect(react).toHaveAttribute('aria-checked', 'false');
    expect(within(react).queryByTestId('filter-check')).not.toBeInTheDocument();
    expect(react.className).toContain('min-h-11');
    expect(react.className).toContain('min-w-11');
    expect(react.className).not.toContain('text-muted-foreground');

    await user.click(react);

    const selected = screen.getByRole('checkbox', { name: 'React' });
    expect(selected).toHaveAttribute('aria-checked', 'true');
    expect(within(selected).getByTestId('filter-check')).toBeInTheDocument();
    expect(replaceMock).toHaveBeenLastCalledWith(
      expect.stringContaining('tech=React'),
      { scroll: false }
    );
  });
});

describe('URL persistence round-trips all filter dimensions', () => {
  it('hydrates search, source and techs (including dropdown-only) from the URL', () => {
    currentSearchParams = new URLSearchParams('q=alpha&tech=React,Rust&source=github');
    render(<ProjectsClient projects={PROJECTS} />);

    expect(screen.getByRole('searchbox', { name: 'Buscar proyectos' })).toHaveValue('alpha');
    expect(screen.getByRole('radio', { name: 'GitHub' })).toHaveAttribute(
      'aria-checked',
      'true'
    );

    const bar = screen.getByRole('group', { name: 'Filtrar por tecnología' });
    for (const tech of ['React', 'Rust']) {
      expect(within(bar).getByRole('checkbox', { name: tech })).toHaveAttribute(
        'aria-checked',
        'true'
      );
    }
  });

  it('hydrates a corrupted source param as Todos and keeps the radiogroup keyboard-accessible', () => {
    currentSearchParams = new URLSearchParams('source=banana');
    render(<ProjectsClient projects={PROJECTS} />);

    const todos = screen.getByRole('radio', { name: 'Todos' });
    expect(todos).toHaveAttribute('aria-checked', 'true');
    // Roving tabindex survives: the checked segment stays tabbable and the
    // others are reachable via arrows (none stuck without a tabbable entry).
    expect(todos).toHaveAttribute('tabindex', '0');
    for (const name of ['Curados', 'GitHub']) {
      expect(screen.getByRole('radio', { name })).toHaveAttribute('tabindex', '-1');
      expect(screen.getByRole('radio', { name })).toHaveAttribute('aria-checked', 'false');
    }
  });

  it('sets the source param for non-default sources and omits it for Todos', async () => {
    const user = userEvent.setup();
    render(<ProjectsClient projects={PROJECTS} />);

    await user.click(screen.getByRole('radio', { name: 'GitHub' }));
    expect(replaceMock).toHaveBeenLastCalledWith(expect.stringContaining('source=github'), {
      scroll: false,
    });

    await user.click(screen.getByRole('radio', { name: 'Todos' }));
    expect(replaceMock).toHaveBeenLastCalledWith('/proyectos', { scroll: false });
  });

  it('clearing filters empties q, tech and source from the URL', async () => {
    const user = userEvent.setup();
    currentSearchParams = new URLSearchParams('q=alpha&tech=React&source=github');
    render(<ProjectsClient projects={PROJECTS} />);

    await user.click(screen.getByRole('button', { name: 'Limpiar' }));

    expect(screen.getByRole('searchbox', { name: 'Buscar proyectos' })).toHaveValue('');
    expect(screen.getByRole('radio', { name: 'Todos' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(screen.getByRole('checkbox', { name: 'React' })).toHaveAttribute(
      'aria-checked',
      'false'
    );
    expect(replaceMock).toHaveBeenLastCalledWith('/proyectos');
  });
});
