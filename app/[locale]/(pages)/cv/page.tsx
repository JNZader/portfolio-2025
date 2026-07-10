import { Mail } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { JsonLd } from '@/components/seo/JsonLd';
import { DownloadCVButton } from '@/components/ui/DownloadCVButton';
import { ExternalLink } from '@/components/ui/ExternalLink';
import { ObfuscatedEmail } from '@/components/ui/ObfuscatedEmail';
import { Link } from '@/i18n/navigation';
import { localeAlternates } from '@/lib/seo/alternates';
import { generateResumePersonSchema } from '@/lib/seo/schema';
import type { ResumeDataRaw } from '@/lib/types/resume';

/**
 * Obtiene la data del CV según el locale.
 *
 * Inglés: JSON versionado por locale (`resume.en.json`), sin pasar por Sanity.
 * Español: Sanity con fallback al JSON estático. El import de Sanity se hace
 * dinámico DENTRO del try porque `sanity/env.ts` hace un assert a nivel de
 * módulo: sin `NEXT_PUBLIC_SANITY_DATASET` (dev local) el solo importarlo tira
 * en module-evaluation, antes del try/catch de fetchResumeData. Importándolo
 * así, ese throw cae acá y bajamos al JSON — funciona en local y en prod.
 */
async function getResumeData(locale: string): Promise<ResumeDataRaw> {
  if (locale === 'en') {
    const { default: en } = await import('@/lib/data/resume.en.json');
    return en as ResumeDataRaw;
  }
  try {
    const { fetchResumeData } = await import('@/sanity/lib/queries');
    return await fetchResumeData();
  } catch {
    const { default: fallback } = await import('@/lib/data/resume.json');
    return fallback as ResumeDataRaw;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Cv');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: await localeAlternates('/cv'),
  };
}

// ISR: mismo patrón que /proyectos. La data viene de Sanity con fallback a JSON.
export const revalidate = 3600;

/** Título de sección con regla inferior, reutilizado en toda la página. */
function SectionTitle({ children }: Readonly<{ children: string }>) {
  return (
    <h2 className="mb-4 border-b border-border pb-2 text-xl font-bold text-primary print:text-black">
      {children}
    </h2>
  );
}

export default async function CvPage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Cv');
  const data = await getResumeData(locale);
  const schema = generateResumePersonSchema(data, locale);
  const pdfHref = locale === 'en' ? '/api/resume?locale=en' : '/api/resume';

  return (
    <>
      <JsonLd data={schema} />

      {/* div, not <main>: the root layout already wraps children in <main id="main-content"> */}
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 print:max-w-none print:px-0 print:py-0 print:text-black">
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-black tracking-tight">{data.personalInfo.name}</h1>
          <p className="mt-2 text-lg text-muted-foreground print:text-black">
            {data.personalInfo.title} · {data.personalInfo.location}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 print:hidden">
            <DownloadCVButton />
            <Link
              href="/contacto"
              className="btn-cv inline-flex h-14 items-center justify-center gap-2 rounded-lg border-2 border-primary px-6 font-medium text-primary no-underline transition-colors duration-200 hover:bg-primary/10"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {t('contact')}
            </Link>
          </div>

          <p className="mt-4 text-sm text-muted-foreground print:hidden">
            {t.rich('webVersion', {
              pdf: (chunks) => (
                <a href={pdfHref} className="text-primary underline" download>
                  {chunks}
                </a>
              ),
            })}
          </p>
        </header>

        {/* Resumen */}
        <section className="mb-10">
          <SectionTitle>{t('sectionSummary')}</SectionTitle>
          <p className="leading-relaxed text-muted-foreground print:text-black">{data.summary}</p>
        </section>

        {/* Experiencia */}
        {data.experience.length > 0 && (
          <section className="mb-10">
            <SectionTitle>{t('sectionExperience')}</SectionTitle>
            <div className="space-y-6">
              {data.experience.map((job) => (
                <article key={`${job.company}-${job.position}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <h3 className="font-semibold">{job.position}</h3>
                    <span className="text-sm text-muted-foreground print:text-black">
                      {job.startDate} – {job.endDate}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground print:text-black">
                    {job.company} · {job.location}
                  </p>
                  {job.highlights.length > 0 && (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground print:text-black">
                      {job.highlights.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Proyectos */}
        {data.projects && data.projects.length > 0 && (
          <section className="mb-10">
            <SectionTitle>{t('sectionProjects')}</SectionTitle>
            <div className="space-y-6">
              {data.projects.map((project) => (
                <article key={project.name}>
                  <h3 className="font-semibold text-primary print:text-black">{project.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground print:text-black">
                    {project.description}
                  </p>
                  {project.highlights.length > 0 && (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground print:text-black">
                      {project.highlights.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Educación */}
        {data.education.length > 0 && (
          <section className="mb-10">
            <SectionTitle>{t('sectionEducation')}</SectionTitle>
            <div className="space-y-4">
              {data.education.map((edu) => (
                <article key={`${edu.institution}-${edu.degree}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <h3 className="font-semibold">{edu.degree}</h3>
                    <span className="text-sm text-muted-foreground print:text-black">
                      {edu.startDate} – {edu.endDate}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground print:text-black">
                    {edu.institution}
                    {edu.location ? ` · ${edu.location}` : ''}
                  </p>
                  {edu.details && edu.details.length > 0 && (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground print:text-black">
                      {edu.details.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Habilidades */}
        <section className="mb-10">
          <SectionTitle>{t('sectionSkills')}</SectionTitle>
          <dl className="space-y-3">
            {Object.entries(data.skills).map(([category, items]) =>
              items.length > 0 ? (
                <div key={category} className="sm:flex sm:gap-4">
                  <dt className="shrink-0 font-semibold sm:w-44">{category}</dt>
                  <dd className="text-sm text-muted-foreground print:text-black">
                    {items.join(', ')}
                  </dd>
                </div>
              ) : null
            )}
          </dl>
        </section>

        {/* Idiomas */}
        {data.languages.length > 0 && (
          <section className="mb-10">
            <SectionTitle>{t('sectionLanguages')}</SectionTitle>
            <ul className="space-y-1 text-sm">
              {data.languages.map((lang) => (
                <li key={lang.name}>
                  <span className="font-semibold">{lang.name}:</span>{' '}
                  <span className="text-muted-foreground print:text-black">{lang.level}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Contacto */}
        <section>
          <SectionTitle>{t('sectionContact')}</SectionTitle>
          <ul className="space-y-1 text-sm text-muted-foreground print:text-black">
            <li>
              <span className="font-semibold text-foreground print:text-black">
                {t('emailLabel')}
              </span>{' '}
              <ObfuscatedEmail
                user="jnzader"
                domain="gmail.com"
                className="hover:text-primary transition-colors"
              />
            </li>
            <li>
              <span className="font-semibold text-foreground print:text-black">
                {t('linkedinLabel')}
              </span>{' '}
              <ExternalLink
                href={data.personalInfo.linkedin}
                trackLabel="LinkedIn"
                className="hover:text-primary transition-colors"
              >
                {data.personalInfo.linkedin.replace(/^https?:\/\//, '')}
              </ExternalLink>
            </li>
            <li>
              <span className="font-semibold text-foreground print:text-black">
                {t('githubLabel')}
              </span>{' '}
              <ExternalLink
                href={data.personalInfo.github}
                trackLabel="GitHub"
                className="hover:text-primary transition-colors"
              >
                {data.personalInfo.github.replace(/^https?:\/\//, '')}
              </ExternalLink>
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
