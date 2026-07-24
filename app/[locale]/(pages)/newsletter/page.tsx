import { CircleCheck, FileText, Gift, Lightbulb, Rocket } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';
import { NewsletterForm } from '@/components/newsletter/NewsletterForm';
import Container from '@/components/ui/Container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InteriorHero } from '@/components/ui/InteriorHero';
import Section from '@/components/ui/Section';
import { localeAlternates } from '@/lib/seo/alternates';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('NewsletterPage');
  return {
    title: t('metaTitle'),
    alternates: await localeAlternates('/newsletter'),
    description: t('metaDescription'),
  };
}

export default async function NewsletterPage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('NewsletterPage');
  return (
    <>
      {/* Hero — shared InteriorHero (same language as projects/contact/blog) */}
      <InteriorHero variant="newsletter" title={t('heroTitle')} description={t('heroSubtitle')} />

      {/* Content */}
      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
            {/* Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>{t('subscribeNow')}</CardTitle>
                  <CardDescription>{t('confirmationNote')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <NewsletterForm />
                </CardContent>
              </Card>

              {/* Benefits */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">{t('benefitsHeading')}</h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  <BenefitCard
                    icon={<FileText className="h-6 w-6" aria-hidden="true" />}
                    title={t('b1t')}
                    description={t('b1d')}
                  />
                  <BenefitCard
                    icon={<Lightbulb className="h-6 w-6" aria-hidden="true" />}
                    title={t('b2t')}
                    description={t('b2d')}
                  />
                  <BenefitCard
                    icon={<Rocket className="h-6 w-6" aria-hidden="true" />}
                    title={t('b3t')}
                    description={t('b3d')}
                  />
                  <BenefitCard
                    icon={<Gift className="h-6 w-6" aria-hidden="true" />}
                    title={t('b4t')}
                    description={t('b4d')}
                  />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('statsTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <StatItem label={t('statFrequency')} value={t('statFrequencyValue')} />
                </CardContent>
              </Card>

              {/* Privacy */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('privacyTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CircleCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                    {t('p1')}
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                    {t('p2')}
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                    {t('p3')}
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                    {t('p4')}
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                    {t('p5')}
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}

function BenefitCard({
  icon,
  title,
  description,
}: Readonly<{
  icon: ReactNode;
  title: string;
  description: string;
}>) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function StatItem({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
