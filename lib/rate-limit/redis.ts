import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Cliente Redis de Upstash
 * Falls back to dummy values for CI builds
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'https://dummy-redis.upstash.io',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'dummy_token_for_ci_build',
});

/**
 * Rate limiter: 3 emails cada 10 minutos por IP (100 en dev)
 * Balance ideal para producción: previene spam sin frustrar usuarios legítimos
 */
export const contactRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(process.env.NODE_ENV === 'development' ? 100 : 3, '10 m'),
  analytics: true,
  prefix: 'ratelimit:contact',
});

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
export const newsletterRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(process.env.NODE_ENV === 'development' ? 100 : 5, '1 h'),
  analytics: true,
  prefix: 'ratelimit:newsletter',
});

/**
 * Rate limiter para unsubscribe: 10 requests por hora por IP
 * Previene enumeración de tokens
 */
export const unsubscribeRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(process.env.NODE_ENV === 'development' ? 100 : 10, '1 h'),
  analytics: true,
  prefix: 'ratelimit:unsubscribe',
});

/**
 * Rate limiter para resume/CV download: 10 por hora por IP
 * Previene DoS en endpoint de generación de PDF
 */
export const resumeRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(process.env.NODE_ENV === 'development' ? 100 : 10, '1 h'),
  analytics: true,
  prefix: 'ratelimit:resume',
});

/**
 * Factory function para crear rate limiters personalizados
 * Centraliza la configuración y facilita mantenimiento
 */
export function createRateLimiter(
  prefix: string,
  max: number,
  window: `${number} ${'s' | 'm' | 'h' | 'd'}`
): Ratelimit {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(process.env.NODE_ENV === 'development' ? 100 : max, window),
    analytics: true,
    prefix: `ratelimit:${prefix}`,
  });
}
