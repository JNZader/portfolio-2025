'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { Input } from '@/components/ui/input';
import { useGdprRequest } from '@/hooks/useGdprRequest';
import { type DataDeletionInput, dataDeletionSchema } from '@/lib/validations/gdpr';

export function DataDeletionForm() {
  const t = useTranslations('Gdpr');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingData, setPendingData] = useState<DataDeletionInput | null>(null);
  const { isLoading, submit } = useGdprRequest(
    '/api/data-deletion',
    'Error al eliminar datos',
    'Revisa tu email para confirmar la eliminación'
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DataDeletionInput>({
    resolver: zodResolver(dataDeletionSchema),
  });

  const onSubmit = (data: DataDeletionInput) => {
    // Store data and show confirmation modal
    setPendingData(data);
    setShowConfirmation(true);
  };

  const handleConfirmedDeletion = async () => {
    if (!pendingData) return;
    setShowConfirmation(false);
    await submit(pendingData, () => {
      reset();
      setPendingData(null);
    });
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setPendingData(null);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-4">
          <p className="text-sm text-destructive font-medium">{t('warnTitle')}</p>
          <p className="text-xs text-destructive/80 mt-1">{t('warnBody')}</p>
        </div>

        <div>
          <label htmlFor="deletion-email" className="block text-sm font-medium mb-2">
            {t('emailLabel')}
          </label>
          <Input
            id="deletion-email"
            type="email"
            placeholder={t('emailPlaceholder')}
            autoComplete="email"
            aria-describedby={errors.email ? 'deletion-email-error' : undefined}
            {...register('email')}
          />
          {errors.email && (
            <p id="deletion-email-error" className="mt-1 text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="deletion-reason" className="block text-sm font-medium mb-2">
            {t('reasonLabel')}
          </label>
          <textarea
            id="deletion-reason"
            placeholder={t('reasonPlaceholder')}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            rows={3}
            aria-describedby={errors.reason ? 'deletion-reason-error' : undefined}
            {...register('reason')}
          />
          {errors.reason && (
            <p id="deletion-reason-error" className="mt-1 text-sm text-destructive">
              {errors.reason.message}
            </p>
          )}
        </div>

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="deletion-confirmation"
            className="mt-1"
            aria-describedby={errors.confirmation ? 'deletion-confirmation-error' : undefined}
            {...register('confirmation')}
          />
          <label htmlFor="deletion-confirmation" className="text-sm">
            {t('confirmCheckbox')}
          </label>
        </div>
        {errors.confirmation && (
          <p id="deletion-confirmation-error" className="text-sm text-destructive">
            {errors.confirmation.message}
          </p>
        )}

        <Button type="submit" variant="destructive" disabled={isLoading}>
          {isLoading ? t('submitting') : t('deleteSubmit')}
        </Button>
      </form>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={handleCancelConfirmation}
        onConfirm={handleConfirmedDeletion}
        title={t('modalTitle')}
        description={t('modalDescription')}
        confirmText={t('modalConfirm')}
        cancelText={t('modalCancel')}
        variant="destructive"
        isLoading={isLoading}
      />
    </>
  );
}
