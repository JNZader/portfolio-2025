import { type NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/rate-limit/redis';
import { exportUserData } from '@/lib/services/gdpr';

export async function GET(request: NextRequest) {
  try {
    // 1. Obtener token de query params
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ message: 'Token no proporcionado' }, { status: 400 });
    }

    // 2. Verificar token en Redis
    const email = await redis.get<string>(`data-export:${token}`);

    if (!email) {
      return NextResponse.json(
        { message: 'El enlace ha expirado o es inválido. Solicita uno nuevo.' },
        { status: 400 }
      );
    }

    // 3. Eliminar token (uso único)
    await redis.del(`data-export:${token}`);

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
    console.error('Data export confirm error:', error);
    return NextResponse.json(
      { message: 'Error al exportar datos. Intenta de nuevo más tarde.' },
      { status: 500 }
    );
  }
}
