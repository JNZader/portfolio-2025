/**
 * Shared utilities for GDPR API routes
 * Consolidates common patterns: CSRF, rate limiting, token verification
 */

import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/monitoring/logger';
import { createRateLimiter, safeRedisOp } from '@/lib/rate-limit/redis';
import { CSRF_ERROR_RESPONSE, verifyCsrf } from '@/lib/security/security-config';

// Response messages
export const MESSAGES = {
  csrfFailed: CSRF_ERROR_RESPONSE.message,
  ipRateLimit: 'Demasiadas solicitudes desde tu IP. Intenta de nuevo en 1 hora.',
  emailRateLimit: (period: string) => `Demasiadas solicitudes. Intenta de nuevo ${period}.`,
  invalidData: 'Datos inválidos',
  emailNotFound: 'Si el email existe en nuestro sistema, recibirás un enlace de verificación.',
  emailSent: 'Te enviamos un email de verificación. Revisa tu bandeja de entrada.',
  tokenMissing: 'Token no proporcionado',
  tokenExpired: 'El enlace ha expirado o es inválido. Solicita uno nuevo.',
  serverError: 'Error al procesar la solicitud. Intenta de nuevo más tarde.',
} as const;

/**
 * Get client IP from request headers
 */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

type RateLimitWindow = `${number} ${'s' | 'm' | 'h' | 'd'}`;

/**
 * Create rate limiters for GDPR endpoints
 */
export function createGdprRateLimiters(
  prefix: string,
  emailLimit: number,
  emailWindow: RateLimitWindow
) {
  return {
    ip: createRateLimiter(`${prefix}-ip`, 5, '1 h'),
    email: createRateLimiter(prefix, emailLimit, emailWindow),
  };
}

type VerifyRequestResult =
  | { success: false; response: NextResponse }
  | { success: true; email: string; body: Record<string, unknown> };

/**
 * Common verification flow for GDPR POST requests:
 * 1. CSRF verification
 * 2. IP rate limiting
 * 3. Body parsing & validation
 * 4. Subscriber verification (without revealing if exists)
 * 5. Email rate limiting
 */
export async function verifyGdprRequest(
  request: NextRequest,
  schema: {
    safeParse: (data: unknown) => {
      success: boolean;
      data?: { email: string };
      error?: { issues: unknown[] };
    };
  },
  rateLimiters: {
    ip: ReturnType<typeof createRateLimiter>;
    email: ReturnType<typeof createRateLimiter>;
  },
  path: string,
  rateLimitPeriod: string
): Promise<VerifyRequestResult> {
  // 1. CSRF Protection
  if (!verifyCsrf(request)) {
    logger.warn('CSRF validation failed', {
      path,
      origin: request.headers.get('origin'),
    });
    return {
      success: false,
      response: NextResponse.json(
        { message: MESSAGES.csrfFailed },
        { status: CSRF_ERROR_RESPONSE.status }
      ),
    };
  }

  // 2. IP rate limiting
  const ip = getClientIp(request);
  const { success: ipSuccess } = await rateLimiters.ip.limit(ip);
  if (!ipSuccess) {
    return {
      success: false,
      response: NextResponse.json({ message: MESSAGES.ipRateLimit }, { status: 429 }),
    };
  }

  // 3. Parse & validate body
  const body = await request.json();
  const validationResult = schema.safeParse(body);

  if (!validationResult.success || !validationResult.data) {
    return {
      success: false,
      response: NextResponse.json(
        { message: MESSAGES.invalidData, errors: validationResult.error?.issues },
        { status: 400 }
      ),
    };
  }

  const { email } = validationResult.data;

  // 4. Verify subscriber exists (without revealing)
  const subscriber = await prisma.subscriber.findUnique({ where: { email } });
  if (!subscriber) {
    return {
      success: false,
      response: NextResponse.json({ success: true, message: MESSAGES.emailNotFound }),
    };
  }

  // 5. Email rate limiting
  const { success: emailSuccess } = await rateLimiters.email.limit(email);
  if (!emailSuccess) {
    return {
      success: false,
      response: NextResponse.json(
        { message: MESSAGES.emailRateLimit(rateLimitPeriod) },
        { status: 429 }
      ),
    };
  }

  return { success: true, email, body };
}

/**
 * Verify token from Redis and delete it (single use)
 */
export async function verifyAndConsumeToken<T = string>(
  token: string,
  prefix: string
): Promise<T | null> {
  const data = await safeRedisOp((client) => client.get<T>(`${prefix}:${token}`));
  if (!data) return null;

  // Delete token (single use)
  await safeRedisOp((client) => client.del(`${prefix}:${token}`));
  return data;
}

/**
 * Store token in Redis with expiration
 */
export async function storeToken(
  prefix: string,
  token: string,
  data: string,
  expirationSeconds = 900
): Promise<void> {
  await safeRedisOp((client) => client.set(`${prefix}:${token}`, data, { ex: expirationSeconds }));
}
