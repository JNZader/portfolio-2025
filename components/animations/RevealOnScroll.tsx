'use client';

import { motion, useAnimation, useInView, type Variants } from 'framer-motion';
import { type ReactNode, useEffect, useRef } from 'react';
import { useAnimation as useAnimationContext } from './AnimationProvider';

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  variants?: Variants;
  delay?: number;
  once?: boolean;
}

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 75 },
  visible: { opacity: 1, y: 0 },
};

export function RevealOnScroll({
  children,
  className,
  variants = defaultVariants,
  delay = 0,
  once = true,
}: RevealOnScrollProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '0px 0px -100px 0px' });
  const controls = useAnimation();
  const { prefersReducedMotion } = useAnimationContext();

  useEffect(() => {
    if (prefersReducedMotion) return;

    if (isInView) {
      controls.start('visible');
    } else {
      controls.start('hidden');
    }
  }, [isInView, controls, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      transition={{
        duration: 0.6,
        delay,
        ease: [0.6, -0.05, 0.01, 0.99],
      }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggeredRevealProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
}

export function StaggeredReveal({ children, className, staggerDelay = 0.1 }: StaggeredRevealProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Children are stable and won't reorder
        <RevealOnScroll key={index} delay={index * staggerDelay}>
          {child}
        </RevealOnScroll>
      ))}
    </div>
  );
}

// Specific animation variants
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
