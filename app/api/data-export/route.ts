import { Ratelimit } from '@upstash/ratelimit';
import { type NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/rate-limit/redis';
import { exportUserData } from '@/lib/services/gdpr';
import { dataExportSchema } from '@/lib/validations/gdpr';

// Rate limiter: 3 exportaciones por hora
const exportRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  prefix: 'ratelimit:data-export',
});

export async function POST(request: NextRequest) {
  try {
    // 1. Parse body
    const body = await request.json();

    // 2. Validate
    const validationResult = dataExportSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // 3. Rate limiting
    const { success } = await exportRateLimiter.limit(email);
    if (!success) {
      return NextResponse.json(
        { message: 'Demasiadas solicitudes. Intenta de nuevo en 1 hora.' },
        { status: 429 }
      );
    }

    // 4. Exportar datos
    const userData = await exportUserData(email);

    if (!userData) {
      return NextResponse.json(
        { message: 'No se encontraron datos para este email' },
        { status: 404 }
      );
    }

    // 5. Devolver JSON para descarga
    return new NextResponse(JSON.stringify(userData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="data-export-${email}-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error('Data export error:', error);
    return NextResponse.json(
      { message: 'Error al exportar datos. Intenta de nuevo más tarde.' },
      { status: 500 }
    );
  }
}
