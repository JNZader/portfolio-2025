import { render, screen } from '@/__tests__/test-utils';
import type { ReactNode } from 'react';
import es from '@/messages/es.json';
import en from '@/messages/en.json';
import { afterEach, describe, expect, it, vi } from 'vitest';

type Locale = 'es' | 'en';

let currentLocale: Locale = 'es';

const getSanityProjects = vi.fn();

vi.mock('next-intl/server', () => ({
  setRequestLocale: (locale: string) => {
    currentLocale = locale as Locale;
  },
  getTranslations: async (namespace: string) => {
    const catalog = currentLocale === 'en' ? en : es;
    const messages = catalog[namespace as keyof typeof catalog] as Record<string, string>;
    const translate = (key: string) => messages[key] ?? key;
    translate.rich = (key: string, values: { b: (chunks: ReactNode) => ReactNode }) => {
      const value = messages[key] ?? key;
      const [head, tail] = value.replace(/<b>|<\/b>/g, '').split(' — ');
      return <>{values.b(head)} — {tail}</>;
    };
    return translate;
  },
}));

vi.mock('next/dynamic', () => ({
  default: () => function DynamicMock() {
    return <section data-testid="newsletter" />;
  },
}));

vi.mock('@/components/seo/JsonLd', () => ({ JsonLd: () => null }));
vi.mock('@/components/animations', () => ({
  RevealOnScroll: ({ children }: { children: ReactNode }) => <>{children}</>,
  StaggeredReveal: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('@/components/newsletter/NewsletterSkeleton', () => ({ NewsletterSkeleton: () => null }));
vi.mock('@/components/newsletter/NewsletterHero', () => ({
  NewsletterHero: () => <section data-testid="newsletter" />,
}));
vi.mock('@/components/sections/hero-section', () => ({
  HeroSection: vi.fn((props: { scrollTargetId?: string; secondaryCta?: unknown }) => (
    <section
      data-testid="hero"
      data-scroll-target={props.scrollTargetId ?? 'content'}
      data-has-secondary={props.secondaryCta ? 'yes' : 'no'}
    />
  )),
}));
vi.mock('@/components/sections/FeaturedProjects', () => ({
  FeaturedProjects: vi.fn(
    (props: { featuredProjects?: Array<{ featured?: boolean }>; locale?: string }) => {
      if (props.featuredProjects && props.featuredProjects.length === 0) return null;
      return (
        <section
          data-testid="featured-projects"
          data-locale={props.locale ?? ''}
          data-count={props.featuredProjects?.length ?? 0}
        />
      );
    }
  ),
}));
vi.mock('@/components/ui/SectionDivider', () => ({
  SectionDivider: () => <div data-testid="divider" />,
}));
vi.mock('@/lib/data/projects-page', () => ({
  getSanityProjects: (...args: unknown[]) => getSanityProjects(...args),
}));
vi.mock('@/lib/utils/projects', () => ({
  selectFeaturedProjects: (projects: Array<{ featured?: boolean }>) =>
    projects.filter((project) => project.featured),
}));

function project(title: string, featured = false) {
  return {
    id: title,
    title,
    featured,
  };
}

async function renderHome(locale: Locale) {
  const { default: HomePage } = await import('@/app/[locale]/page');
  return render(await HomePage({ params: Promise.resolve({ locale }) }));
}

describe('HomePage anti-template composition', () => {
  afterEach(() => {
    getSanityProjects.mockReset();
  });

  it('renders Hero → Featured Projects → single divider → About → Newsletter with featured scroll target', async () => {
    getSanityProjects.mockResolvedValue([
      project('featured-alpha', true),
      project('supporting-beta', false),
    ]);

    await renderHome('es');

    expect(screen.queryByText('Años en Tecnología')).not.toBeInTheDocument();
    expect(screen.getByText('Backend real: sistemas en producción, observabilidad y menos pose.'))
      .toBeInTheDocument();

    const hero = screen.getByTestId('hero');
    const featured = screen.getByTestId('featured-projects');
    const dividers = screen.getAllByTestId('divider');

    expect(hero).toHaveAttribute('data-scroll-target', 'featured-projects');
    expect(hero).toHaveAttribute('data-has-secondary', 'no');
    expect(hero.nextElementSibling).toBe(featured);
    expect(dividers).toHaveLength(1);
    expect(featured.nextElementSibling).toBe(dividers[0]);
    expect(dividers[0].nextElementSibling).toBe(screen.getByText('Sobre Mí').closest('section'));
  });

  it('falls back to the about section when no featured projects are available', async () => {
    getSanityProjects.mockResolvedValue([]);

    await renderHome('en');

    expect(screen.queryByTestId('featured-projects')).not.toBeInTheDocument();
    expect(screen.getByTestId('hero')).toHaveAttribute('data-scroll-target', 'content');
    expect(screen.getByText('Real backend: production systems, observability, and less gloss.'))
      .toBeInTheDocument();
  });
});
