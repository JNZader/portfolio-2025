'use client';

import { useState } from 'react';
import { showError, showSuccess } from '@/lib/utils/toast';

/**
 * POST compartido de los formularios GDPR (export y deletion): mismo flujo
 * fetch → json → toast de error/éxito → loading. Antes estaba copy-pasteado
 * en DataRequestForm y DataDeletionForm.
 */
export function useGdprRequest(endpoint: string, errorFallback: string, successFallback: string) {
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (data: unknown, onSuccess?: () => void): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        showError(result.message ?? errorFallback);
        return;
      }

      showSuccess(result.message ?? successFallback);
      onSuccess?.();
    } catch (error) {
      showError(error instanceof Error ? error.message : errorFallback);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, submit };
}
