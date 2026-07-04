'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGdprRequest } from '@/hooks/useGdprRequest';
import { type DataExportInput, dataExportSchema } from '@/lib/validations/gdpr';

export function DataRequestForm() {
  const t = useTranslations('Gdpr');
  const { isLoading, submit } = useGdprRequest(
    '/api/data-export',
    t('exportErrorFallback'),
    t('exportSuccessFallback')
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DataExportInput>({
    resolver: zodResolver(dataExportSchema),
  });

  const onSubmit = async (data: DataExportInput) => {
    await submit(data, reset);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          {t('emailLabel')}
        </label>
        <Input
          id="email"
          type="email"
          placeholder={t('emailPlaceholder')}
          autoComplete="email"
          {...register('email')}
        />
        {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? t('submitting') : t('exportSubmit')}
      </Button>

      <p className="text-sm text-[var(--color-foreground)]/60">{t('exportHelper')}</p>
    </form>
  );
}
