'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
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

const REASON_OPTIONS: readonly SelectOption[] = Object.entries(CONTACT_REASONS).map(
  ([value, label]) => ({ value, label })
);

const TIMELINE_OPTIONS: readonly SelectOption[] = Object.entries(CONTACT_TIMELINES).map(
  ([value, label]) => ({ value, label })
);

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const [pendingData, setPendingData] = useState<ContactFormData | null>(null);
  const { announce } = useAnnouncer();

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
        setIsSubmitting(false);
        return;
      }

      // Si hay error (desechable), rechazar
      if (!emailCheck.isValid && !emailCheck.suggestion) {
        showError(emailCheck.reason ?? 'Email inválido');
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
        announce('Formulario de contacto enviado exitosamente', 'polite');
        reset(); // Limpiar formulario
        setEmailSuggestion(null);
        setPendingData(null);
      } else {
        showError(result.error);
        announce('Error al procesar el formulario de contacto', 'assertive');
      }
    } catch (error) {
      logger.error('Form submission error', error as Error, {
        service: 'contact-form',
      });
      showError('Error inesperado. Por favor, intenta más tarde.');
      announce('Error inesperado al enviar el mensaje', 'assertive');
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
        <div className="rounded-lg border-2 border-[var(--color-primary)] bg-[var(--color-primary)]/10 p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <p className="font-medium mb-2">¿Quisiste decir?</p>
              <p className="text-sm text-[var(--color-muted-foreground)] mb-3">
                Detectamos un posible error en tu email. ¿Querías escribir:
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
                  ✓ Sí, usar ese email
                </Button>
                <Button
                  type="button"
                  onClick={keepOriginalEmail}
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-initial"
                >
                  No, mi email está bien
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Name */}
      <InputField
        label="Nombre"
        type="text"
        error={errors.name?.message}
        required
        {...register('name')}
      />

      {/* Email */}
      <InputField
        label="Email"
        type="email"
        error={errors.email?.message}
        required
        {...register('email')}
      />

      {/* Reason (reemplaza al antiguo "Asunto") */}
      <SelectField
        label="Motivo de contacto"
        placeholder="Elegí un motivo"
        options={REASON_OPTIONS}
        error={errors.reason?.message}
        required
        {...register('reason')}
      />

      {/* Company (opcional) */}
      <InputField
        label="Empresa u organización (opcional)"
        type="text"
        error={errors.company?.message}
        {...register('company')}
      />

      {/* Timeline (opcional) */}
      <SelectField
        label="¿Para cuándo lo necesitás? (opcional)"
        placeholder="Sin definir"
        options={TIMELINE_OPTIONS}
        error={errors.timeline?.message}
        {...register('timeline')}
      />

      {/* Message */}
      <TextareaField
        label="Mensaje"
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
            Enviando...
          </>
        ) : (
          <>
            <SendIcon className="mr-2 h-4 w-4" />
            Enviar
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
