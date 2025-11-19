'use client';

import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

interface AnimationContextType {
  prefersReducedMotion: boolean;
}

const AnimationContext = createContext<AnimationContextType>({
  prefersReducedMotion: false,
});

export function AnimationProvider({ children }: { children: ReactNode }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <AnimationContext.Provider value={{ prefersReducedMotion }}>
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimation() {
  return useContext(AnimationContext);
}
