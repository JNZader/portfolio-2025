'use client';

import { useEffect, useRef, useState } from 'react';
import { unlockAchievement } from '@/lib/achievements';

export function MatrixRain() {
  const [isActive, setIsActive] = useState(false);
  const [_typedKeys, setTypedKeys] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Detectar "matrix" escrito
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      setTypedKeys((prev) => {
        const newKeys = [...prev, e.key].slice(-6);
        const typed = newKeys.join('').toLowerCase();

        if (typed === 'matrix') {
          setIsActive(true);
          unlockAchievement('matrix_fan');
          setTimeout(() => setIsActive(false), 15000); // 15 segundos
          return [];
        }

        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Canvas Matrix effect
  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = Array(Math.floor(columns)).fill(1);

    // Caracteres Matrix
    const matrixChars =
      'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';

    const draw = () => {
      // Fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0f0'; // Verde Matrix
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(char, x, y);

        // Reset drop randomly
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33); // ~30 FPS

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[9997] pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Mensaje overlay */}
      <div className="fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none">
        <div className="bg-black/80 backdrop-blur-sm px-8 py-6 rounded-lg border-2 border-green-500 shadow-[0_0_30px_rgba(0,255,0,0.3)]">
          <div className="text-green-500 font-mono text-center">
            <div className="text-4xl font-bold mb-2 animate-pulse">MATRIX MODE</div>
            <div className="text-sm">Wake up, Neo...</div>
            <div className="text-xs mt-2 opacity-70">
              (Se desactiva automáticamente en 15 segundos)
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
