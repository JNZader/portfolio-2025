import type { NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';

/**
 * Lista de emails de administradores autorizados
 * Solo estos usuarios pueden acceder al dashboard de admin
 */
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim().toLowerCase()) ?? [];

/**
 * Detecta automáticamente la URL base según el ambiente
 * Prioridad:
 * 1. AUTH_URL (si está configurada explícitamente)
 * 2. VERCEL_URL (en Vercel - automático)
 * 3. NEXT_PUBLIC_SITE_URL (fallback)
 * 4. localhost:3000 (desarrollo local)
 */
function getBaseUrl(): string {
  // Si hay AUTH_URL explícita, usarla
  if (process.env.AUTH_URL) {
    return process.env.AUTH_URL;
  }

  // En Vercel, usar VERCEL_URL (incluye preview deployments)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // En producción de Vercel, usar la URL del sitio
  if (process.env.VERCEL_ENV === 'production' && process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // Fallback para desarrollo local
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

// URL base detectada automáticamente
const baseUrl = getBaseUrl();

// Exportar para uso en otros lugares si es necesario
export { baseUrl as authBaseUrl };

// Detectar si estamos en un ambiente de confianza (Vercel, localhost)
const isVercel = !!process.env.VERCEL;

export const authConfig: NextAuthConfig = {
  // Confiar en el host en Vercel (necesario para HTTPS)
  trustHost: isVercel || process.env.NODE_ENV === 'development',
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  // Debug solo en desarrollo
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdmin = auth?.user?.email
        ? ADMIN_EMAILS.includes(auth.user.email.toLowerCase())
        : false;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnLogin = nextUrl.pathname === '/admin/login';

      // Permitir acceso a la página de login sin autenticación
      if (isOnLogin) {
        if (isLoggedIn && isAdmin) {
          return Response.redirect(new URL('/admin', nextUrl));
        }
        return true;
      }

      // Proteger rutas de admin
      if (isOnAdmin) {
        if (!isLoggedIn) {
          return false; // Redirige a login
        }
        if (!isAdmin) {
          return Response.redirect(new URL('/admin/unauthorized', nextUrl));
        }
        return true;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user?.email) {
        const isAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase());
        token.isAdmin = isAdmin;
        // Debug en desarrollo (sin exponer lista completa de admins)
        if (process.env.NODE_ENV === 'development') {
          console.log('[Auth] Admin check:', {
            userEmail: user.email,
            adminCount: ADMIN_EMAILS.length,
            isAdmin,
          });
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 horas
  },
};
