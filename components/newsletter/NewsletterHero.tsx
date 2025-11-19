'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, Loader2, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { subscribeToNewsletter } from '@/app/actions/newsletter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { type NewsletterFormData, newsletterSchema } from '@/lib/validations/newsletter';

interface NewsletterCardProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

function NewsletterCard({ className, size = 'lg' }: NewsletterCardProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = async (data: NewsletterFormData) => {
    setStatus('loading');

    try {
      const formData = new FormData();
      formData.append('email', data.email);

      const result = await subscribeToNewsletter(formData);

      if (result.success) {
        setStatus('success');
        toast.success(result.message, { duration: 5000 });
        reset();
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('idle');
        toast.error(result.error, { duration: 4000 });
      }
    } catch (error) {
      setStatus('idle');
      console.error('Newsletter subscription error:', error);
      toast.error('Error inesperado. Por favor, intenta más tarde.');
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
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        currentSize.container,
        className
      )}
    >
      <form onSubmit={handleSubmit(onSubmit)} className={currentSize.form} aria-label="Newsletter">
        <label htmlFor="newsletter-email" className="sr-only">
          Email Newsletter
        </label>
        <Input
          id="newsletter-email"
          type="email"
          placeholder="tu@email.com"
          disabled={status === 'loading' || status === 'success'}
          className={cn(currentSize.input, 'flex-1', errors.email && 'border-destructive')}
          aria-label="Email Newsletter"
          {...register('email')}
        />

        <Button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className={cn(
            currentSize.button,
            status === 'success' && 'bg-green-600 hover:bg-green-700'
          )}
        >
          {status === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {status === 'success' && <CheckCircle className="mr-2 h-4 w-4" />}
          {status === 'loading'
            ? 'Suscribiendo...'
            : status === 'success'
              ? '¡Suscrito!'
              : 'Suscribirse'}
        </Button>
      </form>

      {errors.email && <p className="mt-2 text-sm text-destructive">{errors.email.message}</p>}

      {size === 'lg' && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            <span>Sin spam</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            <span>Desuscríbete cuando quieras</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function NewsletterHero() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Mail className="h-4 w-4" />
              Newsletter
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">No te pierdas ninguna actualización</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Únete a desarrolladores que reciben insights semanales sobre las últimas tendencias en
              desarrollo web, tutoriales exclusivos y recursos útiles.
            </p>
          </div>

          <NewsletterCard
            size="lg"
            className="max-w-md mx-auto border-2 border-primary/20 bg-background/60 backdrop-blur-sm"
          />

          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Contenido de calidad garantizado</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>1 email por semana máximo</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Recursos exclusivos para suscriptores</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { NewsletterCard };
