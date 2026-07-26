import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { routing } from '@/i18n/routing';
import { logger } from '@/lib/monitoring/logger';
import { RATE_LIMIT_BUCKETS, resolveRateLimitBucket } from '@/lib/rate-limit/policy';
import { getClientIp } from '@/lib/utils/client-ip';

// next-intl locale routing, composed into this middleware below.
const handleI18nRouting = createMiddleware(routing);

// Check if Redis is configured
const isRedisConfigured =
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN &&
  !process.env.UPSTASH_REDIS_REST_URL.includes('dummy');

// Create Redis client (only if configured)
const redis = isRedisConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Page mutations (server actions POST to page paths). Limit is the source of
// truth in lib/rate-limit/policy.ts (RATE_LIMIT_BUCKETS, default 100/min/IP).
const globalRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(RATE_LIMIT_BUCKETS['page-mutation'], '1 m'),
      analytics: true,
      prefix: 'ratelimit:global',
      ephemeralCache: new Map(),
    })
  : null;

// Generous page reads limiter (default 300/min/IP). Normal browsing never
// approaches this, but it bounds amplification attacks where a query param
// (e.g. /blog?search=...) bypasses the Next.js data cache and fans out to
// upstream Sanity API calls.
const pageReadRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(RATE_LIMIT_BUCKETS['page-read'], '1 m'),
      analytics: true,
      prefix: 'ratelimit:page-read',
      ephemeralCache: new Map(),
    })
  : null;

// Stricter rate limiter for API mutations (default 60/min/IP)
const apiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(RATE_LIMIT_BUCKETS['api-mutation'], '1 m'),
      analytics: true,
      prefix: 'ratelimit:api',
      ephemeralCache: new Map(),
    })
  : null;

// Generous limiter for API reads (health checks, resume downloads, etc.,
// default 120/min/IP). Combined with the page-read limiter, normal browsing
// never trips a 429 while upstream amplification is bounded.
const apiReadRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(RATE_LIMIT_BUCKETS['api-read'], '1 m'),
      analytics: true,
      prefix: 'ratelimit:api-read',
      ephemeralCache: new Map(),
    })
  : null;

// Known malicious user agents to block immediately
const BLOCKED_USER_AGENTS = [
  'masscan',
  'nmap',
  'sqlmap',
  'nikto',
  'dirbuster',
  'gobuster',
  'nuclei',
  'whatweb',
  'wpscan',
  'zap',
  'burp',
  'acunetix',
  'nessus',
  'openvas',
];

/**
 * Check if user agent is malicious
 */
function isMaliciousUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BLOCKED_USER_AGENTS.some((bot) => ua.includes(bot));
}

