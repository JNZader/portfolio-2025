'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({ error }: Readonly<{ error: Error & { digest?: string } }>) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: {
        errorBoundary: 'global',
      },
    });
  }, [error]);

  return (
    <html lang="es">
      <body>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>¡Algo salió muy mal!</h1>
          <p>Hemos sido notificados y estamos trabajando en una solución.</p>
          <button
            onClick={() => {
              globalThis.location.href = '/';
            }}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
            }}
            type="button"
          >
            Ir al inicio
          </button>
        </div>
      </body>
    </html>
  );
}
