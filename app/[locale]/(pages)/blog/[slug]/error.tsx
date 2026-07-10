'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Container from '@/components/ui/Container';
import { Link } from '@/i18n/navigation';
import { logger } from '@/lib/monitoring/logger';

export default function PostError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  const t = useTranslations('Blog');
  useEffect(() => {
    logger.error('Post page error', error, {
      service: 'blog',
      path: '/blog/[slug]',
    });
  }, [error]);

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="mb-4 text-3xl font-bold">{t('postErrorTitle')}</h1>
        <p className="mb-8 text-[var(--color-muted-foreground)]">{t('postErrorBody')}</p>
        <div className="flex justify-center gap-4">
          <Button onClick={reset}>{t('retry')}</Button>
          <Button asChild variant="outline">
            <Link href="/blog">{t('backBlog')}</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
