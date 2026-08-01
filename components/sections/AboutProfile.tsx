import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { RevealOnScroll } from '@/components/animations';
import { CVButton } from '@/components/ui/CVButton';
import { ObfuscatedEmail } from '@/components/ui/ObfuscatedEmail';
import Section, {
  SECTION_BG,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from '@/components/ui/Section';
import { SkillsList } from '@/components/ui/SkillsList';
import { Link } from '@/i18n/navigation';
import { SKILLS_DATA } from '@/lib/constants';

export async function AboutProfile() {
  const t = await getTranslations('About');
  return (
    <Section
      id="sobre-mi"
      aria-labelledby="about-profile-heading"
      className="scroll-mt-24"
      background={SECTION_BG.GLOW}
    >
      <SectionHeader>
        <SectionTitle id="about-profile-heading">{t('heroTitle')}</SectionTitle>
        <SectionDescription>{t('heroSubtitle')}</SectionDescription>
      </SectionHeader>
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <RevealOnScroll className="space-y-8 lg:col-span-2">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <Image
                src="/images/profile.jpg"
                alt="Javier Zader"
                width={220}
                height={220}
                loading="lazy"
                className="size-40 rounded-full object-cover ring-4 ring-primary/20 shadow-lg sm:size-48"
              />
              <div className="min-w-0">
                <div className="mt-5">
                  <CVButton />
                </div>
              </div>
            </div>
            <div>
              <h2 className="mb-4 text-2xl font-bold">{t('storyHeading')}</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>{t('storyP1')}</p>
                <p>{t('storyP2')}</p>
              </div>
            </div>
            <div>
              <h2 className="mb-4 text-2xl font-bold">{t('workHeading')}</h2>
              <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                <li>{t.rich('work1', { b: (children) => <strong>{children}</strong> })}</li>
                <li>{t.rich('work2', { b: (children) => <strong>{children}</strong> })}</li>
                <li>{t.rich('work3', { b: (children) => <strong>{children}</strong> })}</li>
              </ul>
            </div>
            <div>
              <h2 className="mb-4 text-2xl font-bold">{t('areasHeading')}</h2>
              <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                {Array.from({ length: 7 }, (_, index) => {
                  const key = `area${index + 1}` as const;
                  return (
                    <li key={key}>
                      {t.rich(key, { b: (children) => <strong>{children}</strong> })}
                    </li>
                  );
                })}
              </ul>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={0.2} className="space-y-8">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-xl font-bold">{t('skillsHeading')}</h2>
              <div className="space-y-4">
                <SkillsList title={t('skillBackend')} skills={SKILLS_DATA.backend} />
                <SkillsList title={t('skillFrontend')} skills={SKILLS_DATA.frontend} />
                {SKILLS_DATA.databases && (
                  <SkillsList title={t('skillDatabases')} skills={SKILLS_DATA.databases} />
                )}
                <SkillsList title={t('skillDevops')} skills={SKILLS_DATA.devops} />
              </div>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-6 text-xl font-bold">{t('eduHeading')}</h2>
              <ol className="space-y-5">
                <li>
                  <strong>{t('edu1Degree')}</strong>
                  <p className="text-xs text-muted-foreground">
                    Universidad Gastón Dachary · 2023 - 2025
                  </p>
                </li>
                <li>
                  <strong>{t('edu2Degree')}</strong>
                  <p className="text-xs text-muted-foreground">Alura LATAM · 2024 - 2025</p>
                </li>
                <li>
                  <strong>{t('edu3Degree')}</strong>
                  <p className="text-xs text-muted-foreground">Alura LATAM · 2024</p>
                </li>
                <li>
                  <strong>Argentina Programa</strong>
                  <p className="text-xs text-muted-foreground">{t('edu4Sub')} · 2022 - 2023</p>
                </li>
                <li>
                  <strong>{t('edu5Degree')}</strong>
                  <p className="text-xs text-muted-foreground">Fundación Proydesa · 2009</p>
                </li>
              </ol>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-xl font-bold">{t('contactHeading')}</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <strong className="mr-1">Email:</strong>
                  <ObfuscatedEmail user="jnzader" domain="gmail.com" />
                </div>
                <p>
                  <strong>{t('contactLocationLabel')}</strong> Córdoba, Argentina
                </p>
                <p>
                  <strong>{t('contactAvailabilityLabel')}</strong> {t('contactAvailability')}
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  href="/contacto"
                  className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-primary-foreground"
                >
                  {t('contactHeading')}
                </Link>
                <CVButton variant="outline" fullWidth />
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </Section>
  );
}
