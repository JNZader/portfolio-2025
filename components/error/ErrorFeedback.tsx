'use client';

import * as Sentry from '@sentry/nextjs';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function ErrorFeedback({ eventId }: Readonly<{ eventId?: string }>) {
  const [submitted, setSubmitted] = useState(false);

  const handleFeedback = () => {
    if (!eventId) return;

    Sentry.showReportDialog({
      eventId,
      title: '¡Ups! Algo salió mal',
      subtitle: 'Nuestro equipo ha sido notificado.',
      subtitle2: '¿Quieres contarnos qué pasó?',
      labelName: 'Nombre',
      labelEmail: 'Email',
      labelComments: '¿Qué estabas haciendo?',
      labelClose: 'Cerrar',
      labelSubmit: 'Enviar',
      successMessage: '¡Gracias por tu feedback!',
    });

    setSubmitted(true);
  };

  if (submitted) {
    return <p className="text-sm text-green-600">¡Gracias por tu feedback!</p>;
  }

  return (
    <Button variant="outline" onClick={handleFeedback}>
      Reportar problema
    </Button>
  );
}
