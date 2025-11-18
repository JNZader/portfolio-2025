'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { subscribeToNewsletter } from '@/app/actions/newsletter';
import { Button } from '@/components/ui/button';

export function NewsletterInline() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toast.error('Por favor, ingresa un email válido.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('email', email);

      const result = await subscribeToNewsletter(formData);

      if (result.success) {
        toast.success(result.message, {
          duration: 5000,
        });
        setEmail('');
      } else {
        toast.error(result.error, {
          duration: 4000,
        });
      }
    } catch (_error) {
      toast.error('Error inesperado. Por favor, intenta más tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        className="flex h-10 flex-1 rounded-md border border-[var(--color-input)] bg-[var(--color-background)] px-3 py-2 text-sm placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2"
        disabled={isSubmitting}
        required
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Suscribir'}
      </Button>
    </form>
  );
}
