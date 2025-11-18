'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { subscribeToNewsletter } from '@/app/actions/newsletter';
import { InputField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/button';
import { type NewsletterFormData, newsletterSchema } from '@/lib/validations/newsletter';

export function NewsletterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = async (data: NewsletterFormData) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('email', data.email);

      const result = await subscribeToNewsletter(formData);

      if (result.success) {
        toast.success(result.message, {
          duration: 5000,
          position: 'bottom-center',
        });
        reset();
      } else {
        toast.error(result.error, {
          duration: 4000,
          position: 'bottom-center',
        });
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('Error inesperado. Por favor, intenta más tarde.', {
        duration: 4000,
        position: 'bottom-center',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <InputField
        label="Email"
        type="email"
        placeholder="tu@email.com"
        error={errors.email?.message}
        required
        {...register('email')}
      />

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
            Suscribiendo...
          </>
        ) : (
          <>
            <MailIcon className="mr-2 h-4 w-4" />
            Suscribirme
          </>
        )}
      </Button>

      <p className="text-xs text-center text-[var(--color-muted-foreground)]">
        Te enviaremos un email de confirmación. No spam, prometido.
      </p>
    </form>
  );
}

// Icons
function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
