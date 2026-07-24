import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DataDeletionForm } from '@/components/gdpr/DataDeletionForm';
import { DataRequestForm } from '@/components/gdpr/DataRequestForm';
import { InteriorHero } from '@/components/ui/InteriorHero';
import { ObfuscatedEmail } from '@/components/ui/ObfuscatedEmail';
import Section from '@/components/ui/Section';
import { localeAlternates } from '@/lib/seo/alternates';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('DataRequest');
  return {
    title: t('metaTitle'),
    alternates: await localeAlternates('/data-request'),
    description: t('metaDescription'),
  };
}

const email = { user: 'jnzader', domain: 'gmail.com' } as const;
const bold = (chunks: React.ReactNode) => <strong>{chunks}</strong>;

export default async function DataRequestPage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('DataRequest');
  return (
    <>
      {/* Hero — shared InteriorHero (same language as projects/contact/blog) */}
      <InteriorHero variant="legal" title={t('heroTitle')} description={t('heroSubtitle')} />

      <Section>
        <div className="max-w-3xl mx-auto">
          <div className="space-y-12">
            {/* Export data */}
            <div className="border border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-2">{t('exportTitle')}</h2>
              <p className="text-foreground/70 mb-6">{t('exportDesc')}</p>
              <DataRequestForm />
            </div>

            {/* Delete data */}
            <div className="border border-destructive/30 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-2 text-destructive">{t('deleteTitle')}</h2>
              <p className="text-foreground/70 mb-6">{t.rich('deleteDesc', { b: bold })}</p>
              <DataDeletionForm />
            </div>

            {/* Additional info */}
            <div className="bg-muted rounded-lg p-6">
              <h3 className="font-semibold mb-3">{t('infoTitle')}</h3>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li>• {t.rich('info1', { b: bold })}</li>
                <li>• {t.rich('info2', { b: bold })}</li>
                <li>• {t.rich('info3', { b: bold })}</li>
                <li>• {t.rich('info4', { b: bold })}</li>
                <li>
                  • <strong>{t('contactBold')}</strong> {t('info5Prefix')}
                  <ObfuscatedEmail {...email} className="text-primary" />
                </li>
              </ul>
            </div>

            {/* Other rights */}
            <div>
              <h3 className="font-semibold mb-3">{t('otherTitle')}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="border border rounded-lg p-4">
                  <h4 className="font-medium mb-2">{t('rectTitle')}</h4>
                  <p className="text-sm text-foreground/70">
                    {t('rectPrefix')}
                    <ObfuscatedEmail {...email} className="text-primary" />
                    {t('rectSuffix')}
                  </p>
                </div>

                <div className="border border rounded-lg p-4">
                  <h4 className="font-medium mb-2">{t('portTitle')}</h4>
                  <p className="text-sm text-foreground/70">{t('portDesc')}</p>
                </div>

                <div className="border border rounded-lg p-4">
                  <h4 className="font-medium mb-2">{t('oppTitle')}</h4>
                  <p className="text-sm text-foreground/70">{t('oppDesc')}</p>
                </div>

                <div className="border border rounded-lg p-4">
                  <h4 className="font-medium mb-2">{t('limTitle')}</h4>
                  <p className="text-sm text-foreground/70">
                    {t('limPrefix')}
                    <ObfuscatedEmail {...email} className="text-primary" />
                    {t('limSuffix')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
