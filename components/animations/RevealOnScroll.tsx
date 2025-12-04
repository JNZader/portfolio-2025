'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAnimation } from './AnimationProvider';

/**
 * Animation variants type (kept for backwards compatibility)
 * Now maps to CSS animations instead of framer-motion
 */
export interface Variants {
  hidden: { opacity?: number; y?: number; x?: number; scale?: number };
  visible: { opacity?: number; y?: number; x?: number; scale?: number };
}

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  variants?: Variants;
  delay?: number;
  once?: boolean;
}

// Default variants (backwards compatible)
const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 75 },
  visible: { opacity: 1, y: 0 },
};

/**
 * CSS-based reveal animation on scroll
 * Replaced framer-motion implementation for better performance (~60KB saved)
 * Uses IntersectionObserver + CSS transitions
 */
export function RevealOnScroll({
  children,
  className,
  variants = defaultVariants,
  delay = 0,
  once = true,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { prefersReducedMotion } = useAnimation();

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
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px',
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [once, prefersReducedMotion]);

  // Skip animation for reduced motion
  if (prefersReducedMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  // Convert variants to CSS transform values
  const getTransformStyle = (variant: Variants['hidden'] | Variants['visible']) => {
    const transforms: string[] = [];

    if (variant.y !== undefined && variant.y !== 0) {
      transforms.push(`translateY(${variant.y}px)`);
    }
    if (variant.x !== undefined && variant.x !== 0) {
      transforms.push(`translateX(${variant.x}px)`);
    }
    if (variant.scale !== undefined && variant.scale !== 1) {
      transforms.push(`scale(${variant.scale})`);
    }

    return transforms.length > 0 ? transforms.join(' ') : 'none';
  };

  const currentVariant = isVisible ? variants.visible : variants.hidden;

  return (
    <div
      ref={ref}
      className={cn('transition-all duration-600 ease-out', className)}
      style={{
        opacity: currentVariant.opacity ?? 1,
        transform: getTransformStyle(currentVariant),
        transitionDelay: `${delay * 1000}ms`,
        transitionDuration: '600ms',
        transitionTimingFunction: 'cubic-bezier(0.6, -0.05, 0.01, 0.99)',
      }}
    >
      {children}
    </div>
  );
}

/**
 * Staggered reveal for multiple children
 */
interface StaggeredRevealProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
}

export function StaggeredReveal({ children, className, staggerDelay = 0.1 }: StaggeredRevealProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <RevealOnScroll
          // biome-ignore lint/suspicious/noArrayIndexKey: Children are stable and won't reorder
          key={index}
          delay={index * staggerDelay}
        >
          {child}
        </RevealOnScroll>
      ))}
    </div>
  );
}

// Specific animation variants (backwards compatible exports)
export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0 },
};

export const slideLeftVariants: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0 },
};

export const slideRightVariants: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0 },
};

export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};
