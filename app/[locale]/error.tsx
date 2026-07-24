'use client';

import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { ErrorFeedback } from '@/components/error/ErrorFeedback';
import { Button } from '@/components/ui/button';
import Container from '@/components/ui/Container';
import { Link } from '@/i18n/navigation';
import { trackError } from '@/lib/analytics/errors';

export default function ErrorPage({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  const [eventId, setEventId] = useState<string | undefined>();
  const t = useTranslations('Error');
  const tc = useTranslations('Common');

  useEffect(() => {
    // Track error to analytics and capture Sentry eventId
    const id = trackError(error, {
      digest: error.digest,
      page: globalThis.location.pathname,
      timestamp: new Date().toISOString(),
    });
    setEventId(id);
  }, [error]);

  return (
    <Container className="flex min-h-[50vh] flex-col items-center justify-center py-24">
      <div className="text-center space-y-6 max-w-md">
        {/* Error Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-error lucide-alert-triangle" aria-hidden="true" />
        </div>

        {/* Error Message */}
        <div>
          <h2 className="text-2xl font-bold mb-2">{t('title')}</h2>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>

        {/* Error Details (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-error/10 rounded-lg text-left">
            <p className="text-xs font-mono text-error break-all">{error.message}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => reset()} size="lg">
            {t('retry')}
          </Button>
          <Button
            onClick={() => {
              globalThis.location.href = '/';
            }}
            variant="outline"
            size="lg"
          >
            {tc('backHome')}
          </Button>
        </div>

        {/* User Feedback Widget */}
        {eventId && (
          <div className="mt-4">
            <ErrorFeedback eventId={eventId} />
          </div>
        )}

        {/* Help text */}
        <p className="text-sm text-muted-foreground">
          {t.rich('help', {
            link: (chunks) => (
              <Link href="/contacto" className="text-primary hover:underline">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </div>
    </Container>
  );
}
