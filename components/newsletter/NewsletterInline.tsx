'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNewsletterSubscription } from '@/hooks/useNewsletterSubscription';

const STATUS_BUTTON_TEXT: Record<string, string> = {
  loading: 'Enviando...',
  success: 'Suscrito',
};

export function NewsletterInline() {
  const [email, setEmail] = useState('');
  const { status, subscribe } = useNewsletterSubscription();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email?.includes('@')) {
      return;
    }

    const success = await subscribe(email);
    if (success) {
      setEmail('');
    }
  };

  const isDisabled = status === 'loading' || status === 'success';

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <label htmlFor="footer-newsletter-email" className="sr-only">
        Correo electr&oacute;nico para newsletter
      </label>
      <input
        id="footer-newsletter-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        disabled={isDisabled}
        required
      />
      <Button type="submit" disabled={isDisabled}>
        {STATUS_BUTTON_TEXT[status] ?? 'Suscribirse'}
      </Button>
    </form>
  );
}
