import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { HeroBackground } from '@/components/ui/HeroBackground';
import { Link } from '@/i18n/navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('NotFound');
  return {
    title: t('metaTitle'),
  };
}

export default async function NotFound() {
  const t = await getTranslations('NotFound');
  const tc = await getTranslations('Common');
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 relative overflow-hidden">
      <HeroBackground showBlobs showDotPattern={false} />

      <div className="text-center space-y-6 relative z-10">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="text-3xl font-semibold text-foreground">{t('title')}</h2>
        <p className="text-muted-foreground">{t('description')}</p>
        <Button asChild className="mt-8">
          <Link href="/">{tc('backHome')}</Link>
        </Button>
      </div>
    </div>
  );
}
