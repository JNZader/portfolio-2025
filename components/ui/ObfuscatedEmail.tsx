'use client';

import { useEffect, useRef, useState } from 'react';
import { logger } from '@/lib/monitoring/logger';

interface ObfuscatedEmailProps {
  user: string; // Parte antes del @
  domain: string; // Parte después del @
  className?: string;
  showIcon?: boolean;
}

/**
 * Componente anti-scraping que NO muestra el email directamente
 * Muestra un menú de opciones al hacer clic
 */
export function ObfuscatedEmail({
  user,
  domain,
  className = '',
  showIcon = false,
}: ObfuscatedEmailProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLSpanElement>(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // Construir email dinámicamente (solo cuando se necesita)
  const getEmail = () => `${user}@${domain}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getEmail());
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowMenu(false);
      }, 2000);
    } catch (err) {
      logger.error('Error al copiar email', err as Error, {
        service: 'obfuscated-email',
      });
    }
  };

  const handleMailto = () => {
    window.location.href = `mailto:${getEmail()}`;
    setShowMenu(false);
  };

  return (
    <span className="relative inline-block" ref={menuRef}>
      {/* Botón - NO muestra el email */}
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        className={`inline-flex items-center gap-1 select-none ${className}`}
        aria-label="Opciones de contacto por email"
      >
        {showIcon && <EmailIcon className="h-4 w-4" />}
        <span className="hover:underline">Contactar por email</span>
        <ChevronIcon className={`h-3 w-3 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
      </button>

      {/* Menú desplegable */}
      {showMenu && (
        <span className="absolute z-50 mt-2 w-56 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] shadow-lg block">
          <span className="p-2 block">
            <button
              type="button"
              onClick={handleMailto}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-[var(--color-muted)] transition-colors text-left"
            >
              <SendIcon className="h-4 w-4 text-[var(--color-primary)]" />
              <span>Enviar email</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-[var(--color-muted)] transition-colors text-left"
            >
              {copied ? (
                <>
                  <CheckIcon className="h-4 w-4 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <CopyIcon className="h-4 w-4 text-[var(--color-primary)]" />
                  <span>Copiar dirección</span>
                </>
              )}
            </button>
          </span>
        </span>
      )}
    </span>
  );
}

/**
 * Versión aún más ofuscada - no muestra el email completo hasta hacer hover
 */
export function ObfuscatedEmailButton({ user, domain, className = '' }: ObfuscatedEmailProps) {
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    setEmail(`${user}@${domain}`);
  }, [user, domain]);

  const handleClick = () => {
    if (email) {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setShowEmail(true)}
      onMouseLeave={() => setShowEmail(false)}
      className={`inline-flex items-center gap-2 hover:underline ${className}`}
      aria-label="Enviar email"
    >
      <EmailIcon className="h-4 w-4" />
      {showEmail ? email : 'Enviar email'}
    </button>
  );
}

// Icons
function EmailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      role="img"
      aria-label="Email"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      role="img"
      aria-label="Expandir"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      role="img"
      aria-label="Enviar"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
      />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      role="img"
      aria-label="Copiar"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      role="img"
      aria-label="Completado"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
