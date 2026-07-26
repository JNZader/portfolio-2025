import es from '@/messages/es.json';
import en from '@/messages/en.json';
import { describe, expect, it, vi } from 'vitest';

let locale = 'es';

vi.mock('next-intl/server', () => ({
  getLocale: async () => locale,
  getTranslations: async () => {
    const messages = (locale === 'en' ? en : es).Home;
    return (key: string) => messages[key as keyof typeof messages] ?? key;
  },
}));
vi.mock('@/components/sections/AboutProfile', () => ({ AboutProfile: () => null }));
vi.mock('@/components/sections/FeaturedProjects', () => ({ FeaturedProjects: () => null }));
vi.mock('@/components/sections/hero-section', () => ({ HeroSection: () => null }));
vi.mock('@/components/seo/JsonLd', () => ({ JsonLd: () => null }));
vi.mock('@/components/ui/SectionDivider', () => ({ SectionDivider: () => null }));
vi.mock('@/components/newsletter/NewsletterSkeleton', () => ({ NewsletterSkeleton: () => null }));
vi.mock('@/lib/data/projects-page', () => ({ getSanityProjects: vi.fn() }));
vi.mock('@/lib/utils/projects', () => ({ selectFeaturedProjects: vi.fn(() => []) }));
vi.mock('@/lib/seo/schema', () => ({ generatePersonSchema: vi.fn(), generateWebSiteSchema: vi.fn() }));
vi.mock('next/dynamic', () => ({ default: () => () => null }));

describe('Home metadata after profile integration', () => {
  it.each([
    ['es', '/', es.Home],
    ['en', '/en', en.Home],
  ] as const)('keeps the localized canonical and alternate URLs (%s)', async (nextLocale, canonical, messages) => {
    locale = nextLocale;
    const { generateMetadata } = await import('@/app/[locale]/page');
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: nextLocale }) });

    expect(metadata.title).toBe(messages.metaTitle);
    expect(metadata.alternates).toEqual({
      canonical,
      languages: { es: '/', en: '/en', 'x-default': '/' },
    });
    expect(JSON.stringify(metadata)).not.toContain('sobre-mi');
    expect(JSON.stringify(metadata)).not.toContain('#');
  });
});
