import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/monitoring/logger';

/**
 * Proxy de seguridad global (Next.js 16+)
 * Se ejecuta en TODAS las rutas antes de procesarlas
 * Reemplaza el antiguo middleware.ts
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
      request.cookies.get('authjs.session-token')?.value ||
      request.cookies.get('__Secure-authjs.session-token')?.value;

    if (!sessionToken) {
      // No hay sesión, redirigir a login
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
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
  // BOT DETECTION - Logging basico
  // =========================================

  const userAgent = request.headers.get('user-agent') || '';
  const suspiciousBots = [
    'curl/',
    'wget/',
    'python-requests/',
    'scrapy/',
    'masscan/',
  ];

  // Detectar bots sospechosos
  const isSuspiciousBot = suspiciousBots.some((bot) =>
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );

  if (isSuspiciousBot) {
    logger.warn('Suspicious bot detected', {
      service: 'proxy',
      action: 'bot-detection',
      userAgent,
      path: request.nextUrl.pathname,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    });

    // Opcional: Bloquear bots sospechosos (descomentar si deseas)
    // return new NextResponse('Forbidden', { status: 403 });
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
          path: request.nextUrl.pathname,
        });

        return new NextResponse('Forbidden - Invalid Origin', {
          status: 403,
        });
      }
    }
  }

  // =========================================
  // RATE LIMITING HINT
  // =========================================

  // Agregar header para rate limiting (lo procesaran las API routes)
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
  response.headers.set('X-Client-IP', clientIp);

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
