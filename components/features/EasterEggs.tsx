'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { unlockAchievement } from '@/lib/achievements';

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
] as const;

export function EasterEggs() {
  const t = useTranslations('EasterEggs');
  const [konamiActivated, setKonamiActivated] = useState(false);
  const keysRef = useRef<string[]>([]);

  // Confetti animation
  const confetti = useCallback(() => {
    // Client-side-only check: never evaluate matchMedia during SSR render.
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      return;
    }

    const colors = ['#1e40af', '#7c3aed', '#ec4899', '#f59e0b'];
    const confettiCount = 100;

    for (let i = 0; i < confettiCount; i++) {
      const confettiElement = document.createElement('div');
      confettiElement.style.position = 'fixed';
      confettiElement.style.width = '10px';
      confettiElement.style.height = '10px';
      confettiElement.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confettiElement.style.left = `${Math.random() * globalThis.innerWidth}px`;
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
            transform: `translate(${randomX}px, ${globalThis.innerHeight}px) rotate(${randomRotation}deg)`,
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
      if (konamiActivated) {
        if (e.key === 'Escape') {
          setKonamiActivated(false);
        }
        return;
      }

      keysRef.current = [...keysRef.current, e.key].slice(-10);

      if (keysRef.current.join(',') === konamiCode.join(',')) {
        setKonamiActivated(true);
        confetti();
        unlockAchievement('konami_master');
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [confetti, konamiActivated]);

  if (konamiActivated) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('konamiAria')}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <div className="bg-card rounded-lg p-8 max-w-md text-center border shadow-xl">
          <h2 className="text-3xl font-bold mb-4">{t('konamiTitle')}</h2>
          <p className="mb-4 text-muted-foreground">{t('konamiBody1')}</p>
          <p className="mb-6 text-sm text-muted-foreground">{t('konamiBody2')}</p>
          <button
            type="button"
            onClick={() => setKonamiActivated(false)}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            {t('konamiClose')}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
