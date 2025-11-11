'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Blog page error:', error);
  }, [error]);

  return (
    <Section>
      <Container>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 rounded-full bg-[var(--color-error-light)] p-6">
            <ExclamationIcon className="h-12 w-12 text-[var(--color-error)]" />
          </div>

          <h2 className="mb-2 text-2xl font-bold">Algo salió mal</h2>
          <p className="mb-6 max-w-md text-[var(--color-muted-foreground)]">
            No pudimos cargar los posts del blog. Por favor, intenta de nuevo.
          </p>

          <div className="flex gap-4">
            <Button onClick={reset} variant="default">
              Intentar de nuevo
            </Button>
            <Button asChild variant="outline">
              <a href="/">Volver al inicio</a>
            </Button>
          </div>

          {/* Error details (solo en dev) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-8 max-w-2xl text-left">
              <summary className="cursor-pointer text-sm font-medium">Detalles del error</summary>
              <pre className="mt-2 overflow-auto rounded-lg bg-[var(--color-muted)] p-4 text-xs">
                {error.message}
              </pre>
            </details>
          )}
        </div>
      </Container>
    </Section>
  );
}

function ExclamationIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
  );
}
