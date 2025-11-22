'use client';

import { useEffect, useState } from 'react';
import { unlockAchievement } from '@/lib/achievements';

interface Particle {
  id: number;
  x: number;
  y: number;
}

export function CursorTracer() {
  const [isActive, setIsActive] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Presiona 'T' para toggle
      if (e.key === 't' || e.key === 'T') {
        // No activar si está escribiendo en un input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return;
        }

        setIsActive((prev) => {
          const newState = !prev;
          if (newState) {
            showNotification('🎨 Cursor Tracer activado! (Presiona T para desactivar)');
            unlockAchievement('cursor_artist');
          } else {
            showNotification('Cursor Tracer desactivado');
          }
          return newState;
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    if (!isActive) return;

    let particleId = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const newParticle = {
        id: particleId++,
        x: e.clientX,
        y: e.clientY,
      };

      setParticles((prev) => [...prev.slice(-20), newParticle]); // Máximo 20 partículas
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isActive]);

  // Limpiar partículas viejas
  useEffect(() => {
    if (particles.length === 0) return;

    const timeout = setTimeout(() => {
      setParticles((prev) => prev.slice(1));
    }, 50);

    return () => clearTimeout(timeout);
  }, [particles]);

  if (!isActive) return null;

  return (
    <>
      {particles.map((particle, index) => {
        const colors = [
          '#FF6B6B',
          '#4ECDC4',
          '#45B7D1',
          '#FFA07A',
          '#98D8C8',
          '#F7DC6F',
          '#BB8FCE',
        ];
        const color = colors[index % colors.length];
        const size = 10 - (particles.length - index) * 0.3;
        const opacity = (index + 1) / particles.length;

        return (
          <div
            key={particle.id}
            style={{
              position: 'fixed',
              left: particle.x,
              top: particle.y,
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: color,
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 9998,
              transform: 'translate(-50%, -50%)',
              opacity,
              transition: 'opacity 0.1s ease-out',
            }}
          />
        );
      })}
    </>
  );
}

function showNotification(message: string) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 9999;
    animation: slideInUp 0.3s ease-out;
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.3s ease-in';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
