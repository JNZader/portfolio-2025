import type { Metadata } from 'next';
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import { InteriorHero } from '@/components/ui/InteriorHero';
import Section from '@/components/ui/Section';
import { localeAlternates } from '@/lib/seo/alternates';
import { PrivacyEn } from './PrivacyEn';
import { PrivacyEs } from './PrivacyEs';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Privacy');
  return {
    title: t('metaTitle'),
    alternates: await localeAlternates('/privacy'),
    description: t('metaDescription'),
  };
}

export default async function PrivacyPage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const current = await getLocale();
  const t = await getTranslations('Privacy');

  return (
    <>
      {/* Hero — shared InteriorHero (same language as projects/contact/blog) */}
      <InteriorHero variant="legal" title={t('heroTitle')} description={t('heroSubtitle')} />

      <Section>
        <article className="prose prose-lg dark:prose-invert max-w-none">
          {current === 'en' ? <PrivacyEn /> : <PrivacyEs />}
        </article>
      </Section>
    </>
  );
}
