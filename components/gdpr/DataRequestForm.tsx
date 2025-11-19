'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || 'Error al solicitar datos');
        return;
      }

      // Descargar JSON
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `data-export-${data.email}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Datos exportados correctamente');
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al exportar datos');
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
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Exportando...' : 'Exportar mis datos'}
      </Button>

      <p className="text-sm text-[var(--color-foreground)]/60">
        Recibirás un archivo JSON con toda la información que tenemos sobre ti.
      </p>
    </form>
  );
}
