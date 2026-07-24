'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { logger } from '@/lib/monitoring/logger';

interface ObfuscatedEmailProps {
  user: string; // Parte antes del @
  domain: string; // Parte después del @
  className?: string;
  showIcon?: boolean;
}

/**
 * Email en el punto de conversión (N-03): UN clic para actuar.
 *
 * El email nunca se ensambla durante el render ni aparece literal en el HTML
 * inicial, lo que mantiene la protección anti-scraping. El usuario actúa con
 * un solo clic: "Enviar email" abre el cliente de correo, "Copiar" copia la
 * dirección al portapapeles. Sin menú desplegable → sin aria-haspopup
 * engañoso.
 */
export function ObfuscatedEmail({ user, domain, className = '' }: Readonly<ObfuscatedEmailProps>) {
  const t = useTranslations('Email');
  const [copied, setCopied] = useState(false);

  const handleSend = () => {
    globalThis.location.href = `mailto:${user}@${domain}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${user}@${domain}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error('Error al copiar email', err as Error, {
        service: 'obfuscated-email',
      });
    }
  };

  return (
    <span className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={handleSend}
        className="inline-flex items-center gap-2 text-primary hover:underline"
        aria-label={t('sendAria')}
      >
        <EmailIcon className="h-4 w-4" />
        {t('send')}
      </button>

      <button
        type="button"
        onClick={handleCopy}
        aria-label={t('copy')}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {copied ? <CheckIcon className="h-4 w-4 text-success" /> : <CopyIcon className="h-4 w-4" />}
      </button>

      <span aria-live="polite" className="sr-only">
        {copied ? t('copiedAnnouncement') : ''}
      </span>
    </span>
  );
}

/**
 * Versión aún más ofuscada - no muestra el email completo hasta hacer hover.
 * El ensamblado sigue pasando por un useEffect para que no aparezca en el SSR.
 */
export function ObfuscatedEmailButton({
  user,
  domain,
  className = '',
}: Readonly<ObfuscatedEmailProps>) {
  const t = useTranslations('Email');
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    setEmail(`${user}@${domain}`);
  }, [user, domain]);

  const handleClick = () => {
    if (email) {
      globalThis.location.href = `mailto:${email}`;
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setShowEmail(true)}
      onMouseLeave={() => setShowEmail(false)}
      className={`inline-flex items-center gap-2 hover:underline ${className}`}
      aria-label={t('sendAria')}
    >
      <EmailIcon className="h-4 w-4" />
      {showEmail ? email : t('send')}
    </button>
  );
}

// Icons
function EmailIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  );
}

function CopyIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
      />
    </svg>
  );
}

function CheckIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
