'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type DataDeletionInput, dataDeletionSchema } from '@/lib/validations/gdpr';

export function DataDeletionForm() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DataDeletionInput>({
    resolver: zodResolver(dataDeletionSchema),
  });

  const onSubmit = async (data: DataDeletionInput) => {
    // Doble confirmación
    const confirmed = window.confirm(
      '⚠️ ADVERTENCIA: Esta acción es IRREVERSIBLE.\n\n' +
        'Se eliminarán permanentemente:\n' +
        '• Tu suscripción a la newsletter\n' +
        '• Todas tus preferencias\n' +
        '• Historial de consentimientos\n\n' +
        '¿Estás seguro de continuar?'
    );

    if (!confirmed) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/data-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || 'Error al eliminar datos');
        return;
      }

      toast.success('Todos tus datos han sido eliminados permanentemente');
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar datos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4 mb-4">
        <p className="text-sm text-red-800 dark:text-red-200 font-medium">
          ⚠️ Advertencia: Esta acción es irreversible
        </p>
        <p className="text-xs text-red-600 dark:text-red-300 mt-1">
          Se eliminarán permanentemente todos los datos asociados a tu email.
        </p>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email
        </label>
        <Input id="email" type="email" placeholder="tu@email.com" {...register('email')} />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="reason" className="block text-sm font-medium mb-2">
          Razón (opcional)
        </label>
        <textarea
          id="reason"
          placeholder="¿Por qué deseas eliminar tus datos?"
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm"
          rows={3}
          {...register('reason')}
        />
        {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>}
      </div>

      <div className="flex items-start gap-2">
        <input type="checkbox" id="confirmation" className="mt-1" {...register('confirmation')} />
        <label htmlFor="confirmation" className="text-sm">
          Entiendo que esta acción es irreversible y se eliminarán todos mis datos
        </label>
      </div>
      {errors.confirmation && <p className="text-sm text-red-600">{errors.confirmation.message}</p>}

      <Button type="submit" variant="destructive" disabled={isLoading}>
        {isLoading ? 'Eliminando...' : 'Eliminar mis datos'}
      </Button>
    </form>
  );
}
