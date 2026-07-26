import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { NewsletterSkeleton } from '@/components/newsletter/NewsletterSkeleton';
import { AboutProfile } from '@/components/sections/AboutProfile';
import { FeaturedProjects } from '@/components/sections/FeaturedProjects';
import { HeroSection } from '@/components/sections/hero-section';
import { JsonLd } from '@/components/seo/JsonLd';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { getSanityProjects } from '@/lib/data/projects-page';
import { localeAlternates } from '@/lib/seo/alternates';
import { ogLocaleFields } from '@/lib/seo/metadata';
import { generatePersonSchema, generateWebSiteSchema } from '@/lib/seo/schema';
import { selectFeaturedProjects } from '@/lib/utils/projects';

export async function generateMetadata({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('Home');
  return {
    title: t('metaTitle'),
    alternates: await localeAlternates('/'),
    description: t('metaDescription'),
    openGraph: { title: t('ogTitle'), description: t('ogDescription'), ...ogLocaleFields(locale) },
  };
}

const NewsletterHero = dynamic(
  () =>
    import('@/components/newsletter/NewsletterHero').then((mod) => ({
      default: mod.NewsletterHero,
    })),
  { loading: () => <NewsletterSkeleton />, ssr: true }
);

export default async function HomePage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, projects] = await Promise.all([getTranslations('Home'), getSanityProjects(locale)]);
  const featuredProjects = selectFeaturedProjects(projects);
  const scrollTargetId = featuredProjects.length > 0 ? 'featured-projects' : 'sobre-mi';
  return (
    <>
      <JsonLd data={generatePersonSchema(locale)} />
      <JsonLd data={generateWebSiteSchema()} />
      <HeroSection
        greeting={t('heroGreeting')}
        jobTitle={t('heroJobTitle')}
        title="Javier Zader"
        description={t('heroDescription')}
        cvHref={locale === 'en' ? '/api/resume?locale=en' : '/api/resume'}
        scrollTargetId={scrollTargetId}
        primaryCta={{ text: t('heroCtaProjects'), href: '/proyectos' }}
        socialLinks={{
          github: 'https://github.com/JNZader',
          linkedin: 'https://www.linkedin.com/in/jnzader/',
        }}
      />
      <FeaturedProjects locale={locale} featuredProjects={featuredProjects} />
      <SectionDivider variant="gradient" />
      <AboutProfile />
      <Suspense fallback={<NewsletterSkeleton />}>
        <NewsletterHero />
      </Suspense>
    </>
  );
}
