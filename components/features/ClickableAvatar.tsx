'use client';

import Image from 'next/image';
import { useState } from 'react';
import { unlockAchievement } from '@/lib/achievements';
import { cn } from '@/lib/utils';

interface ClickableAvatarProps {
  src: string;
  alt: string;
  size?: number;
  priority?: boolean;
}

export function ClickableAvatar({
  src,
  alt,
  size = 200,
  priority = false,
}: Readonly<ClickableAvatarProps>) {
  const [clickCount, setClickCount] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const handleClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    // Milestone 1: 3 clicks - Vibración
    if (newCount === 3) {
      setIsSpinning(true);
      setTimeout(() => setIsSpinning(false), 500);
    }

    // Milestone 2: 5 clicks - Rotación completa
    if (newCount === 5) {
      setIsSpinning(true);
      setTimeout(() => setIsSpinning(false), 1000);
    }

    // Milestone 3: 10 clicks - Secret revelado
    if (newCount === 10) {
      unlockAchievement('click_master');
      setClickCount(0); // Reset
    }

    // Auto-reset después de 3 segundos sin clicks
    setTimeout(() => {
      setClickCount((current) => (current === newCount ? 0 : current));
    }, 3000);
  };

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'relative cursor-pointer border-0 p-0 bg-transparent transition-all duration-500 hover:scale-110',
          isSpinning && 'animate-spin',
          clickCount > 0 ? 'scale-105' : 'scale-100'
        )}
        style={{
          width: size,
          height: size,
        }}
        aria-label="Avatar clickeable"
      >
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          priority={priority}
          className="rounded-full ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all"
        />

        {/* Click counter visual */}
        {clickCount > 0 && clickCount < 10 && (
          <div className="absolute -top-2 -right-2 bg-muted border border-border text-foreground text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
            {clickCount}
          </div>
        )}

        {/* Progress bar */}
        {clickCount > 0 && clickCount < 10 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
              style={{ width: `${(clickCount / 10) * 100}%` }}
            />
          </div>
        )}
      </button>
    </div>
  );
}
