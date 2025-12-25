'use client';

import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

interface AnimationContextType {
  prefersReducedMotion: boolean;
}

const AnimationContext = createContext<AnimationContextType>({
  prefersReducedMotion: false,
});

export function AnimationProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = globalThis.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const contextValue = useMemo(() => ({ prefersReducedMotion }), [prefersReducedMotion]);

  return <AnimationContext.Provider value={contextValue}>{children}</AnimationContext.Provider>;
}

export function useAnimation() {
  return useContext(AnimationContext);
}
