'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  /** Use smaller icons for mobile/compact layout */
  compact?: boolean;
}

/**
 * Theme Toggle - Client Component
 * Extracted from Header for Server Component optimization
 */
export function ThemeToggle({ compact = false }: Readonly<ThemeToggleProps>) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === 'dark';
  const iconClasses = cn(compact ? 'h-4 w-4' : 'h-5 w-5');

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  if (!mounted) {
    return <div className="size-11" aria-hidden="true" />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-pressed={isDark}
    >
      {isDark ? <Sun className={iconClasses} /> : <Moon className={iconClasses} />}
      <span className="sr-only">Tema actual: {isDark ? 'oscuro' : 'claro'}</span>
    </Button>
  );
}
