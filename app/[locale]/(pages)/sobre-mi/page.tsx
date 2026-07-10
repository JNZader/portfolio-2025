import { Award, BookOpen, Code2, GraduationCap } from 'lucide-react';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RevealOnScroll } from '@/components/animations';
import { CVButton } from '@/components/ui/CVButton';
import { HeroBackground } from '@/components/ui/HeroBackground';
import { ObfuscatedEmail } from '@/components/ui/ObfuscatedEmail';
import Section, { SectionDescription, SectionHeader, SectionTitle } from '@/components/ui/Section';
import { SkillsList } from '@/components/ui/SkillsList';
import { SKILLS_DATA } from '@/lib/constants';
import { localeAlternates } from '@/lib/seo/alternates';

// Lazy load ScrollIndicator - non-critical
const ScrollIndicator = dynamic(
  () => import('@/components/ui/ScrollIndicator').then((mod) => ({ default: mod.ScrollIndicator })),
  { ssr: true }
);

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('About');
  return {
    title: t('metaTitle'),
    alternates: await localeAlternates('/sobre-mi'),
    description: t('metaDescription'),
  };
}

export default async function SobreMiPage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('About');
  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <HeroBackground />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <RevealOnScroll>
            <SectionHeader centered>
              <div className="flex flex-col items-center gap-8 mb-6">
                <Image
                  src="/images/profile.jpg"
                  alt="Javier Zader"
                  width={160}
                  height={160}
                  priority
                  className="rounded-full ring-4 ring-primary/20 hover:ring-primary/40 transition-all hover:scale-110 duration-500"
                />
              </div>
              <SectionTitle size="xl" as="h1">
                {t('heroTitle')}
              </SectionTitle>
              <SectionDescription size="lg" className="mx-auto">
                {t('heroSubtitle')}
              </SectionDescription>
              {/* Prominent above-the-fold CV action (S5): mismo split-button que
                  el hero de la landing (Descargar + Ver → /cv), por consistencia.
                  The sidebar Contacto card keeps a second copy for visitors who
                  scroll. */}
              <div className="flex justify-center mt-8">
                <CVButton className="w-auto" />
              </div>
            </SectionHeader>
          </RevealOnScroll>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <ScrollIndicator targetId="content" />
        </div>
      </section>

      {/* Main Content */}
      <Section id="content">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <RevealOnScroll className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">{t('storyHeading')}</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>{t('storyP1')}</p>
                  <p>{t('storyP2')}</p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">{t('workHeading')}</h2>
                <div className="space-y-4 text-muted-foreground">
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>{t.rich('work1', { b: (c) => <strong>{c}</strong> })}</li>
                    <li>{t.rich('work2', { b: (c) => <strong>{c}</strong> })}</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">{t('areasHeading')}</h2>
                <div className="space-y-4 text-muted-foreground">
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>{t.rich('area1', { b: (c) => <strong>{c}</strong> })}</li>
                    <li>{t.rich('area2', { b: (c) => <strong>{c}</strong> })}</li>
                    <li>{t.rich('area3', { b: (c) => <strong>{c}</strong> })}</li>
                    <li>{t.rich('area4', { b: (c) => <strong>{c}</strong> })}</li>
                    <li>{t.rich('area5', { b: (c) => <strong>{c}</strong> })}</li>
                    <li>{t.rich('area6', { b: (c) => <strong>{c}</strong> })}</li>
                    <li>{t.rich('area7', { b: (c) => <strong>{c}</strong> })}</li>
                  </ul>
                </div>
              </div>
            </RevealOnScroll>

            {/* Sidebar */}
            <RevealOnScroll delay={0.2} className="space-y-8">
              {/* Skills */}
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-xl font-bold mb-4">{t('skillsHeading')}</h3>
                <div className="space-y-4">
                  <SkillsList title={t('skillBackend')} skills={SKILLS_DATA.backend} />
                  <SkillsList title={t('skillFrontend')} skills={SKILLS_DATA.frontend} />
                  {SKILLS_DATA.databases && (
                    <SkillsList title={t('skillDatabases')} skills={SKILLS_DATA.databases} />
                  )}
                  <SkillsList title={t('skillDevops')} skills={SKILLS_DATA.devops} />
                </div>
              </div>

              {/* Education - Timeline */}
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-xl font-bold mb-6">{t('eduHeading')}</h3>
                <div className="space-y-6 relative">
                  {/* Timeline line */}
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />

                  {/* Timeline items */}
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                      <GraduationCap className="w-3 h-3 text-primary" />
                    </div>
                    <h4 className="font-semibold text-sm">{t('edu1Degree')}</h4>
                    <p className="text-xs text-muted-foreground mt-1">Universidad Gastón Dachary</p>
                    <p className="text-xs text-muted-foreground">2023 - 2025</p>
                  </div>

                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-purple-500/10 border-2 border-purple-500 flex items-center justify-center">
                      <BookOpen className="w-3 h-3 text-purple-500" />
                    </div>
                    <h4 className="font-semibold text-sm">{t('edu2Degree')}</h4>
                    <p className="text-xs text-muted-foreground mt-1">Alura LATAM</p>
                    <p className="text-xs text-muted-foreground">2024 - 2025</p>
                  </div>

                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-orange-500/10 border-2 border-orange-500 flex items-center justify-center">
                      <Code2 className="w-3 h-3 text-orange-500" />
                    </div>
                    <h4 className="font-semibold text-sm">{t('edu3Degree')}</h4>
                    <p className="text-xs text-muted-foreground mt-1">Alura LATAM</p>
                    <p className="text-xs text-muted-foreground">2024</p>
                  </div>

                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center">
                      <BookOpen className="w-3 h-3 text-green-500" />
                    </div>
                    <h4 className="font-semibold text-sm">Argentina Programa</h4>
                    <p className="text-xs text-muted-foreground mt-1">{t('edu4Sub')}</p>
                    <p className="text-xs text-muted-foreground">2022 - 2023</p>
                  </div>

                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-blue-500/10 border-2 border-blue-500 flex items-center justify-center">
                      <Award className="w-3 h-3 text-blue-500" />
                    </div>
                    <h4 className="font-semibold text-sm">{t('edu5Degree')}</h4>
                    <p className="text-xs text-muted-foreground mt-1">Fundación Proydesa</p>
                    <p className="text-xs text-muted-foreground">2009</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-xl font-bold mb-4">{t('contactHeading')}</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <strong className="block mb-1">Email:</strong>
                    <ObfuscatedEmail
                      user="jnzader"
                      domain="gmail.com"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    />
                  </div>
                  <p>
                    <strong>{t('contactLocationLabel')}</strong> Córdoba, Argentina
                  </p>
                  <p>
                    <strong>{t('contactAvailabilityLabel')}</strong> {t('contactAvailability')}
                  </p>
                </div>
                <div className="mt-6">
                  {/* Eco callado del CV: mismo split (Descargar + Ver) que arriba,
                      en outline para no competir con la acción above-fold. */}
                  <CVButton variant="outline" fullWidth />
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </Section>
    </>
  );
}
