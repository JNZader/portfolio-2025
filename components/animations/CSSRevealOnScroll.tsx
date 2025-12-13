'use client';

import type { ReactNode } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

type AnimationType = 'fade' | 'slide-up' | 'slide-left' | 'slide-right' | 'scale';

interface CSSRevealOnScrollProps {
  children: ReactNode;
  className?: string;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  once?: boolean;
  threshold?: number;
}

/**
 * CSS-based reveal animation on scroll
 * Replaces framer-motion RevealOnScroll for better performance (~60KB saved)
 * Uses shared useScrollReveal hook for IntersectionObserver + reduced motion
 */
export function CSSRevealOnScroll({
  children,
  className,
  animation = 'slide-up',
  delay = 0,
  duration = 600,
  once = true,
  threshold = 0.1,
}: CSSRevealOnScrollProps) {
  const { ref, isVisible, prefersReducedMotion } = useScrollReveal<HTMLDivElement>({
    threshold,
    once,
  });

  // Animation styles
  const animationStyles: Record<AnimationType, { hidden: string; visible: string }> = {
    fade: {
      hidden: 'opacity-0',
      visible: 'opacity-100',
    },
    'slide-up': {
      hidden: 'opacity-0 translate-y-16',
      visible: 'opacity-100 translate-y-0',
    },
    'slide-left': {
      hidden: 'opacity-0 -translate-x-16',
      visible: 'opacity-100 translate-x-0',
    },
    'slide-right': {
      hidden: 'opacity-0 translate-x-16',
      visible: 'opacity-100 translate-x-0',
    },
    scale: {
      hidden: 'opacity-0 scale-90',
      visible: 'opacity-100 scale-100',
    },
  };

  const { hidden, visible } = animationStyles[animation];

  // Skip animation for reduced motion
  if (prefersReducedMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn('transition-all ease-out', isVisible ? visible : hidden, className)}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay * 1000}ms`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Staggered reveal for multiple children
 */
interface CSSStaggeredRevealProps {
  children: ReactNode[];
  className?: string;
  animation?: AnimationType;
  staggerDelay?: number;
}

export function CSSStaggeredReveal({
  children,
  className,
  animation = 'slide-up',
  staggerDelay = 0.1,
}: CSSStaggeredRevealProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <CSSRevealOnScroll
          // biome-ignore lint/suspicious/noArrayIndexKey: Children are stable and won't reorder
          key={index}
          animation={animation}
          delay={index * staggerDelay}
        >
          {child}
        </CSSRevealOnScroll>
      ))}
    </div>
  );
}
