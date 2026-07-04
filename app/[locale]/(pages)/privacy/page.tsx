import type { Metadata } from 'next';
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';
import Container from '@/components/ui/Container';
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

  return (
    <Container className="py-12">
      <Section>
        <article className="prose prose-lg dark:prose-invert max-w-none">
          {current === 'en' ? <PrivacyEn /> : <PrivacyEs />}
        </article>
      </Section>
    </Container>
  );
}
