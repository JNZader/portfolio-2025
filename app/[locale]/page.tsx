import { Award, Briefcase, Layers, TrendingUp } from 'lucide-react';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { RevealOnScroll, StaggeredReveal } from '@/components/animations';
import { NewsletterSkeleton } from '@/components/newsletter/NewsletterSkeleton';
import { HeroSection } from '@/components/sections/hero-section';
import { JsonLd } from '@/components/seo/JsonLd';
import Section, {
  SECTION_BG,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from '@/components/ui/Section';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { SkillsList } from '@/components/ui/SkillsList';
import { SKILLS_DATA_HOME } from '@/lib/constants';
import { localeAlternates } from '@/lib/seo/alternates';
import { ogLocaleFields } from '@/lib/seo/metadata';
import { generatePersonSchema, generateWebSiteSchema } from '@/lib/seo/schema';

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

// Labels/sublabels resolve from the `Home` message namespace. `sublabelKey`
// (optional) renders small under the label — defines the term for non-technical
// readers without relying on tooltips (useless on mobile).
const STATS = [
  { value: '20+', key: 'statYears', icon: TrendingUp },
  // Defensible from resume.json: the CV lists exactly 6 end-to-end projects.
  { value: '6', key: 'statSystems', sublabelKey: 'statSystemsSublabel', icon: Briefcase },
  { value: '4+', key: 'statCertifications', icon: Award },
  // Defensible from SKILLS_DATA (backend 6 + frontend 6 + databases 4 + devops 5
  // = 21 technologies listed across the site); rounded down to 20+.
  { value: '20+', key: 'statTechnologies', icon: Layers },
] as const;

export default async function HomePage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  // Opt into static rendering while using translations.
  setRequestLocale(locale);
  const t = await getTranslations('Home');
  // Generate structured data schemas
  const personSchema = generatePersonSchema(locale);
  const websiteSchema = generateWebSiteSchema();

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
        // CTA hierarchy: Descargar CV (filled, lowest-friction recruiter action) >
        // Ver Proyectos (outline) > Contactar (ghost). CV renders as <a download>
        // so the /api/resume PDF attachment downloads instead of SPA-navigating.
        cvHref={locale === 'en' ? '/api/resume?locale=en' : '/api/resume'}
        primaryCta={{
          text: t('heroCtaProjects'),
          href: '/proyectos',
        }}
        secondaryCta={{
          text: t('heroCtaContact'),
          href: '/contacto',
        }}
        socialLinks={{
          github: 'https://github.com/JNZader',
          linkedin: 'https://www.linkedin.com/in/jnzader/',
        }}
      />

      {/* Quick Stats - below the fold, use content-visibility */}
      <Section background={SECTION_BG.MUTED} spacing="lg" className="content-auto">
        <StaggeredReveal
          staggerDelay={0.1}
          className="grid w-full grid-cols-2 gap-4 md:grid-cols-4 md:gap-8"
        >
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.key}
                className="group w-full min-w-0 rounded-xl border border-transparent bg-card/50 p-6 text-center card-hover hover:border-primary/20"
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-display text-primary">{stat.value}</div>
                <div className="mt-2 text-sm text-muted-foreground">{t(stat.key)}</div>
                {'sublabelKey' in stat && (
                  <div className="mt-1 font-mono text-xs text-muted-foreground">
                    {t(stat.sublabelKey)}
                  </div>
                )}
              </div>
            );
          })}
        </StaggeredReveal>
      </Section>

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                {/* Skills Card */}
                <div className="glass-card p-6 rounded-xl card-hover">
                  <h3 className="text-lg font-bold mb-4 heading-accent">{t('skillsHeading')}</h3>
                  <div className="space-y-4">
                    <SkillsList title="Backend" skills={SKILLS_DATA_HOME.backend} />
                    <SkillsList title="Frontend" skills={SKILLS_DATA_HOME.frontend} />
                    <SkillsList title="DevOps" skills={SKILLS_DATA_HOME.devops} />
                  </div>
                </div>

                {/* Experience Card */}
                <div className="glass-card p-6 rounded-xl card-hover">
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

      {/* Decorative Divider */}
      <SectionDivider variant="gradient" />

      {/* Newsletter Section */}
      <Suspense fallback={<NewsletterSkeleton />}>
        <NewsletterHero />
      </Suspense>
    </>
  );
}
