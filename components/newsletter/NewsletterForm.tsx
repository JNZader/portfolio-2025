'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAnnouncer } from '@/components/a11y/ScreenReaderAnnouncer';
import { InputField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/button';
import { MailIcon, SpinnerIcon } from '@/components/ui/icons';
import { useNewsletterSubscription } from '@/hooks/useNewsletterSubscription';
import { type NewsletterFormData, newsletterSchema } from '@/lib/validations/newsletter';

export function NewsletterForm() {
  const [statusMessage, setStatusMessage] = useState('');
  const { announce } = useAnnouncer();

  // Use shared hook for subscription logic
  const { status, subscribe } = useNewsletterSubscription({
    onSuccess: (message) => {
      setStatusMessage(message);
      announce(message, 'polite');
      reset();
    },
    onError: (error) => {
      setStatusMessage(error);
      announce(error, 'assertive');
    },
    resetDelay: 0, // We handle reset manually via react-hook-form
  });

  const isSubmitting = status === 'loading';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = async (data: NewsletterFormData) => {
    setStatusMessage(''); // Clear previous messages
    await subscribe(data.email);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      aria-label="Newsletter subscription"
      noValidate
    >
      <fieldset className="border-0 p-0 m-0">
        <legend className="sr-only">Suscripción al newsletter</legend>

        <InputField
          label="Email"
          type="email"
          placeholder="tu@email.com"
          error={errors.email?.message}
          required
          {...register('email')}
        />

        <Button type="submit" size="lg" className="w-full mt-4" disabled={isSubmitting}>
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
      </fieldset>

      <p className="text-xs text-center text-muted-foreground">
        Te enviaremos un email de confirmación. No spam, prometido.
      </p>

      {/* Mensaje de estado para tests - siempre renderizado */}
      <output
        aria-live="polite"
        aria-atomic="true"
        className="text-sm text-center mt-2 min-h-[24px] text-foreground"
        data-testid="newsletter-status"
      >
        {statusMessage}
      </output>
    </form>
  );
}
