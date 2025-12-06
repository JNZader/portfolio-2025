'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { subscribeToNewsletter } from '@/app/actions/newsletter';
import { useAnnouncer } from '@/components/a11y/ScreenReaderAnnouncer';
import { InputField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/button';
import { MailIcon, SpinnerIcon } from '@/components/ui/icons';
import { trackNewsletterSignup } from '@/lib/analytics/events';
import { logger } from '@/lib/monitoring/logger';
import { showError, showSuccess } from '@/lib/utils/toast';
import { type NewsletterFormData, newsletterSchema } from '@/lib/validations/newsletter';

export function NewsletterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const { announce } = useAnnouncer();

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
    setStatusMessage(''); // Clear previous messages

    try {
      const formData = new FormData();
      formData.append('email', data.email);

      const result = await subscribeToNewsletter(formData);

      if (result.success) {
        // Track newsletter signup
        trackNewsletterSignup(data.email);

        // Set message before toast for immediate visibility
        setStatusMessage(result.message);
        announce(result.message, 'polite');
        reset();

        showSuccess(result.message);
      } else {
        // Set message before toast for immediate visibility
        setStatusMessage(result.error);
        announce(result.error, 'assertive');

        showError(result.error);
      }
    } catch (error) {
      logger.error('Newsletter subscription error', error as Error, {
        service: 'newsletter-form',
      });
      const errorMsg = 'Error inesperado al suscribirse al newsletter';

      // Set message before toast for immediate visibility
      setStatusMessage(errorMsg);
      announce(errorMsg, 'assertive');

      showError('Error inesperado. Por favor, intenta más tarde.');
    } finally {
      setIsSubmitting(false);
    }
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
