'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useForm } from 'react-hook-form';
import { sendContactEmail } from '@/app/actions/contact';
import { useAnnouncer } from '@/components/a11y/ScreenReaderAnnouncer';
import { Button } from '@/components/ui/button';
import { SendIcon, SpinnerIcon } from '@/components/ui/icons';
import { trackContactSubmit } from '@/lib/analytics/events';
import { logger } from '@/lib/monitoring/logger';
import { showError, showSuccess } from '@/lib/utils/toast';
import {
  CONTACT_REASONS,
  CONTACT_TIMELINES,
  type ContactFormData,
  contactSchema,
} from '@/lib/validations/contact';
import { quickValidateEmail } from '@/lib/validations/email-validator-client';
import { InputField, SelectField, type SelectOption, TextareaField } from './FormField';

// Capitalize a key to its message suffix, e.g. 'job' → 'reasonJob'.
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const [pendingData, setPendingData] = useState<ContactFormData | null>(null);
  const { announce } = useAnnouncer();
  const t = useTranslations('Contact');
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Option labels come from the Contact namespace; the keys (values) stay stable.
  const reasonOptions: SelectOption[] = Object.keys(CONTACT_REASONS).map((value) => ({
    value,
    label: t(`reason${cap(value)}`),
  }));
  const timelineOptions: SelectOption[] = Object.keys(CONTACT_TIMELINES).map((value) => ({
    value,
    label: t(`timeline${cap(value)}`),
  }));

  // El panel de sugerencia se inserta arriba del form: sin foco un usuario de
  // teclado/SR envía y "no pasa nada". Llevamos el foco al panel al aparecer.
  useEffect(() => {
    if (emailSuggestion) suggestionRef.current?.focus();
  }, [emailSuggestion]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    // Force immediate render of loading state for tests
    flushSync(() => {
      setIsSubmitting(true);
    });

    try {
      // Validación rápida del email (typos, desechables)
      const emailCheck = quickValidateEmail(data.email);

      // Si hay sugerencia de typo, mostrar confirmación
      if (emailCheck.suggestion && !pendingData) {
        setEmailSuggestion(emailCheck.suggestion);
        setPendingData(data);
        announce(t('suggestAnnounce', { suggestion: emailCheck.suggestion }), 'assertive');
        setIsSubmitting(false);
        return;
      }

      // Si hay error (desechable), rechazar
      if (!emailCheck.isValid && !emailCheck.suggestion) {
        showError(emailCheck.reason ?? t('errorEmailInvalid'));
        setIsSubmitting(false);
        return;
      }
      // Crear FormData para Server Action
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('reason', data.reason);
      if (data.company) formData.append('company', data.company);
      if (data.timeline) formData.append('timeline', data.timeline);
      formData.append('message', data.message);

      // Llamar Server Action
      const result = await sendContactEmail(formData);

      if (result.success) {
        // Track contact form submission
        trackContactSubmit();

        showSuccess(result.message);
        announce(t('announceSuccess'), 'polite');
        reset(); // Limpiar formulario
        setEmailSuggestion(null);
        setPendingData(null);
      } else {
        showError(result.error);
        announce(t('announceError'), 'assertive');
      }
    } catch (error) {
      logger.error('Form submission error', error as Error, {
        service: 'contact-form',
      });
      showError(t('errorUnexpected'));
      announce(t('announceUnexpected'), 'assertive');
    } finally {
      setIsSubmitting(false);
    }
  };

  const useSuggestedEmail = () => {
    if (!emailSuggestion || !pendingData) return;

    // Actualizar el valor del email con la sugerencia
    setValue('email', emailSuggestion);

    // Enviar con el email corregido
    const correctedData = { ...pendingData, email: emailSuggestion };
    setPendingData(null);
    setEmailSuggestion(null);

    // Re-enviar el formulario
    onSubmit(correctedData);
  };

  const keepOriginalEmail = () => {
    if (!pendingData) return;

    // Continuar con el email original
    setEmailSuggestion(null);
    onSubmit(pendingData);
    setPendingData(null);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Sugerencia de email */}
      {emailSuggestion && (
        <div
          ref={suggestionRef}
          role="alert"
          tabIndex={-1}
          className="rounded-lg border-2 border-[var(--color-primary)] bg-[var(--color-primary)]/10 p-4"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <p className="font-medium mb-2">{t('suggestTitle')}</p>
              <p className="text-sm text-[var(--color-muted-foreground)] mb-3">
                {t('suggestBody')}
              </p>
              <p className="font-mono font-bold text-[var(--color-primary)] mb-4">
                {emailSuggestion}
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  type="button"
                  onClick={useSuggestedEmail}
                  size="sm"
                  className="flex-1 sm:flex-initial"
                >
                  {t('suggestYes')}
                </Button>
                <Button
                  type="button"
                  onClick={keepOriginalEmail}
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-initial"
                >
                  {t('suggestNo')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Name */}
      <InputField
        label={t('nameLabel')}
        type="text"
        error={errors.name?.message}
        required
        autoComplete="name"
        {...register('name')}
      />

      {/* Email */}
      <InputField
        label={t('emailLabel')}
        type="email"
        error={errors.email?.message}
        required
        autoComplete="email"
        {...register('email')}
      />

      {/* Reason (reemplaza al antiguo "Asunto") */}
      <SelectField
        label={t('reasonLabel')}
        placeholder={t('reasonPlaceholder')}
        options={reasonOptions}
        error={errors.reason?.message}
        required
        {...register('reason')}
      />

      {/* Company (opcional) */}
      <InputField
        label={t('companyLabel')}
        type="text"
        error={errors.company?.message}
        autoComplete="organization"
        {...register('company')}
      />

      {/* Timeline (opcional) */}
      <SelectField
        label={t('timelineLabel')}
        placeholder={t('timelinePlaceholder')}
        options={timelineOptions}
        error={errors.timeline?.message}
        {...register('timeline')}
      />

      {/* Message */}
      <TextareaField
        label={t('messageLabel')}
        rows={6}
        error={errors.message?.message}
        required
        {...register('message')}
      />

      {/* Submit button */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
            {t('submitting')}
          </>
        ) : (
          <>
            <SendIcon className="mr-2 h-4 w-4" />
            {t('submit')}
          </>
        )}
      </Button>

      {/* Helper text */}
      <p className="text-center text-sm text-[var(--color-muted-foreground)]">{t('formHelper')}</p>
    </form>
  );
}
