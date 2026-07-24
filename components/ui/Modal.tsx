'use client';

import { useTranslations } from 'next-intl';
import { type ReactNode, useEffect, useId, useRef } from 'react';
import { cn } from '@/lib/utils';

// Lock body scroll when a modal is open, using a data attribute counter
// to support nested modals.
function useModalBodyLock(isOpen: boolean) {
  const wasOpenRef = useRef(false);

  useEffect(() => {
    const lock = () => {
      const count = Number(document.body.dataset.modalCount ?? '0') + 1;
      document.body.dataset.modalCount = String(count);
      if (count === 1) document.body.style.overflow = 'hidden';
    };

    const unlock = () => {
      const count = Math.max(0, Number(document.body.dataset.modalCount ?? '0') - 1);
      document.body.dataset.modalCount = String(count);
      if (count === 0) document.body.style.overflow = '';
    };

    if (isOpen && !wasOpenRef.current) {
      lock();
      wasOpenRef.current = true;
    } else if (!isOpen && wasOpenRef.current) {
      unlock();
      wasOpenRef.current = false;
    }

    return () => {
      if (wasOpenRef.current) {
        unlock();
        wasOpenRef.current = false;
      }
    };
  }, [isOpen]);
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
  const t = useTranslations('Modal');
  const modalId = useId();
  const titleId = `modal-title-${modalId}`;
  const descriptionId = `modal-description-${modalId}`;
  const dialogRef = useRef<HTMLDialogElement>(null);
  useModalBodyLock(isOpen);

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
        'hidden open:flex items-center justify-center'
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
        aria-label={t('closeOutsideAria')}
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
            'inline-flex size-11 items-center justify-center rounded-lg',
            'hover:bg-muted',
            'focus:outline-none focus:ring-2 focus:ring-primary'
          )}
          aria-label={t('closeAria')}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <title>{t('closeIconTitle')}</title>
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
