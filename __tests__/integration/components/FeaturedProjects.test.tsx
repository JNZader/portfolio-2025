import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/__tests__/test-utils';
import { FeaturedProjects } from '@/components/sections/FeaturedProjects';
import type { Project } from '@/lib/github/types';
import en from '@/messages/en.json';
import es from '@/messages/es.json';

async function renderFeaturedProjects(locale: string, featuredProjects: Project[]) {
  return render(
    <>{await FeaturedProjects({ locale, featuredProjects } as never)}</>
  );
}

vi.mock('@/lib/data/projects-page', () => ({
  getSanityProjects: vi.fn(),
}));

vi.mock('next-intl/server', () => ({
  getTranslations: async () => (key: string) => {
    const messages: Record<string, string> = {
      'featuredProjectsTitle': 'Proyectos Destacados',
      'featuredProjectsSubtitle': 'Una selección de trabajos recientes',
      'featuredProjectsCta': 'Ver todos los proyectos',
      'featuredProjectsPrevious': 'Proyecto anterior',
      'featuredProjectsNext': 'Proyecto siguiente',
    };
    return messages[key] ?? key;
  },
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

function createProject(id: string, overrides: Partial<Project> = {}): Project {
  return {
    id,
    title: `Project ${id}`,
    description: `Description for ${id}`,
    url: `/proyectos/${id}`,
    tech: ['TypeScript', 'React', 'Node.js'],
    source: 'sanity',
    ...overrides,
  };
}

describe('FeaturedProjects', () => {
  it('renders the section heading and subtitle', async () => {
    const { getSanityProjects } = await import('@/lib/data/projects-page');
    vi.mocked(getSanityProjects).mockResolvedValue([createProject('from-loader')]);

    await renderFeaturedProjects('es', [createProject('alpha')]);

    expect(screen.getByRole('heading', { name: 'Proyectos Destacados' })).toBeInTheDocument();
    expect(screen.getByText('Una selección de trabajos recientes')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Proyectos Destacados' }).closest('section')).toHaveAttribute(
      'id',
      'featured-projects'
    );
  });

  it('renders up to 4 project cards and prefers featured projects first', async () => {
    const { getSanityProjects } = await import('@/lib/data/projects-page');
    vi.mocked(getSanityProjects).mockResolvedValue([
      createProject('first', { featured: false }),
      createProject('featured-1', { featured: true }),
      createProject('featured-2', { featured: true }),
      createProject('second', { featured: false }),
      createProject('third', { featured: false }),
    ]);

    await renderFeaturedProjects('es', [
      createProject('featured-1', { featured: true }),
      createProject('featured-2', { featured: true }),
      createProject('first', { featured: false }),
      createProject('second', { featured: false }),
    ]);

    const links = screen.getAllByRole('link', { name: /Project / });
    expect(links).toHaveLength(4);
    expect(links[0]).toHaveAttribute('href', '/proyectos/featured-1');
    expect(links[1]).toHaveAttribute('href', '/proyectos/featured-2');
    expect(links[2]).toHaveAttribute('href', '/proyectos/first');
    expect(links[3]).toHaveAttribute('href', '/proyectos/second');
    const cards = screen.getAllByTestId('featured-project-card');
    expect(cards).toHaveLength(4);
    expect(cards.map((card) => card.className)).toEqual(Array(4).fill(cards[0].className));
    expect(cards[0]).toHaveClass('basis-[86%]', 'md:basis-[calc((100%_-_1.5rem)/2)]');
    expect(screen.queryByTestId('featured-project-spotlight')).not.toBeInTheDocument();
    expect(document.querySelector('[data-featured-project-role="spotlight"]')).toBeNull();
    expect(screen.getByTestId('featured-projects-rail')).toHaveAttribute('data-scroll-snap', 'x mandatory');
  });

  it('renders localized, keyboard-accessible rail controls', async () => {
    await renderFeaturedProjects('es', [createProject('alpha'), createProject('beta')]);

    const previous = screen.getByRole('button', { name: 'Proyecto anterior' });
    const next = screen.getByRole('button', { name: 'Proyecto siguiente' });

    expect(previous).toBeDisabled();
    expect(next).toBeEnabled();
    expect(previous).toHaveAttribute('type', 'button');
    expect(next).toHaveClass('size-11', 'focus-visible:ring-[3px]');
  });

  it('keeps previous and next control labels explicit in both locales', () => {
    expect(es.Home.featuredProjectsPrevious).toBe('Proyecto anterior');
    expect(es.Home.featuredProjectsNext).toBe('Proyecto siguiente');
    expect(en.Home.featuredProjectsPrevious).toBe('Previous project');
    expect(en.Home.featuredProjectsNext).toBe('Next project');
  });

  it('renders image-backed and deterministic fallback visuals for every project', async () => {
    await renderFeaturedProjects('es', [
      createProject('with-image', { image: 'https://cdn.example.com/project.png' }),
      createProject('without-image'),
    ]);

    expect(screen.getByTestId('project-image')).toHaveAttribute(
      'src',
      expect.stringContaining('/_next/image?url=')
    );
    expect(screen.getByTestId('project-visual-fallback')).toBeInTheDocument();
    expect(screen.getAllByTestId('featured-project-media')).toHaveLength(2);
    expect(
      screen.getAllByTestId('featured-project-media').every((media) =>
        media.classList.contains('aspect-video')
      )
    ).toBe(true);
  });

  it('keeps every project detail link keyboard reachable with a semantic name', async () => {
    await renderFeaturedProjects('es', [createProject('alpha'), createProject('beta')]);

    const links = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('href')?.startsWith('/proyectos/'));
    expect(links).toHaveLength(4);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/proyectos/alpha',
      '/proyectos/alpha',
      '/proyectos/beta',
      '/proyectos/beta',
    ]);
    expect(links.every((link) => link.getAttribute('href'))).toBe(true);
  });

  it('falls back to available projects when fewer than 3 are featured', async () => {
    const { getSanityProjects } = await import('@/lib/data/projects-page');
    vi.mocked(getSanityProjects).mockResolvedValue([
      createProject('only-featured', { featured: true }),
      createProject('fallback-1', { featured: false }),
    ]);

    await renderFeaturedProjects('es', [createProject('only-featured', { featured: true })]);

    const links = screen.getAllByRole('link', { name: /Project / });
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', '/proyectos/only-featured');
  });

  it('renders the view-all CTA linking to /proyectos', async () => {
    const { getSanityProjects } = await import('@/lib/data/projects-page');
    vi.mocked(getSanityProjects).mockResolvedValue([
      createProject('alpha'),
    ]);

    await renderFeaturedProjects('es', [createProject('alpha')]);

    const cta = screen.getByRole('link', { name: 'Ver todos los proyectos' });
    expect(cta).toHaveAttribute('href', '/proyectos');
  });

  it('renders nothing when no projects are returned', async () => {
    const { getSanityProjects } = await import('@/lib/data/projects-page');
    vi.mocked(getSanityProjects).mockResolvedValue([]);

    await renderFeaturedProjects('es', []);

    expect(screen.queryByRole('heading', { name: 'Proyectos Destacados' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Project / })).not.toBeInTheDocument();
  });
});
