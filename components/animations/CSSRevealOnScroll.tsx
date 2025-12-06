'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
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
 * Uses IntersectionObserver + CSS transitions
 * Uses native matchMedia for reduced motion (no context provider needed)
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
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check reduced motion preference using native API
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -100px 0px',
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [once, threshold, prefersReducedMotion]);

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
