'use client';

import { useCallback, useEffect, useState } from 'react';
import { unlockAchievement } from '@/lib/achievements';

export function EasterEggs() {
  const [konamiActivated, setKonamiActivated] = useState(false);
  const [_keys, setKeys] = useState<string[]>([]);

  // Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A
  const konamiCode = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a',
  ];

  // Confetti animation
  const confetti = useCallback(() => {
    const colors = ['#1e40af', '#7c3aed', '#ec4899', '#f59e0b'];
    const confettiCount = 100;

    for (let i = 0; i < confettiCount; i++) {
      const confettiElement = document.createElement('div');
      confettiElement.style.position = 'fixed';
      confettiElement.style.width = '10px';
      confettiElement.style.height = '10px';
      confettiElement.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confettiElement.style.left = `${Math.random() * window.innerWidth}px`;
      confettiElement.style.top = '-10px';
      confettiElement.style.opacity = '1';
      confettiElement.style.zIndex = '9999';
      confettiElement.style.pointerEvents = 'none';

      document.body.appendChild(confettiElement);

      // Random horizontal movement for better spread
      const randomX = (Math.random() - 0.5) * 300;
      const randomRotation = Math.random() * 720;

      const animation = confettiElement.animate(
        [
          { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
          {
            transform: `translate(${randomX}px, ${window.innerHeight}px) rotate(${randomRotation}deg)`,
            opacity: 0,
          },
        ],
        {
          duration: 2000 + Math.random() * 1000,
          easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }
      );

      animation.onfinish = () => confettiElement.remove();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys((prevKeys) => {
        const newKeys = [...prevKeys, e.key].slice(-10);

        if (newKeys.join(',') === konamiCode.join(',')) {
          setKonamiActivated(true);
          confetti();
          unlockAchievement('konami_master');
        }

        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confetti]);

  // Console Easter Egg
  useEffect(() => {
    console.log('%c🎉 ¡Hola developer!', 'font-size: 24px; font-weight: bold; color: #1e40af;');
    console.log('%cVeo que te gusta inspeccionar código!!! 🧐', 'font-size: 14px; color: #6b7280;');
    console.log(
      '%c👉 Conectemos: https://linkedin.com/in/jnzader/',
      'font-size: 14px; color: #1e40af;'
    );
    console.log('%c💡 Tip: Prueba el Konami Code (↑↑↓↓←→←→BA)', 'font-size: 12px; color: #9ca3af;');
    unlockAchievement('console_explorer');
  }, []);

  if (konamiActivated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-card rounded-lg p-8 max-w-md text-center border shadow-xl">
          <h2 className="text-3xl font-bold mb-4">🎉 ¡Konami Code!</h2>
          <p className="mb-4 text-muted-foreground">
            ¡Encontraste el easter egg! Eres un verdadero gamer de los 90s.
          </p>
          <p className="mb-6 text-sm text-muted-foreground">
            Este código secreto ha estado en videojuegos desde Contra (1988).
          </p>
          <button
            type="button"
            onClick={() => setKonamiActivated(false)}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return null;
}
