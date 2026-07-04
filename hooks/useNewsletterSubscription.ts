'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { subscribeToNewsletter } from '@/app/actions/newsletter';
import { trackNewsletterSignup } from '@/lib/analytics/events';
import { logger } from '@/lib/monitoring/logger';

export type SubscriptionStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseNewsletterSubscriptionOptions {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
  resetDelay?: number;
}

interface UseNewsletterSubscriptionReturn {
  status: SubscriptionStatus;
  subscribe: (email: string) => Promise<boolean>;
  reset: () => void;
}

/**
 * Shared hook for newsletter subscription logic
 * Eliminates duplication between NewsletterForm and NewsletterHero
 */
export function useNewsletterSubscription(
  options: UseNewsletterSubscriptionOptions = {}
): UseNewsletterSubscriptionReturn {
  const { onSuccess, onError, resetDelay = 3000 } = options;
  const t = useTranslations('Newsletter');
  const [status, setStatus] = useState<SubscriptionStatus>('idle');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeouts on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const clearPendingTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const subscribe = useCallback(
    async (email: string): Promise<boolean> => {
      setStatus('loading');

      try {
        const formData = new FormData();
        formData.append('email', email);

        const result = await subscribeToNewsletter(formData);

        if (result.success) {
          setStatus('success');
          trackNewsletterSignup(email);

          const successMessage = t(result.messageKey);
          toast.success(successMessage, {
            duration: 5000,
            position: 'bottom-center',
          });

          onSuccess?.(successMessage);

          if (resetDelay > 0) {
            clearPendingTimeout();
            timeoutRef.current = setTimeout(() => setStatus('idle'), resetDelay);
          }

          return true;
        }

        setStatus('error');
        const errorMsg = t(result.errorKey);
        toast.error(errorMsg, {
          duration: 4000,
          position: 'bottom-center',
        });
        onError?.(errorMsg);

        // Reset error state after delay
        clearPendingTimeout();
        timeoutRef.current = setTimeout(() => setStatus('idle'), 2000);
        return false;
      } catch (error) {
        setStatus('error');
        const errorMessage = t('toastUnexpected');

        logger.error('Newsletter subscription error', error as Error, {
          service: 'newsletter-hook',
        });

        toast.error(errorMessage, {
          duration: 4000,
          position: 'bottom-center',
        });
        onError?.(errorMessage);

        clearPendingTimeout();
        timeoutRef.current = setTimeout(() => setStatus('idle'), 2000);
        return false;
      }
    },
    [onSuccess, onError, resetDelay, clearPendingTimeout, t]
  );

  const reset = useCallback(() => {
    setStatus('idle');
  }, []);

  return { status, subscribe, reset };
}
