'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { unlockAchievement } from '@/lib/achievements';

export function TypingEasterEgg() {
  const [_typedKeys, setTypedKeys] = useState<string[]>([]);
  const [showHireMe, setShowHireMe] = useState(false);

  // Confetti animation
  const createConfetti = useCallback(() => {
    const colors = ['#1e40af', '#7c3aed', '#ec4899', '#f59e0b', '#10b981'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background-color: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * window.innerWidth}px;
        top: -10px;
        opacity: 1;
        z-index: 9999;
        pointer-events: none;
        border-radius: 50%;
      `;

      document.body.appendChild(confetti);

      const randomX = (Math.random() - 0.5) * 300;
      const randomRotation = Math.random() * 720;

      confetti.animate(
        [
          { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
          {
            transform: `translate(${randomX}px, ${window.innerHeight + 20}px) rotate(${randomRotation}deg)`,
            opacity: 0,
          },
        ],
        {
          duration: 3000 + Math.random() * 2000,
          easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }
      ).onfinish = () => confetti.remove();
    }
  }, []);

  // Palabras secretas y sus acciones
  const secrets = useMemo<Record<string, () => void>>(
    () => ({
      hireme: () => {
        setShowHireMe(true);
        createConfetti();
        unlockAchievement('hire_me_typer');
      },
      secret: () => {
        window.location.href = '/secret-achievements';
      },
      coffee: () => {
        unlockAchievement('coffee_lover');
        alert('☕ ¡Buena idea! Tomémonos un café virtual.');
      },
    }),
    [createConfetti]
  );

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignorar si está escribiendo en input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      setTypedKeys((prev) => {
        const newKeys = [...prev, e.key].slice(-10); // Últimas 10 teclas

        // Verificar cada palabra secreta
        const typedString = newKeys.join('').toLowerCase();
        for (const [secret, action] of Object.entries(secrets)) {
          if (typedString.includes(secret)) {
            action();
            return []; // Reset
          }
        }

        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [secrets]);

  if (showHireMe) {
    return (
      <button
        type="button"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm border-0 p-0 w-full h-full cursor-default"
        onClick={() => setShowHireMe(false)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' || e.key === 'Enter') setShowHireMe(false);
        }}
        aria-label="Cerrar modal"
      >
        <div className="bg-card rounded-lg p-8 max-w-md text-center shadow-2xl animate-in fade-in zoom-in duration-300 border">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-3xl font-bold mb-4">¡Sí, estoy disponible!</h2>
          <p className="text-lg mb-6 text-muted-foreground">
            Encontraste el easter egg. Claramente prestás atención a los detalles.
          </p>
          <div className="space-y-3">
            <a
              href="/contacto"
              className="block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              📧 Contactemos
            </a>
            <a
              href="/api/resume"
              onClick={() => unlockAchievement('cv_downloader')}
              className="block px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-accent transition-colors font-medium"
            >
              📄 Descargar CV
            </a>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            (Clic en cualquier lugar para cerrar)
          </p>
        </div>
      </button>
    );
  }

  return null;
}
