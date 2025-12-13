'use client';

import { useEffect, useRef, useState } from 'react';

export interface UseScrollRevealOptions {
  /** Threshold for IntersectionObserver (0-1) */
  threshold?: number;
  /** Root margin for IntersectionObserver */
  rootMargin?: string;
  /** Only trigger once */
  once?: boolean;
}

export interface UseScrollRevealResult<T extends HTMLElement> {
  /** Ref to attach to the element */
  ref: React.RefObject<T | null>;
  /** Whether the element is visible */
  isVisible: boolean;
  /** Whether reduced motion is preferred */
  prefersReducedMotion: boolean;
}

/**
 * Shared hook for scroll-based reveal animations
 * Handles IntersectionObserver and prefers-reduced-motion detection
 *
 * @example
 * const { ref, isVisible, prefersReducedMotion } = useScrollReveal<HTMLDivElement>();
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
): UseScrollRevealResult<T> {
  const { threshold = 0.1, rootMargin = '0px 0px -100px 0px', once = true } = options;

  const ref = useRef<T | null>(null);
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

  // IntersectionObserver setup
  useEffect(() => {
    // If reduced motion, show immediately
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
        rootMargin,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [once, threshold, rootMargin, prefersReducedMotion]);

  return { ref, isVisible, prefersReducedMotion };
}
