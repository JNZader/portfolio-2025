'use client';

import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScrollIndicatorProps {
  targetId?: string;
  className?: string;
}

export function ScrollIndicator({
  targetId = 'content',
  className,
}: Readonly<ScrollIndicatorProps>) {
  const handleScroll = () => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <button
      type="button"
      onClick={handleScroll}
      className={cn(
        'group flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-300',
        className
      )}
      aria-label="Explorar contenido"
    >
      <span className="text-xs font-medium uppercase tracking-wider">Explorar</span>
      <div className="relative">
        <ChevronDown className="w-6 h-6" aria-hidden="true" />
        <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </button>
  );
}
