/**
 * Política de rate limiting del proxy (batch 6). Antes UN bucket global
 * (100 req/min/IP) cubría TODA request no estática — incluidas navegaciones
 * de solo lectura y prefetches RSC — y una sesión normal de browsing podía
 * 429. Ahora: lecturas de página con un bucket generoso (300 req/min/IP),
 * lecturas de API con bucket generoso y buckets estrictos solo para mutaciones
 * (donde está el abuso). Los endpoints sensibles mantienen sus limitadores
 * propios en `lib/rate-limit/redis.ts`.
 */
export type RateLimitBucket = 'page-mutation' | 'page-read' | 'api-mutation' | 'api-read';

const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function resolveRateLimitBucket(pathname: string, method: string): RateLimitBucket {
  const isRead = READ_METHODS.has(method.toUpperCase());
  if (pathname.startsWith('/api/')) {
    return isRead ? 'api-read' : 'api-mutation';
  }
  return isRead ? 'page-read' : 'page-mutation';
}