/**
 * Proxy de seguridad global (Next.js 16+)
 * Se ejecuta en TODAS las rutas antes de procesarlas
 * Features: Admin protection, Rate limiting, Bot detection, CSRF protection
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIP = getClientIp(request);
  const userAgent = request.headers.get('user-agent');

  // =========================================
  // ADMIN ROUTE PROTECTION
  // =========================================

  // Non-default locales carry an `/en` prefix (es is prefix-less); strip it
  // before matching internal routes that live under the `[locale]` segment.
  const pathForMatch = pathname.replace(/^\/en(?=\/|$)/, '') || '/';

  // Verificar si es una ruta de admin (excepto login y unauthorized)
  const isAdminRoute = pathForMatch.startsWith('/admin');
  const isAdminLogin = pathForMatch === '/admin/login';
  const isAdminUnauthorized = pathForMatch === '/admin/unauthorized';

  if (isAdminRoute && !isAdminLogin && !isAdminUnauthorized) {
    // Verificar si hay cookie de sesión de NextAuth
    const sessionToken =
      request.cookies.get('authjs.session-token')?.value ??
      request.cookies.get('__Secure-authjs.session-token')?.value;

    if (!sessionToken) {
      // No hay sesión, redirigir a login
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // =========================================
  // MALICIOUS BOT BLOCKING
  // =========================================

  if (isMaliciousUserAgent(userAgent)) {
    logger.warn('Blocked malicious user agent', {
      service: 'proxy',
      action: 'bot-blocked',
      userAgent,
      path: pathname,
      ip: clientIP,
    });
    return new NextResponse('Forbidden', { status: 403 });
  }

  // =========================================
  // GLOBAL RATE LIMITING
  // =========================================

  if (redis) {
    // La política decide qué bucket aplica según ruta + método. Las lecturas
    // de páginas públicas usan un límite generoso para evitar amplificación
    // hacia Sanity; las mutaciones usan buckets estrictos.
    const bucket = resolveRateLimitBucket(pathname, request.method);
    const rateLimiter =
      bucket === 'api-mutation'
        ? apiRateLimiter
        : bucket === 'api-read'
          ? apiReadRateLimiter
          : bucket === 'page-mutation'
            ? globalRateLimiter
            : bucket === 'page-read'
              ? pageReadRateLimiter
              : null;

    if (rateLimiter) {
      const { success, remaining, reset } = await rateLimiter.limit(clientIP);

      if (!success) {
        logger.warn('Rate limit exceeded', {
          service: 'proxy',
          action: 'rate-limit',
          ip: clientIP,
          path: pathname,
        });

        return new NextResponse(
          JSON.stringify({
            error: 'Too many requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: Math.ceil((reset - Date.now()) / 1000),
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
              'X-RateLimit-Remaining': String(remaining),
              'X-RateLimit-Reset': String(reset),
            },
          }
        );
      }
    }
  }

  // Base response: run next-intl locale routing for localizable pages. API
  // routes and Sanity Studio live outside the `[locale]` segment, so they pass
  // through untouched. Security headers below apply on top of either response.
  const skipI18n = pathname.startsWith('/api/') || pathname.startsWith('/studio');
  const response = skipI18n ? NextResponse.next() : handleI18nRouting(request);

  // =========================================
  // SECURITY HEADERS - Refuerzo adicional
  // =========================================

  // Prevenir clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevenir MIME-sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Politica de referrer
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // XSS auditor legacy deshabilitado (mode=block tenía vulns propias); CSP es la protección real
  response.headers.set('X-XSS-Protection', '0');

  // =========================================
  // BOT DETECTION - Logging (suspicious but not blocked)
  // =========================================

  const suspiciousBots = ['curl/', 'wget/', 'python-requests/', 'scrapy/', 'httpx/', 'axios/'];
  const ua = userAgent?.toLowerCase() ?? '';
  const isSuspiciousBot = suspiciousBots.some((bot) => ua.includes(bot));

  if (isSuspiciousBot) {
    logger.info('Suspicious bot detected', {
      service: 'proxy',
      action: 'bot-detection',
      userAgent,
      path: pathname,
      ip: clientIP,
    });
  }

  // =========================================
  // CSRF PROTECTION - Validar origin
  // =========================================

  // Solo para metodos que modifican estado
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');

    // Lista de origenes permitidos
    const allowedOrigins = [
      'http://localhost:3000',
      'https://javierzader.com',
      'https://www.javierzader.com',
      process.env.NEXT_PUBLIC_SITE_URL,
    ].filter(Boolean);

    // Validar origin
    if (origin && host) {
      const originHost = new URL(origin).host;
      const isAllowed = allowedOrigins.some((allowed) => {
        if (!allowed) return false;
        const allowedHost = new URL(allowed).host;
        return originHost === allowedHost;
      });

      if (!isAllowed) {
        logger.warn('CSRF attempt detected', {
          service: 'proxy',
          action: 'csrf-protection',
          origin,
          host,
          path: pathname,
        });

        return new NextResponse('Forbidden - Invalid Origin', {
          status: 403,
        });
      }
    }
  }

  // Agregar header con IP del cliente para API routes
  response.headers.set('X-Client-IP', clientIP);

  return response;
}

/**
 * Configuracion del proxy (Next.js 16+)
 * Aplica a todas las rutas excepto:
 * - Archivos estaticos (_next/static)
 * - Imagenes (_next/image)
 * - Favicon
 * - Archivos publicos
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)$).*)',
  ],
};
