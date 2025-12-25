'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { Input } from '@/components/ui/input';
import { showError, showSuccess } from '@/lib/utils/toast';
import { type DataDeletionInput, dataDeletionSchema } from '@/lib/validations/gdpr';

export function DataDeletionForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingData, setPendingData] = useState<DataDeletionInput | null>(null);

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

    setIsLoading(true);
    setShowConfirmation(false);

    try {
      const response = await fetch('/api/data-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingData),
      });

      const result = await response.json();

      if (!response.ok) {
        showError(result.message ?? 'Error al eliminar datos');
        return;
      }

      showSuccess(result.message ?? 'Revisa tu email para confirmar la eliminación');
      reset();
      setPendingData(null);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error al eliminar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setPendingData(null);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-4">
          <p className="text-sm text-destructive font-medium">
            Advertencia: Esta acción es irreversible
          </p>
          <p className="text-xs text-destructive/80 mt-1">
            Se eliminarán permanentemente todos los datos asociados a tu email.
          </p>
        </div>

        <div>
          <label htmlFor="deletion-email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <Input
            id="deletion-email"
            type="email"
            placeholder="tu@email.com"
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
            Razón (opcional)
          </label>
          <textarea
            id="deletion-reason"
            placeholder="¿Por qué deseas eliminar tus datos?"
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
            Entiendo que esta acción es irreversible y se eliminarán todos mis datos
          </label>
        </div>
        {errors.confirmation && (
          <p id="deletion-confirmation-error" className="text-sm text-destructive">
            {errors.confirmation.message}
          </p>
        )}

        <Button type="submit" variant="destructive" disabled={isLoading}>
          {isLoading ? 'Enviando...' : 'Solicitar eliminación'}
        </Button>
      </form>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={handleCancelConfirmation}
        onConfirm={handleConfirmedDeletion}
        title="Confirmar eliminación de datos"
        description="Esta acción es IRREVERSIBLE. Se eliminarán permanentemente: tu suscripción a la newsletter, todas tus preferencias e historial de consentimientos."
        confirmText="Sí, eliminar mis datos"
        cancelText="Cancelar"
        variant="destructive"
        isLoading={isLoading}
      />
    </>
  );
}
