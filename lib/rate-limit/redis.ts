import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Check if Redis is properly configured
 * In CI/testing, we use a no-op rate limiter
 */
const isRedisConfigured =
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN &&
  !process.env.UPSTASH_REDIS_REST_URL.includes('dummy');

/**
 * Cliente Redis de Upstash
 * Only created if properly configured
 */
export const redis = isRedisConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

/**
 * No-op rate limiter for CI/testing
 * Always allows requests
 */
const noopRateLimiter = {
  limit: async () => ({
    success: true,
    limit: 1000,
    remaining: 999,
    reset: Date.now() + 60000,
  }),
};

/**
 * Rate limiter: 3 emails cada 10 minutos por IP (100 en dev)
 * Balance ideal para producción: previene spam sin frustrar usuarios legítimos
 */
export const contactRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(process.env.NODE_ENV === 'development' ? 100 : 3, '10 m'),
      analytics: true,
      prefix: 'ratelimit:contact',
    })
  : noopRateLimiter;

/**
 * Helper para obtener identificador del cliente
 * Usa IP o fallback a 'anonymous'
 */
export function getClientIdentifier(request: Request): string {
  // Intentar obtener IP real (considerando proxies)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  const ip = forwarded?.split(',')[0] || realIp || 'anonymous';

  return ip.trim();
}

/**
 * Rate limiter para newsletter: 5 suscripciones por hora por IP (100 en dev)
 */
export const newsletterRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(process.env.NODE_ENV === 'development' ? 100 : 5, '1 h'),
      analytics: true,
      prefix: 'ratelimit:newsletter',
    })
  : noopRateLimiter;

/**
 * Rate limiter para unsubscribe: 10 requests por hora por IP
 * Previene enumeración de tokens
 */
export const unsubscribeRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(process.env.NODE_ENV === 'development' ? 100 : 10, '1 h'),
      analytics: true,
      prefix: 'ratelimit:unsubscribe',
    })
  : noopRateLimiter;

/**
 * Rate limiter para resume/CV download: 10 por hora por IP
 * Previene DoS en endpoint de generación de PDF
 */
export const resumeRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(process.env.NODE_ENV === 'development' ? 100 : 10, '1 h'),
      analytics: true,
      prefix: 'ratelimit:resume',
    })
  : noopRateLimiter;

/**
 * Factory function para crear rate limiters personalizados
 * Centraliza la configuración y facilita mantenimiento
 * Returns noop limiter if Redis is not configured
 */
export function createRateLimiter(
  prefix: string,
  max: number,
  window: `${number} ${'s' | 'm' | 'h' | 'd'}`
): Ratelimit | typeof noopRateLimiter {
  if (!redis) return noopRateLimiter;

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(process.env.NODE_ENV === 'development' ? 100 : max, window),
    analytics: true,
    prefix: `ratelimit:${prefix}`,
  });
}
