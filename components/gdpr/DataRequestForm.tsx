'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { showError, showSuccess } from '@/lib/utils/toast';
import { type DataExportInput, dataExportSchema } from '@/lib/validations/gdpr';

export function DataRequestForm() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DataExportInput>({
    resolver: zodResolver(dataExportSchema),
  });

  const onSubmit = async (data: DataExportInput) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/data-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        showError(result.message ?? 'Error al solicitar datos');
        return;
      }

      showSuccess(result.message ?? 'Revisa tu email para descargar tus datos');
      reset();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error al exportar datos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email
        </label>
        <Input id="email" type="email" placeholder="tu@email.com" {...register('email')} />
        {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Enviando...' : 'Solicitar exportación'}
      </Button>

      <p className="text-sm text-[var(--color-foreground)]/60">
        Recibirás un email con un enlace para descargar tus datos en formato JSON.
      </p>
    </form>
  );
}
