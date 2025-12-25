import { type NextRequest, NextResponse } from 'next/server';
import { MESSAGES, verifyAndConsumeToken } from '@/lib/api/gdpr-utils';
import { logger } from '@/lib/monitoring/logger';
import { confirmRateLimiter, getClientIdentifier } from '@/lib/rate-limit/redis';
import { exportUserData } from '@/lib/services/gdpr';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const { success } = await confirmRateLimiter.limit(clientId);

    if (!success) {
      logger.warn('Data export confirm rate limit exceeded', { ip: clientId });
      return NextResponse.json(
        { message: 'Demasiadas solicitudes. Intenta de nuevo en 1 hora.' },
        { status: 429, headers: { 'Retry-After': '3600' } }
      );
    }

    // Get token from query params
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ message: MESSAGES.tokenMissing }, { status: 400 });
    }

    // Verify and consume token
    const email = await verifyAndConsumeToken<string>(token, 'data-export');

    if (!email) {
      return NextResponse.json({ message: MESSAGES.tokenExpired }, { status: 400 });
    }

    // Export data
    const userData = await exportUserData(email);

    if (!userData) {
      return NextResponse.json(
        { message: 'No se encontraron datos para este email' },
        { status: 404 }
      );
    }

    // Return JSON for download
    return new NextResponse(JSON.stringify(userData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="data-export-${email}-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    logger.error('Data export confirm failed', error as Error, {
      path: '/api/data-export/confirm',
      method: 'GET',
    });
    return NextResponse.json(
      { message: 'Error al exportar datos. Intenta de nuevo más tarde.' },
      { status: 500 }
    );
  }
}
