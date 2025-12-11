/**
 * Configuracion centralizada de seguridad
 *
 * Este archivo contiene todas las configuraciones de seguridad
 * del proyecto en un solo lugar para facil mantenimiento.
 */

/**
 * Dominios permitidos para CORS
 */
export const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://javierzader.com',
  'https://www.javierzader.com',
  process.env.NEXT_PUBLIC_SITE_URL,
].filter(Boolean) as string[];

/**
 * Dominios permitidos para CSP
 */
export const CSP_ALLOWED_DOMAINS = {
  scripts: [
    'https://vercel.live',
    'https://va.vercel-scripts.com',
    'https://*.giscus.app',
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://*.sanity.io',
    'https://core.sanity-cdn.com',
  ],
  styles: ['https://fonts.googleapis.com', 'https://maxcdn.bootstrapcdn.com'],
  fonts: ['https://fonts.gstatic.com', 'https://maxcdn.bootstrapcdn.com'],
  images: [
    'https://cdn.sanity.io',
    'https://*.sanity.io',
    'https://media.licdn.com',
    'https://avatars.githubusercontent.com',
    'https://img.shields.io',
    'https://badgen.net',
    'https://raw.githubusercontent.com',
    'https://github.com',
    'https://api.securityscorecards.dev',
    'https://codecov.io',
    'https://results.pre-commit.ci',
  ],
  connect: [
    'https://*.sanity.io',
    'https://cdn.sanity.io',
    'https://sanity-cdn.com',
    'https://*.sanity-cdn.com',
    'https://*.upstash.io',
    'https://vitals.vercel-insights.com',
    'https://va.vercel-scripts.com',
    'https://www.google-analytics.com',
    'https://analytics.google.com',
  ],
  frames: ['https://giscus.app'],
};

/**
 * User agents sospechosos para bloquear/log
 */
export const SUSPICIOUS_USER_AGENTS = [
  'curl/',
  'wget/',
  'python-requests/',
  'scrapy/',
  'masscan/',
  'nmap',
  'sqlmap',
  'nikto',
];

/**
 * Headers de seguridad recomendados
 */
export const SECURITY_HEADERS = {
  // Prevenir clickjacking
  'X-Frame-Options': 'DENY',

  // Prevenir MIME-sniffing
  'X-Content-Type-Options': 'nosniff',

  // Politica de referrer
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // XSS Protection (legacy browsers)
  'X-XSS-Protection': '1; mode=block',

  // HSTS (solo produccion)
  ...(process.env.NODE_ENV === 'production' && {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  }),
} as const;

/**
 * Rate limits por endpoint
 */
export const RATE_LIMITS = {
  contact: {
    max: 3,
    window: '10m',
  },
  newsletter: {
    max: 5,
    window: '1h',
  },
  dataDeletion: {
    max: 2,
    window: '1d',
  },
  global: {
    max: 100,
    window: '1m',
  },
} as const;

/**
 * Verifica protección CSRF para requests mutables (POST, PUT, DELETE, PATCH)
 *
 * Implementa verificación de Origin y Referer headers para prevenir
 * Cross-Site Request Forgery attacks.
 *
 * @param request - NextRequest object
 * @returns true si la request es válida, false si es sospechosa
 */
export function verifyCsrf(request: Request): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // En desarrollo, validar pero permitir localhost
  // Esto mantiene la seguridad pero permite testing local
  if (process.env.NODE_ENV === 'development') {
    // Si hay origin, validar que sea localhost
    if (origin) {
      const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
      return isLocalhost || ALLOWED_ORIGINS.includes(origin);
    }
    // Sin origin en desarrollo = permitir (para herramientas de testing)
    return true;
  }

  // Verificar Origin header (más seguro)
  if (origin) {
    const isValidOrigin = ALLOWED_ORIGINS.some(
      (allowed) => origin === allowed || origin.endsWith(`.${new URL(allowed).hostname}`)
    );
    if (!isValidOrigin) {
      return false;
    }
    return true;
  }

  // Fallback a Referer si no hay Origin (algunos browsers legacy)
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const isValidReferer = ALLOWED_ORIGINS.some((allowed) => {
        const allowedUrl = new URL(allowed);
        return refererUrl.hostname === allowedUrl.hostname;
      });
      return isValidReferer;
    } catch {
      return false;
    }
  }

  // Sin Origin ni Referer = rechazar en producción
  return false;
}

/**
 * Response estándar para CSRF inválido
 */
export const CSRF_ERROR_RESPONSE = {
  message: 'Request origin not allowed',
  status: 403,
} as const;

/**
 * Aplica headers de seguridad a una Response
 * Útil para API routes que necesitan headers adicionales
 */
export function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);

  // Aplicar todos los headers de seguridad
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }

  // Headers adicionales para API responses
  headers.set('Cache-Control', 'no-store, max-age=0');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Helper para crear respuestas JSON con headers de seguridad
 */
export function secureJsonResponse(data: unknown, init?: ResponseInit): Response {
  const response = new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  return withSecurityHeaders(response);
}
