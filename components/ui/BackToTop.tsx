'use client';

import { ArrowUp } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Mostrar después de 400px de scroll
      setIsVisible(globalThis.scrollY > 400);
    };

    globalThis.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => globalThis.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = useCallback(() => {
    globalThis.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Volver arriba"
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:scale-110 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-95"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
