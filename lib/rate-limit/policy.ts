/**
 * Política de rate limiting del proxy (batch 6). Antes UN bucket global
 * (100 req/min/IP) cubría TODA request no estática — incluidas navegaciones
 * de solo lectura y prefetches RSC — y una sesión normal de browsing podía
 * 429. Ahora: lecturas de página con un bucket generoso (300 req/min/IP),
 * lecturas de API con bucket generoso y buckets estrictos solo para mutaciones
 * (donde está el abuso). Los endpoints sensibles mantienen sus limitadores
 * propios en `lib/rate-limit/redis.ts`.
 *
 * Los límites de cada bucket son configurables por variables de entorno
 * (RATE_LIMIT_PAGE_READ, RATE_LIMIT_PAGE_MUTATION, RATE_LIMIT_API_READ,
 * RATE_LIMIT_API_MUTATION). Valores ausentes o inválidos caen a los defaults.
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

/** Defaults seguros (requests por minuto por IP) cuando no hay override por env. */
export const DEFAULT_BUCKET_LIMITS: Record<RateLimitBucket, number> = {
  'page-read': 300,
  'page-mutation': 100,
  'api-read': 120,
  'api-mutation': 60,
} as const;

/** Variables de entorno que sobreescriben cada bucket. */
export const BUCKET_ENV_VARS: Record<RateLimitBucket, string> = {
  'page-read': 'RATE_LIMIT_PAGE_READ',
  'page-mutation': 'RATE_LIMIT_PAGE_MUTATION',
  'api-read': 'RATE_LIMIT_API_READ',
  'api-mutation': 'RATE_LIMIT_API_MUTATION',
} as const;

/**
 * Parsea un override de env como entero positivo; cualquier valor ausente,
 * no numérico o <= 0 cae al default.
 */
function parseBucketLimit(raw: string | undefined, fallback: number): number {
  if (raw === undefined) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Límites efectivos por bucket (requests/minuto/IP). Fuente de verdad de la
 * política del proxy — `proxy.ts` los aplica y
 * `lib/security/security-config.ts` los referencia en `RATE_LIMITS`.
 */
export const RATE_LIMIT_BUCKETS: Record<RateLimitBucket, number> = {
  'page-read': parseBucketLimit(
    process.env[BUCKET_ENV_VARS['page-read']],
    DEFAULT_BUCKET_LIMITS['page-read']
  ),
  'page-mutation': parseBucketLimit(
    process.env[BUCKET_ENV_VARS['page-mutation']],
    DEFAULT_BUCKET_LIMITS['page-mutation']
  ),
  'api-read': parseBucketLimit(
    process.env[BUCKET_ENV_VARS['api-read']],
    DEFAULT_BUCKET_LIMITS['api-read']
  ),
  'api-mutation': parseBucketLimit(
    process.env[BUCKET_ENV_VARS['api-mutation']],
    DEFAULT_BUCKET_LIMITS['api-mutation']
  ),
};
