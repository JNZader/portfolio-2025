'use client';

import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import { Link } from '@/i18n/navigation';
import { logger } from '@/lib/monitoring/logger';

export default function BlogError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  const t = useTranslations('Blog');
  useEffect(() => {
    logger.error('Blog page error', error, {
      service: 'blog',
      path: '/blog',
    });
  }, [error]);

  return (
    <Section>
      <Container>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 rounded-full bg-error/10 p-6">
            <AlertTriangle className="h-12 w-12 text-error" aria-hidden="true" />
          </div>

          <h2 className="mb-2 text-2xl font-bold">{t('errorTitle')}</h2>
          <p className="mb-6 max-w-md text-muted-foreground">{t('errorBody')}</p>

          <div className="flex gap-4">
            <Button onClick={reset} variant="default">
              {t('retry')}
            </Button>
            <Button asChild variant="outline">
              <Link href="/">{t('backHome')}</Link>
            </Button>
          </div>

          {/* Error details (solo en dev) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-8 max-w-2xl text-left">
              <summary className="cursor-pointer text-sm font-medium">{t('errorDetails')}</summary>
              <pre className="mt-2 overflow-auto rounded-lg bg-muted p-4 text-xs">
                {error.message}
              </pre>
            </details>
          )}
        </div>
      </Container>
    </Section>
  );
}
