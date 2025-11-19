'use client';

import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FocusTrap } from '@/components/a11y/FocusTrap';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, description, children, size = 'md' }: ModalProps) {
  // Cerrar con ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevenir scroll del body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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
      aria-labelledby="modal-title"
      aria-describedby={description ? 'modal-description' : undefined}
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
            <h2 id="modal-title" className="text-2xl font-semibold">
              {title}
            </h2>
            {description && (
              <p id="modal-description" className="text-sm text-muted-foreground mt-2">
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
