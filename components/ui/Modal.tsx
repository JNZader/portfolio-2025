'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  if (context) {
    return context;
  }
  return {
    increment: () => {
      const count = Number(document.body.dataset.modalCount ?? '0') + 1;
      document.body.dataset.modalCount = String(count);
      if (count === 1) document.body.style.overflow = 'hidden';
    },
    decrement: () => {
      const count = Math.max(0, Number(document.body.dataset.modalCount ?? '0') - 1);
      document.body.dataset.modalCount = String(count);
      if (count === 0) document.body.style.overflow = '';
    },
  };
}

// Provider opcional para aplicaciones con múltiples modales
export function ModalProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (count === 0) {
      document.body.style.overflow = '';
    } else {
      document.body.style.overflow = 'hidden';
    }
  }, [count]);

  const increment = useCallback(() => setCount((c) => c + 1), []);
  const decrement = useCallback(() => setCount((c) => Math.max(0, c - 1)), []);

  const contextValue = useMemo(() => ({ increment, decrement }), [increment, decrement]);

  return <ModalCountContext.Provider value={contextValue}>{children}</ModalCountContext.Provider>;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
}: Readonly<ModalProps>) {
  const modalId = useId();
  const titleId = `modal-title-${modalId}`;
  const descriptionId = `modal-description-${modalId}`;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const wasOpenRef = useRef(false);
  const { increment, decrement } = useModalCount();

  // Manage dialog open/close with native <dialog> API
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Handle native dialog close event (ESC key, etc.)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      onClose();
    };

    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

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

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        'fixed inset-0 p-0 m-0 w-screen h-screen max-w-none max-h-none',
        'bg-transparent backdrop:bg-black/50 backdrop:backdrop-blur-sm',
        'flex items-center justify-center'
      )}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
    >
      {/* Backdrop button for closing */}
      <button
        type="button"
        className="absolute inset-0 w-full h-full cursor-default bg-transparent"
        onClick={onClose}
        aria-label="Cerrar al hacer clic fuera"
        tabIndex={-1}
      />
      {/* Modal content */}
      <div
        className={cn(
          'relative w-full z-10',
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
    </dialog>
  );
}
