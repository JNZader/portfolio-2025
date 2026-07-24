import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { RevealOnScroll } from '@/components/animations';
import { NewsletterSkeleton } from '@/components/newsletter/NewsletterSkeleton';
import { FeaturedProjects } from '@/components/sections/FeaturedProjects';
import { HeroSection } from '@/components/sections/hero-section';
import { JsonLd } from '@/components/seo/JsonLd';
import Section, { SectionDescription, SectionHeader, SectionTitle } from '@/components/ui/Section';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { SkillsList } from '@/components/ui/SkillsList';
import { SKILLS_DATA_HOME } from '@/lib/constants';
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
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      ...ogLocaleFields(locale),
    },
  };
}

// Lazy load newsletter component (below the fold)
const NewsletterHero = dynamic(
  () =>
    import('@/components/newsletter/NewsletterHero').then((mod) => ({
      default: mod.NewsletterHero,
    })),
  {
    loading: () => <NewsletterSkeleton />,
    ssr: true,
  }
);

export default async function HomePage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  // Opt into static rendering while using translations.
  setRequestLocale(locale);
  const [t, projects] = await Promise.all([getTranslations('Home'), getSanityProjects(locale)]);
  const featuredProjects = selectFeaturedProjects(projects);
  // Generate structured data schemas
  const personSchema = generatePersonSchema(locale);
  const websiteSchema = generateWebSiteSchema();
  const scrollTargetId = featuredProjects.length > 0 ? 'featured-projects' : 'content';

  return (
    <>
      {/* Structured Data */}
      <JsonLd data={personSchema} />
      <JsonLd data={websiteSchema} />

      {/* Hero Section */}
      <HeroSection
        greeting={t('heroGreeting')}
        jobTitle={t('heroJobTitle')}
        title="Javier Zader"
        description={t('heroDescription')}
        // CTA hierarchy: Descargar CV (filled) > Ver Proyectos (outline).
        // CV renders as <a download> so the /api/resume PDF attachment
        // downloads instead of SPA-navigating.
        cvHref={locale === 'en' ? '/api/resume?locale=en' : '/api/resume'}
        scrollTargetId={scrollTargetId}
        primaryCta={{
          text: t('heroCtaProjects'),
          href: '/proyectos',
        }}
        socialLinks={{
          github: 'https://github.com/JNZader',
          linkedin: 'https://www.linkedin.com/in/jnzader/',
        }}
      />

      {/* Featured Projects - curated subset, full grid lives at /proyectos */}
      <FeaturedProjects locale={locale} featuredProjects={featuredProjects} />

      {/* Decorative Divider */}
      <SectionDivider variant="gradient" />

      {/* About Preview - below the fold, use content-visibility */}
      <Section id="content" className="content-auto">
        <RevealOnScroll>
          <SectionHeader centered>
            <SectionTitle>{t('aboutHeading')}</SectionTitle>
            <SectionDescription className="mx-auto">{t('aboutSubtitle')}</SectionDescription>
          </SectionHeader>
        </RevealOnScroll>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <RevealOnScroll className="lg:col-span-2">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">{t('journeyHeading')}</h3>
                  <div className="space-y-3 text-muted-foreground">
                    <p>{t('journeyP1')}</p>
                    <p>{t('journeyP2')}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">{t('approachHeading')}</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                    <li>{t('approach1')}</li>
                    <li>{t('approach2')}</li>
                    <li>{t('approach3')}</li>
                    <li>{t('approach4')}</li>
                  </ul>
                </div>
              </div>
            </RevealOnScroll>

            {/* Sidebar */}
            <RevealOnScroll delay={0.2}>
              <div className="space-y-6">
                <div className="rounded-xl border border-border/70 bg-card/70 p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4 heading-accent">{t('skillsHeading')}</h3>
                  <div className="space-y-4">
                    <SkillsList title="Backend" skills={SKILLS_DATA_HOME.backend} />
                    <SkillsList title="Frontend" skills={SKILLS_DATA_HOME.frontend} />
                    <SkillsList title="DevOps" skills={SKILLS_DATA_HOME.devops} />
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-card/70 p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4 heading-accent">
                    {t('experienceHeading')}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm">{t('roleTitle')}</h4>
                      <p className="text-xs text-muted-foreground">{t('roleYears')}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{t('certsTitle')}</h4>
                      <p className="text-xs text-muted-foreground">{t('certsDetail')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </Section>

      {/* Newsletter Section */}
      <Suspense fallback={<NewsletterSkeleton />}>
        <NewsletterHero />
      </Suspense>
    </>
  );
}
