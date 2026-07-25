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
vi.mock('@/components/ui/CVButton', () => ({
  CVButton: ({ variant = 'filled' }: { variant?: string }) => (
    <div data-testid={`cv-actions-${variant}`}>
      <a href="/api/resume" download>
        Download CV
      </a>
      <a href="/cv">View CV</a>
    </div>
  ),
}));
vi.mock('@/components/sections/AboutProfile', () => ({
  AboutProfile: () => {
    const messages = currentLocale === 'en' ? en.About : es.About;
    return (
      <section id="sobre-mi" aria-labelledby="about-profile-heading">
        <h2 id="about-profile-heading">{messages.heroTitle}</h2>
        <img src="/images/profile.jpg" alt="Javier Zader" />
        <p>{messages.storyP1}</p>
        <p>{messages.storyP2}</p>
        <ul>{Array.from({ length: 3 }, (_, index) => <li key={`work-${index}`}>{messages[`work${index + 1}` as 'work1' | 'work2' | 'work3']}</li>)}</ul>
        <ul>{Array.from({ length: 7 }, (_, index) => <li key={`area-${index}`}>{messages[`area${index + 1}` as 'area1' | 'area2' | 'area3' | 'area4' | 'area5' | 'area6' | 'area7']}</li>)}</ul>
        <ul>{Array.from({ length: 5 }, (_, index) => <li key={`edu-${index}`}>{messages[`edu${index + 1}Degree` as 'edu1Degree' | 'edu2Degree' | 'edu3Degree' | 'edu4Sub' | 'edu5Degree']}</li>)}</ul>
        <p>{messages.contactAvailability}</p>
        <a href="/contacto">{messages.contactHeading}</a>
        <div data-testid="cv-actions-filled"><a href="/api/resume" download>Download CV</a><a href="/cv">View CV</a></div>
        <div data-testid="cv-actions-outline"><a href="/api/resume" download>Download CV</a><a href="/cv">View CV</a></div>
      </section>
    );
  },
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
          id="featured-projects"
          data-testid="featured-projects"
          data-locale={props.locale ?? ''}
          data-count={props.featuredProjects?.length ?? 0}
        >
          <a href="/proyectos">View all projects</a>
        </section>
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

  it('renders the complete localized profile once in the home composition', async () => {
    getSanityProjects.mockResolvedValue([
      project('featured-alpha', true),
      project('supporting-beta', false),
    ]);

    await renderHome('es');

    const profile = screen.getByRole('region', { name: 'Sobre mí' });
    expect(profile).toHaveAttribute('id', 'sobre-mi');
    expect(screen.getByAltText('Javier Zader')).toBeInTheDocument();
    expect(screen.getByText(es.About.storyP1)).toBeInTheDocument();
    expect(screen.getByText(es.About.storyP2)).toBeInTheDocument();
    expect(profile.querySelectorAll('ul').length).toBeGreaterThanOrEqual(2);
    expect(profile.querySelectorAll('li')).toHaveLength(15);
    expect(screen.getByText(es.About.contactAvailability)).toBeInTheDocument();
    expect(screen.getByTestId('cv-actions-filled')).toBeInTheDocument();
    expect(screen.getByTestId('cv-actions-outline')).toBeInTheDocument();
    expect(screen.queryByText('Con más de 20 años en el mundo tecnológico, mi camino comenzó en soporte técnico')).not.toBeInTheDocument();
    expect(screen.queryByText('Prefiero superficies simples: menos chrome, más claridad operativa.')).not.toBeInTheDocument();

    const hero = screen.getByTestId('hero');
    const featured = screen.getByTestId('featured-projects');
    const dividers = screen.getAllByTestId('divider');

    expect(hero).toHaveAttribute('data-scroll-target', 'featured-projects');
    expect(hero).toHaveAttribute('data-scroll-target', featured.id);
    expect(featured).toHaveAttribute('id', 'featured-projects');
    expect(screen.getByRole('link', { name: 'View all projects' })).toHaveAttribute(
      'href',
      '/proyectos'
    );
    expect(hero).toHaveAttribute('data-has-secondary', 'no');
    expect(hero.nextElementSibling).toBe(featured);
    expect(dividers).toHaveLength(1);
    expect(featured.nextElementSibling).toBe(dividers[0]);
    expect(dividers[0].nextElementSibling).toBe(profile);
  });

  it('falls back to the about section when no featured projects are available', async () => {
    getSanityProjects.mockResolvedValue([]);

    await renderHome('en');

    expect(screen.queryByTestId('featured-projects')).not.toBeInTheDocument();
    expect(screen.getByTestId('hero')).toHaveAttribute('data-scroll-target', 'sobre-mi');
    expect(screen.getByTestId('hero')).toHaveAttribute(
      'data-scroll-target',
      screen.getByRole('region', { name: 'About me' }).id
    );
    expect(screen.getByText(en.About.storyP1)).toBeInTheDocument();
  });
});
