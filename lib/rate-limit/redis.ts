import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Cliente Redis de Upstash
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Rate limiter: 3 emails cada 10 minutos por IP
 * Balance ideal para producción: previene spam sin frustrar usuarios legítimos
 */
export const contactRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '10 m'),
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
