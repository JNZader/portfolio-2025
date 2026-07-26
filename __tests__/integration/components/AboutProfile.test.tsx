import { render, screen, within } from '@/__tests__/test-utils';
import type { ReactNode } from 'react';
import es from '@/messages/es.json';
import en from '@/messages/en.json';
import { SKILLS_DATA } from '@/lib/constants';
import { describe, expect, it, vi } from 'vitest';

type Locale = 'es' | 'en';
let locale: Locale = 'es';

vi.mock('next-intl/server', () => ({
  getTranslations: async () => {
    const messages = (locale === 'en' ? en : es).About;
    const translate = (key: string) => messages[key as keyof typeof messages] ?? key;
    translate.rich = (key: string, values: { b: (children: ReactNode) => ReactNode }) => {
      const value = String(messages[key as keyof typeof messages] ?? key);
      const [head, tail] = value.replace(/<b>|<\/b>/g, '').split(' — ');
      return <>{values.b(head)}{tail ? ` — ${tail}` : ''}</>;
    };
    return translate;
  },
}));

vi.mock('next/image', () => ({ default: (props: Record<string, unknown>) => <img {...props} /> }));
vi.mock('@/components/animations', () => ({ RevealOnScroll: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock('@/components/ui/ObfuscatedEmail', () => ({
  ObfuscatedEmail: () => (
    <button type="button">{locale === 'en' ? en.Email.send : es.Email.send}</button>
  ),
}));
vi.mock('@/components/ui/CVButton', () => ({
  CVButton: ({ variant = 'filled' }: { variant?: string }) => (
    <div data-testid={`cv-${variant}`}>
      <a href="/api/resume" download>
        {locale === 'en' ? en.Common.cvDownload : es.Common.cvDownload}
      </a>
      <a href="/cv">{locale === 'en' ? en.Common.cvView : es.Common.cvView}</a>
    </div>
  ),
}));
vi.mock('@/i18n/navigation', () => ({ Link: ({ href, children, ...props }: { href: string; children: ReactNode }) => <a href={href} {...props}>{children}</a> }));

async function renderProfile(nextLocale: Locale) {
  locale = nextLocale;
  const { AboutProfile } = await import('@/components/sections/AboutProfile');
  return render(await AboutProfile());
}

function plainRichText(value: string) {
  return value.replace(/<b>|<\/b>/g, '');
}

function sectionForHeading(name: string) {
  const heading = screen.getByRole('heading', { name, level: 2 });
  expect(heading.parentElement).not.toBeNull();
  return within(heading.parentElement as HTMLElement);
}

describe('AboutProfile production component', () => {
  it.each([
    ['es', es.About],
    ['en', en.About],
  ] as const)('renders the complete localized profile contract (%s)', async (nextLocale, messages) => {
    await renderProfile(nextLocale);

    const profile = screen.getByRole('region', { name: messages.heroTitle });
    expect(profile).toHaveAttribute('id', 'sobre-mi');
    expect(profile).toHaveAttribute('aria-labelledby', 'about-profile-heading');
    expect(screen.getAllByRole('heading', { name: messages.heroTitle, level: 2 })).toHaveLength(1);
    expect(screen.getAllByText(messages.heroSubtitle)).toHaveLength(1);
    expect(screen.getByAltText('Javier Zader')).toBeInTheDocument();
    expect(screen.getByText(messages.storyP1)).toBeInTheDocument();
    expect(screen.getByText(messages.storyP2)).toBeInTheDocument();
    const workSection = sectionForHeading(messages.workHeading);
    expect(workSection.getByRole('list')).toBeInTheDocument();
    expect(workSection.getAllByRole('listitem')).toHaveLength(3);
    [messages.work1, messages.work2, messages.work3].forEach((principle) => {
      expect(profile).toHaveTextContent(plainRichText(principle));
    });

    const areasSection = sectionForHeading(messages.areasHeading);
    expect(areasSection.getAllByRole('listitem')).toHaveLength(7);
    [messages.area1, messages.area2, messages.area3, messages.area4, messages.area5, messages.area6, messages.area7].forEach(
      (area) => expect(profile).toHaveTextContent(plainRichText(area))
    );

    const skillSection = sectionForHeading(messages.skillsHeading);
    const skillGroups = [
      [messages.skillBackend, SKILLS_DATA.backend[0].name],
      [messages.skillFrontend, SKILLS_DATA.frontend[0].name],
      [messages.skillDatabases, SKILLS_DATA.databases![0].name],
      [messages.skillDevops, SKILLS_DATA.devops[0].name],
    ] as const;
    expect(skillSection.getAllByRole('heading', { level: 4 })).toHaveLength(4);
    skillGroups.forEach(([label, representativeSkill]) => {
      const groupHeading = skillSection.getByRole('heading', { name: label, level: 4 });
      expect(groupHeading.parentElement).not.toBeNull();
      expect(within(groupHeading.parentElement as HTMLElement).getByText(representativeSkill)).toBeInTheDocument();
    });

    const educationSection = sectionForHeading(messages.eduHeading);
    expect(educationSection.getAllByRole('listitem')).toHaveLength(5);
    [messages.edu1Degree, messages.edu2Degree, messages.edu3Degree, 'Argentina Programa', messages.edu5Degree].forEach(
      (entry) => expect(educationSection.getByText(entry)).toBeInTheDocument()
    );

    const downloads = screen.getAllByRole('link', { name: messages === en.About ? en.Common.cvDownload : es.Common.cvDownload });
    expect(downloads).toHaveLength(2);
    downloads.forEach((link) => expect(link).toHaveAttribute('download'));
    const views = screen.getAllByRole('link', { name: messages === en.About ? en.Common.cvView : es.Common.cvView });
    expect(views).toHaveLength(2);
    views.forEach((link) => expect(link).toHaveAttribute('href', '/cv'));
    expect(screen.getByRole('link', { name: messages.contactHeading })).toHaveAttribute('href', '/contacto');
    expect(screen.getByText('Email:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages === en.About ? en.Email.send : es.Email.send })).toBeInTheDocument();
    expect(screen.getByText(messages.contactAvailability)).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: messages.heroTitle, level: 2 })).toHaveLength(1);

    if (nextLocale === 'en') {
      const localizedBlocks = [
        [es.About.work1, en.About.work1],
        [es.About.work2, en.About.work2],
        [es.About.work3, en.About.work3],
        [es.About.area1, en.About.area1],
        [es.About.area2, en.About.area2],
        [es.About.area3, en.About.area3],
        [es.About.area4, en.About.area4],
        [es.About.area5, en.About.area5],
        [es.About.area6, en.About.area6],
        [es.About.area7, en.About.area7],
        [es.About.edu1Degree, en.About.edu1Degree],
        [es.About.edu2Degree, en.About.edu2Degree],
        [es.About.edu3Degree, en.About.edu3Degree],
        ['Argentina Programa', 'Argentina Programa'],
        [es.About.edu5Degree, en.About.edu5Degree],
      ] as const;
      localizedBlocks
        .filter(([fallback, english]) => fallback !== english)
        .forEach(([fallback]) => expect(profile).not.toHaveTextContent(plainRichText(fallback)));
      expect(profile).not.toHaveTextContent(es.About.skillDatabases);
    }
  });
});
