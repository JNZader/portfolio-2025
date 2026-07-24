'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, Loader2, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNewsletterSubscription } from '@/hooks/useNewsletterSubscription';
import { cn } from '@/lib/utils';
import { type NewsletterFormData, newsletterSchema } from '@/lib/validations/newsletter';

interface NewsletterCardProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

function NewsletterCard({ className, size = 'lg' }: Readonly<NewsletterCardProps>) {
  const t = useTranslations('Newsletter');
  const { status, subscribe } = useNewsletterSubscription();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = async (data: NewsletterFormData) => {
    const success = await subscribe(data.email);
    if (success) {
      reset();
    }
  };

  const sizeClasses = {
    sm: {
      container: 'p-4',
      form: 'flex gap-2',
      input: 'h-9',
      button: 'h-9 px-3',
    },
    md: {
      container: 'p-6',
      form: 'flex gap-3',
      input: 'h-10',
      button: 'h-10 px-4',
    },
    lg: {
      container: 'p-8',
      form: 'flex flex-col sm:flex-row gap-3',
      input: 'h-12',
      button: 'h-12 px-6',
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div
      data-testid="newsletter-card"
      className={cn(
        'rounded-xl border border-border/70 bg-card/80 text-card-foreground shadow-sm backdrop-blur-sm',
        currentSize.container,
        className
      )}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={currentSize.form}
        aria-label={t('ariaLabel')}
        noValidate
      >
        <label htmlFor="newsletter-email" className="sr-only">
          {t('emailLabel')}
        </label>
        <Input
          id="newsletter-email"
          type="email"
          placeholder={t('emailPlaceholder')}
          autoComplete="email"
          disabled={status === 'loading' || status === 'success'}
          className={cn(currentSize.input, 'flex-1', errors.email && 'border-destructive')}
          {...register('email')}
        />

        <Button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className={cn(
            currentSize.button,
            status === 'success' && 'bg-success hover:bg-success/90'
          )}
        >
          {status === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {status === 'success' && <CheckCircle className="mr-2 h-4 w-4" />}
          {status === 'loading'
            ? t('subscribing')
            : status === 'success'
              ? t('subscribed')
              : t('subscribe')}
        </Button>
      </form>

      {errors.email && (
        <p className="mt-2 text-sm text-destructive">
          {t(errors.email.message ?? 'errEmailInvalid')}
        </p>
      )}

      {size === 'lg' && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            <span>{t('noSpam')}</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            <span>{t('unsubscribe')}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function NewsletterHero() {
  const t = useTranslations('Newsletter');
  return (
    <section className="py-12 border-t border-border/50 bg-muted/20">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-sm font-medium text-muted-foreground">
              <Mail className="h-4 w-4" />
              {t('badge')}
            </div>
            <h2 className="text-2xl font-bold md:text-3xl">{t('heading')}</h2>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
              {t('description')}
            </p>
          </div>

          <NewsletterCard size="md" className="mx-auto max-w-lg" />

          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>{t('benefit1')}</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>{t('benefit2')}</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>{t('benefit3')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { NewsletterCard };
