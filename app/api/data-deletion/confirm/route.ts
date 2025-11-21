import { type NextRequest, NextResponse } from 'next/server';
import { resend } from '@/lib/email/resend';
import { redis } from '@/lib/rate-limit/redis';
import { deleteUserData } from '@/lib/services/gdpr';

export async function GET(request: NextRequest) {
  try {
    // 1. Obtener token de query params
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ message: 'Token no proporcionado' }, { status: 400 });
    }

    // 2. Verificar token en Redis
    const data = await redis.get<string>(`data-deletion:${token}`);

    if (!data) {
      return NextResponse.json(
        { message: 'El enlace ha expirado o es inválido. Solicita uno nuevo.' },
        { status: 400 }
      );
    }

    // 3. Parsear datos
    const { email, reason } = JSON.parse(data);

    // 4. Eliminar token (uso único)
    await redis.del(`data-deletion:${token}`);

    // 5. Eliminar datos
    const result = await deleteUserData(email);

    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: 404 });
    }

    // 6. Enviar email de confirmación
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@example.com',
        to: email,
        subject: 'Datos eliminados correctamente',
        html: `
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8">
          </head>
          <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Datos Eliminados Correctamente</h2>
            <p>Hemos procesado tu solicitud de eliminación de datos.</p>
            <p>Toda la información asociada a tu email ha sido eliminada permanentemente de nuestros sistemas.</p>
            ${reason ? `<p><strong>Razón indicada:</strong> ${reason}</p>` : ''}
            <p style="color: #666; font-size: 14px;">
              Si esto fue un error, puedes volver a suscribirte en cualquier momento.
            </p>
          </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send deletion confirmation email:', emailError);
    }

    // 7. Redirigir a página de confirmación
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${siteUrl}/data-request?deleted=true`);
  } catch (error) {
    console.error('Data deletion confirm error:', error);
    return NextResponse.json(
      { message: 'Error al eliminar datos. Intenta de nuevo más tarde.' },
      { status: 500 }
    );
  }
}
