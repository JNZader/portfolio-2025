'use client';

import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';

type AnnouncerContextType = {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
};

const AnnouncerContext = createContext<AnnouncerContextType | null>(null);

export function AnnouncerProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'polite' | 'assertive'>('polite');

  const announce = useCallback((msg: string, prio: 'polite' | 'assertive' = 'polite') => {
    setMessage(''); // Reset para forzar re-anuncio si es el mismo mensaje
    setTimeout(() => {
      setMessage(msg);
      setPriority(prio);
    }, 100);
  }, []);

  return (
    <AnnouncerContext.Provider value={{ announce }}>
      {children}
      {/* Live region para screen readers - visually hidden but accessible */}
      <output aria-live={priority} aria-atomic="true" className="sr-only">
        {message}
      </output>
    </AnnouncerContext.Provider>
  );
}

export function useAnnouncer() {
  const context = useContext(AnnouncerContext);
  if (!context) {
    throw new Error('useAnnouncer must be used within AnnouncerProvider');
  }
  return context;
}
