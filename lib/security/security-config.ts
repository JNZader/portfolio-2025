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
    'https://*.giscus.app',
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
  ],
  styles: ['https://fonts.googleapis.com'],
  fonts: ['https://fonts.gstatic.com'],
  images: ['https://cdn.sanity.io', 'https://*.sanity.io', 'https://media.licdn.com'],
  connect: [
    'https://*.sanity.io',
    'https://cdn.sanity.io',
    'https://*.upstash.io',
    'https://vitals.vercel-insights.com',
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
