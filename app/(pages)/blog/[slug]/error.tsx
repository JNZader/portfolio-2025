'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Container from '@/components/ui/Container';

export default function PostError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Post page error:', error);
  }, [error]);

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="mb-4 text-3xl font-bold">Error al cargar el post</h1>
        <p className="mb-8 text-[var(--color-muted-foreground)]">
          No pudimos cargar este artículo. Por favor, intenta de nuevo.
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={reset}>Intentar de nuevo</Button>
          <Button asChild variant="outline">
            <a href="/blog">Volver al blog</a>
          </Button>
        </div>
      </div>
    </Container>
  );
}
