import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de seguridad global
 * Se ejecuta en TODAS las rutas antes de procesarlas
 */
export function middleware(request: NextRequest) {
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
    // Log para monitoreo (en produccion puedes enviar a Sentry)
    console.warn('[Security] Suspicious bot detected:', {
      userAgent,
      path: request.nextUrl.pathname,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      timestamp: new Date().toISOString(),
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
        console.warn('[Security] CSRF attempt detected:', {
          origin,
          host,
          path: request.nextUrl.pathname,
          timestamp: new Date().toISOString(),
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
 * Configuracion del middleware
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
