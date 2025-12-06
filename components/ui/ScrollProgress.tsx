'use client';

import { useEffect, useState } from 'react';

/**
 * Scroll Progress Bar
 * Muestra una barra de progreso en la parte superior que indica
 * qué porcentaje de la página se ha scrolleado
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      // Altura total del documento
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

      // Scroll actual
      const scrollTop = window.scrollY;

      // Calcular porcentaje
      const scrollProgress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

      setProgress(scrollProgress);
    };

    // Actualizar al hacer scroll
    window.addEventListener('scroll', updateProgress, { passive: true });

    // Actualizar al cargar
    updateProgress();

    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-border/30 z-50" aria-hidden="true">
      <div
        className="h-full bg-gradient-to-r from-primary via-primary/80 to-tertiary transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
