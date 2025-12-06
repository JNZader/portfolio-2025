'use client';

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { FocusTrap } from '@/components/a11y/FocusTrap';
import { cn } from '@/lib/utils';

// Context para manejar el contador de modales abiertos de forma segura
const ModalCountContext = createContext<{
  increment: () => void;
  decrement: () => void;
} | null>(null);

// Hook para usar el contexto de modales
function useModalCount() {
  const context = useContext(ModalCountContext);
  // Fallback para cuando no hay provider (uso directo del Modal)
  if (!context) {
    return {
      increment: () => {
        const count = Number(document.body.dataset.modalCount || '0') + 1;
        document.body.dataset.modalCount = String(count);
        if (count === 1) document.body.style.overflow = 'hidden';
      },
      decrement: () => {
        const count = Math.max(0, Number(document.body.dataset.modalCount || '0') - 1);
        document.body.dataset.modalCount = String(count);
        if (count === 0) document.body.style.overflow = '';
      },
    };
  }
  return context;
}

// Provider opcional para aplicaciones con múltiples modales
export function ModalProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (count > 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [count]);

  return (
    <ModalCountContext.Provider
      value={{
        increment: () => setCount((c) => c + 1),
        decrement: () => setCount((c) => Math.max(0, c - 1)),
      }}
    >
      {children}
    </ModalCountContext.Provider>
  );
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, description, children, size = 'md' }: ModalProps) {
  const modalId = useId();
  const titleId = `modal-title-${modalId}`;
  const descriptionId = `modal-description-${modalId}`;
  const wasOpenRef = useRef(false);
  const { increment, decrement } = useModalCount();

  // Cerrar con ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevenir scroll del body - usando context/data-attribute para manejar múltiples modales
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      increment();
      wasOpenRef.current = true;
    } else if (!isOpen && wasOpenRef.current) {
      decrement();
      wasOpenRef.current = false;
    }

    return () => {
      if (wasOpenRef.current) {
        decrement();
        wasOpenRef.current = false;
      }
    };
  }, [isOpen, increment, decrement]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal content con FocusTrap */}
      <FocusTrap active={isOpen} onDeactivate={onClose}>
        <div
          className={cn(
            'relative w-full',
            sizeClasses[size],
            'bg-background rounded-lg shadow-xl',
            'border',
            'p-6'
          )}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'absolute top-4 right-4',
              'p-2 rounded-lg',
              'hover:bg-muted',
              'focus:outline-none focus:ring-2 focus:ring-primary'
            )}
            aria-label="Cerrar modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <title>Cerrar</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Header */}
          <div className="mb-4">
            <h2 id={titleId} className="text-2xl font-semibold">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="text-sm text-muted-foreground mt-2">
                {description}
              </p>
            )}
          </div>

          {/* Body */}
          <div>{children}</div>
        </div>
      </FocusTrap>
    </div>,
    document.body
  );
}
