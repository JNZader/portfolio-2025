'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGdprRequest } from '@/hooks/useGdprRequest';
import { type DataExportInput, dataExportSchema } from '@/lib/validations/gdpr';

export function DataRequestForm() {
  const { isLoading, submit } = useGdprRequest(
    '/api/data-export',
    'Error al solicitar datos',
    'Revisa tu email para descargar tus datos'
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
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          {...register('email')}
        />
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
