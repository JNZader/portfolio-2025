'use client';

import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const COOKIE_CONSENT_KEY = 'cookie-consent';
const COOKIE_CONSENT_VERSION = '1.0';

interface CookiePreferences {
  essential: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  version: string;
}

export function CookieConsent() {
  const [show, setShow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    version: COOKIE_CONSENT_VERSION,
  });

  useEffect(() => {
    // Verificar si ya dio consentimiento
    const consent = Cookies.get(COOKIE_CONSENT_KEY);

    if (!consent) {
      // Mostrar banner después de 1 segundo
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }

    // Si existe, verificar versión
    try {
      const parsed = JSON.parse(consent);
      if (parsed.version !== COOKIE_CONSENT_VERSION) {
        setShow(true); // Mostrar si cambió la política
      }
    } catch {
      setShow(true);
    }

    return undefined;
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    // Guardar en cookie (365 días)
    Cookies.set(COOKIE_CONSENT_KEY, JSON.stringify(prefs), { expires: 365 });

    // Opcional: Enviar a analytics si está permitido
    if (prefs.analytics && typeof window !== 'undefined') {
      // window.gtag?.('consent', 'update', {
      //   analytics_storage: 'granted',
      // });
    }

    setShow(false);
  };

  const acceptAll = () => {
    savePreferences({
      essential: true,
      analytics: true,
      marketing: true,
      version: COOKIE_CONSENT_VERSION,
    });
  };

  const acceptEssential = () => {
    savePreferences({
      essential: true,
      analytics: false,
      marketing: false,
      version: COOKIE_CONSENT_VERSION,
    });
  };

  const saveCustom = () => {
    savePreferences(preferences);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 pb-4 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div
          className={cn(
            'rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] shadow-lg',
            'p-6'
          )}
        >
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">🍪 Usamos cookies</h3>
            <p className="text-sm text-[var(--color-foreground)]/70">
              Utilizamos cookies para mejorar tu experiencia, analizar el tráfico del sitio y
              personalizar contenido.{' '}
              <a
                href="/privacy"
                className="text-[var(--color-primary)] hover:underline"
                target="_blank"
                rel="noopener"
              >
                Leer política de privacidad
              </a>
            </p>
          </div>

          {/* Detalles (opcional) */}
          {showDetails && (
            <div className="mb-4 space-y-3 rounded border border-[var(--color-border)] p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="essential"
                  checked={preferences.essential}
                  disabled
                  className="mt-1"
                />
                <div>
                  <label htmlFor="essential" className="font-medium text-sm">
                    Esenciales (Requeridas)
                  </label>
                  <p className="text-xs text-[var(--color-foreground)]/60">
                    Necesarias para el funcionamiento básico del sitio.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="analytics"
                  checked={preferences.analytics}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, analytics: e.target.checked }))
                  }
                  className="mt-1"
                />
                <div>
                  <label htmlFor="analytics" className="font-medium text-sm">
                    Analytics
                  </label>
                  <p className="text-xs text-[var(--color-foreground)]/60">
                    Nos ayudan a entender cómo interactúas con el sitio.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="marketing"
                  checked={preferences.marketing}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, marketing: e.target.checked }))
                  }
                  className="mt-1"
                />
                <div>
                  <label htmlFor="marketing" className="font-medium text-sm">
                    Marketing
                  </label>
                  <p className="text-xs text-[var(--color-foreground)]/60">
                    Se usan para mostrarte contenido relevante.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={acceptAll} size="sm">
              Aceptar todo
            </Button>
            <Button onClick={acceptEssential} variant="outline" size="sm">
              Solo esenciales
            </Button>
            {showDetails ? (
              <Button onClick={saveCustom} variant="outline" size="sm">
                Guardar preferencias
              </Button>
            ) : (
              <Button onClick={() => setShowDetails(true)} variant="outline" size="sm">
                Personalizar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
