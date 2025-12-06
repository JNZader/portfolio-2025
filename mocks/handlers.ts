import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock newsletter subscribe
  http.post('/api/newsletter/subscribe', async ({ request }) => {
    const body = (await request.json()) as { email?: string };

    // Simular validación
    if (!body.email || !body.email.includes('@')) {
      return HttpResponse.json({ success: false, message: 'Email inválido' }, { status: 400 });
    }

    return HttpResponse.json({
      success: true,
      message: 'Te hemos enviado un email de confirmación',
    });
  }),

  // Mock contact form
  http.post('/api/contact', async ({ request }) => {
    const body = (await request.json()) as { name?: string; email?: string; message?: string };

    if (!body.name || !body.email || !body.message) {
      return HttpResponse.json(
        { success: false, message: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: 'Mensaje enviado correctamente',
    });
  }),

  // Mock data export
  http.post('/api/data-export', async ({ request }) => {
    const body = (await request.json()) as { email: string };

    return HttpResponse.json({
      personal_information: {
        email: body.email,
        subscribed_at: '2025-01-01',
      },
    });
  }),
];
