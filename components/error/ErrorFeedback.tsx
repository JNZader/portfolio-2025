'use client';

import * as Sentry from '@sentry/nextjs';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function ErrorFeedback({ eventId }: Readonly<{ eventId?: string }>) {
  const t = useTranslations('ErrorFeedback');
  const [submitted, setSubmitted] = useState(false);

  const handleFeedback = () => {
    if (!eventId) return;

    Sentry.showReportDialog({
      eventId,
      title: t('title'),
      subtitle: t('subtitle'),
      subtitle2: t('subtitle2'),
      labelName: t('labelName'),
      labelEmail: t('labelEmail'),
      labelComments: t('labelComments'),
      labelClose: t('labelClose'),
      labelSubmit: t('labelSubmit'),
      successMessage: t('success'),
    });

    setSubmitted(true);
  };

  if (submitted) {
    return <p className="text-sm text-green-600">{t('success')}</p>;
  }

  return (
    <Button variant="outline" onClick={handleFeedback}>
      {t('report')}
    </Button>
  );
}
