'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { sendContactEmail } from '@/app/actions/contact';
import { Button } from '@/components/ui/button';
import { type ContactFormData, contactSchema } from '@/lib/validations/contact';
import { InputField, TextareaField } from './FormField';

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      // Crear FormData para Server Action
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('subject', data.subject);
      formData.append('message', data.message);

      // Llamar Server Action
      const result = await sendContactEmail(formData);

      if (result.success) {
        toast.success(result.message, {
          duration: 5000,
          position: 'bottom-center',
        });
        reset(); // Limpiar formulario
      } else {
        toast.error(result.error, {
          duration: 4000,
          position: 'bottom-center',
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Error inesperado. Por favor, intenta más tarde.', {
        duration: 4000,
        position: 'bottom-center',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Name */}
      <InputField
        label="Nombre"
        type="text"
        placeholder="Juan Pérez"
        error={errors.name?.message}
        required
        {...register('name')}
      />

      {/* Email */}
      <InputField
        label="Email"
        type="email"
        placeholder="juan@example.com"
        error={errors.email?.message}
        required
        {...register('email')}
      />

      {/* Subject */}
      <InputField
        label="Asunto"
        type="text"
        placeholder="Consulta sobre desarrollo web"
        error={errors.subject?.message}
        required
        {...register('subject')}
      />

      {/* Message */}
      <TextareaField
        label="Mensaje"
        placeholder="Escribe tu mensaje aquí..."
        rows={6}
        error={errors.message?.message}
        required
        {...register('message')}
      />

      {/* Submit button */}
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <SendIcon className="mr-2 h-4 w-4" />
            Enviar Mensaje
          </>
        )}
      </Button>

      {/* Helper text */}
      <p className="text-center text-sm text-[var(--color-muted-foreground)]">
        Respondo normalmente en 24-48 horas hábiles
      </p>
    </form>
  );
}

// Icons
function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      role="img"
      aria-label="Enviar mensaje"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
      />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" role="img" aria-label="Enviando">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
