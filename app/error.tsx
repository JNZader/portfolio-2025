'use client';

import { useEffect, useState } from 'react';
import { ErrorFeedback } from '@/components/error/ErrorFeedback';
import { Button } from '@/components/ui/button';
import Container from '@/components/ui/Container';
import { trackError } from '@/lib/analytics/errors';

// biome-ignore lint/suspicious/noShadowRestrictedNames: Next.js requires this exact name for error boundaries
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [eventId, setEventId] = useState<string | undefined>();

  useEffect(() => {
    // Track error to analytics and capture Sentry eventId
    const id = trackError(error, {
      digest: error.digest,
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
    });
    setEventId(id);
  }, [error]);

  return (
    <Container className="flex min-h-screen flex-col items-center justify-center py-24">
      <div className="text-center space-y-6 max-w-md">
        {/* Error Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <title>Error</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <div>
          <h2 className="text-2xl font-bold mb-2">¡Algo salió mal!</h2>
          <p className="text-[var(--color-muted-foreground)]">
            Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
          </p>
        </div>

        {/* Error Details (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-red-500/10 rounded-lg text-left">
            <p className="text-xs font-mono text-red-500 break-all">{error.message}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => reset()} size="lg">
            Intentar de nuevo
          </Button>
          <Button
            onClick={() => {
              window.location.href = '/';
            }}
            variant="outline"
            size="lg"
          >
            Volver al inicio
          </Button>
        </div>

        {/* User Feedback Widget */}
        {eventId && (
          <div className="mt-4">
            <ErrorFeedback eventId={eventId} />
          </div>
        )}

        {/* Help text */}
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Si el problema persiste, por favor{' '}
          <a href="/contacto" className="text-primary hover:underline">
            contáctanos
          </a>
          .
        </p>
      </div>
    </Container>
  );
}
