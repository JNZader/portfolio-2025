import { Ratelimit } from '@upstash/ratelimit';
import { type NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { redis } from '@/lib/rate-limit/redis';
import { deleteUserData } from '@/lib/services/gdpr';
import { dataDeletionSchema } from '@/lib/validations/gdpr';

const resend = new Resend(process.env.RESEND_API_KEY);

// Rate limiter: 2 eliminaciones por día
const deletionRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(2, '24 h'),
  prefix: 'ratelimit:data-deletion',
});

export async function POST(request: NextRequest) {
  try {
    // 1. Parse body
    const body = await request.json();

    // 2. Validate
    const validationResult = dataDeletionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { email, reason } = validationResult.data;

    // 3. Rate limiting
    const { success } = await deletionRateLimiter.limit(email);
    if (!success) {
      return NextResponse.json(
        { message: 'Demasiadas solicitudes. Intenta de nuevo mañana.' },
        { status: 429 }
      );
    }

    // 4. Eliminar datos
    const result = await deleteUserData(email);

    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: 404 });
    }

    // 5. Enviar email de confirmación (opcional)
    try {
      await resend.emails.send({
        from: 'noreply@tudominio.com',
        to: email,
        subject: 'Confirmación de eliminación de datos',
        html: `
          <h2>Datos eliminados correctamente</h2>
          <p>Hemos procesado tu solicitud de eliminación de datos.</p>
          <p>Toda la información asociada a tu email ha sido eliminada permanentemente de nuestros sistemas.</p>
          ${reason ? `<p><strong>Razón:</strong> ${reason}</p>` : ''}
          <p>Si esto fue un error, puedes volver a suscribirte en cualquier momento.</p>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send deletion confirmation email:', emailError);
      // No fallar la request si el email falla
    }

    return NextResponse.json({
      success: true,
      message: 'Todos tus datos han sido eliminados permanentemente',
    });
  } catch (error) {
    console.error('Data deletion error:', error);
    return NextResponse.json(
      { message: 'Error al eliminar datos. Intenta de nuevo más tarde.' },
      { status: 500 }
    );
  }
}
