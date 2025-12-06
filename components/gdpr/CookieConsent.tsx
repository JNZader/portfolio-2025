'use client';

import Cookies from 'js-cookie';
import { BarChart3, Cookie, Megaphone, Settings2, Shield, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { setDefaultGAConsent, updateGAConsent } from '@/lib/analytics/consent';
import { cn } from '@/lib/utils';

const COOKIE_CONSENT_KEY = 'cookie-consent';
const COOKIE_CONSENT_VERSION = '1.0';

interface CookiePreferences {
  essential: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  version: string;
}

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function ToggleSwitch({ id, checked, onChange, disabled }: ToggleSwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        checked ? 'bg-primary' : 'bg-muted-foreground/30',
        disabled && 'cursor-not-allowed opacity-60'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
}

export function CookieConsent() {
  const [show, setShow] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    version: COOKIE_CONSENT_VERSION,
  });
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDefaultGAConsent();

    const consent = Cookies.get(COOKIE_CONSENT_KEY);

    if (!consent) {
      const timer = setTimeout(() => {
        setShow(true);
        // Trigger animation after mount
        requestAnimationFrame(() => setIsVisible(true));
      }, 1000);
      return () => clearTimeout(timer);
    }

    try {
      const parsed = JSON.parse(consent);
      if (parsed.version !== COOKIE_CONSENT_VERSION) {
        setShow(true);
        requestAnimationFrame(() => setIsVisible(true));
      } else {
        updateGAConsent(parsed.analytics);
      }
    } catch {
      setShow(true);
      requestAnimationFrame(() => setIsVisible(true));
    }

    return undefined;
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    Cookies.set(COOKIE_CONSENT_KEY, JSON.stringify(prefs), { expires: 365 });
    updateGAConsent(prefs.analytics);
    setIsVisible(false);
    // Clear any existing timeout and set new one
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => setShow(false), 300);
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
    <section
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 p-4 transition-all duration-300 ease-out',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      )}
      aria-label="Consentimiento de cookies"
    >
      <div className="mx-auto max-w-2xl">
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl">
          {/* Decorative gradient */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Cookie className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Preferencias de privacidad</h3>
                  <p className="text-xs text-muted-foreground">Tu privacidad es importante</p>
                </div>
              </div>
              <button
                type="button"
                onClick={acceptEssential}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Cerrar y aceptar solo esenciales"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-5">
              Usamos cookies para mejorar tu experiencia y analizar el tráfico.{' '}
              <a
                href="/privacy"
                className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
              >
                Política de privacidad
              </a>
            </p>

            {/* Cookie Options (expanded) */}
            {showDetails && (
              <div className="mb-5 space-y-3">
                {/* Essential */}
                <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                      <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <label htmlFor="essential" className="font-medium text-sm text-foreground">
                        Esenciales
                      </label>
                      <p className="text-xs text-muted-foreground">Siempre activas</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    id="essential"
                    checked={preferences.essential}
                    onChange={() => {}}
                    disabled
                  />
                </div>

                {/* Analytics */}
                <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                      <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <label htmlFor="analytics" className="font-medium text-sm text-foreground">
                        Analíticas
                      </label>
                      <p className="text-xs text-muted-foreground">Métricas anónimas de uso</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    id="analytics"
                    checked={preferences.analytics}
                    onChange={(checked) =>
                      setPreferences((prev) => ({ ...prev, analytics: checked }))
                    }
                  />
                </div>

                {/* Marketing */}
                <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                      <Megaphone className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <label htmlFor="marketing" className="font-medium text-sm text-foreground">
                        Marketing
                      </label>
                      <p className="text-xs text-muted-foreground">Contenido personalizado</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    id="marketing"
                    checked={preferences.marketing}
                    onChange={(checked) =>
                      setPreferences((prev) => ({ ...prev, marketing: checked }))
                    }
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-2">
              {showDetails ? (
                <Button onClick={saveCustom} variant="outline" className="flex-1 rounded-xl">
                  Guardar preferencias
                </Button>
              ) : (
                <Button
                  onClick={() => setShowDetails(true)}
                  variant="ghost"
                  className="flex-1 rounded-xl text-muted-foreground hover:text-foreground"
                >
                  <Settings2 className="mr-2 h-4 w-4" />
                  Personalizar
                </Button>
              )}
              <Button onClick={acceptEssential} variant="outline" className="flex-1 rounded-xl">
                Solo necesarias
              </Button>
              <Button
                onClick={acceptAll}
                className="flex-1 rounded-xl bg-primary hover:bg-primary/90"
              >
                Aceptar todas
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
