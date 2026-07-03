'use client';

import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface ScrollIndicatorProps {
  targetId?: string;
  className?: string;
}

export function ScrollIndicator({
  targetId = 'content',
  className,
}: Readonly<ScrollIndicatorProps>) {
  const t = useTranslations('Common');
  const handleScroll = () => {
    const element = document.getElementById(targetId);
    if (element) {
      const reduced = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
      element.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
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
      aria-label={t('exploreAria')}
    >
      <span className="text-xs font-medium uppercase tracking-wider">{t('explore')}</span>
      <div className="relative animate-scroll-cue motion-reduce:animate-none">
        <ChevronDown className="w-6 h-6" aria-hidden="true" />
        <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </button>
  );
}
