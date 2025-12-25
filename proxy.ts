import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { logger } from '@/lib/monitoring/logger';

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

// Global rate limiter: 100 requests per minute per IP
const globalRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      analytics: true,
      prefix: 'ratelimit:global',
    })
  : null;

// Stricter rate limiter for API routes: 60 requests per minute
const apiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, '1 m'),
      analytics: true,
      prefix: 'ratelimit:api',
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
 * Get client IP from request headers
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  return cfConnectingIp ?? forwarded?.split(',')[0]?.trim() ?? realIp ?? 'unknown';
}

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
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get('user-agent');

  // =========================================
  // ADMIN ROUTE PROTECTION
  // =========================================

  // Verificar si es una ruta de admin (excepto login y unauthorized)
  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminLogin = pathname === '/admin/login';
  const isAdminUnauthorized = pathname === '/admin/unauthorized';

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
    const rateLimiter = pathname.startsWith('/api/') ? apiRateLimiter : globalRateLimiter;

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

  // Clona la respuesta para poder modificar headers
  const response = NextResponse.next();

  // =========================================
  // SECURITY HEADERS - Refuerzo adicional
  // =========================================

  // Prevenir clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevenir MIME-sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Politica de referrer
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // XSS Protection para navegadores legacy
  response.headers.set('X-XSS-Protection', '1; mode=block');

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
        return originHost === allowedHost || originHost === host;
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
