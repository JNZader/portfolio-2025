import type { Metadata } from 'next';
import { DataDeletionForm } from '@/components/gdpr/DataDeletionForm';
import { DataRequestForm } from '@/components/gdpr/DataRequestForm';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';

export const metadata: Metadata = {
  title: 'Solicitud de Datos',
  description: 'Ejercer tus derechos GDPR de acceso y eliminación de datos',
};

export default function DataRequestPage() {
  return (
    <Container className="py-12">
      <Section>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Solicitud de Datos</h1>
          <p className="text-lg text-[var(--color-foreground)]/70 mb-12">
            Ejerce tus derechos GDPR de acceso y eliminación de datos
          </p>

          <div className="space-y-12">
            {/* Exportar Datos */}
            <div className="border border-[var(--color-border)] rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-2">📥 Exportar mis datos (Art. 15 GDPR)</h2>
              <p className="text-[var(--color-foreground)]/70 mb-6">
                Descarga una copia de toda la información que tenemos sobre ti en formato JSON.
              </p>
              <DataRequestForm />
            </div>

            {/* Eliminar Datos */}
            <div className="border border-red-200 dark:border-red-900 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-2 text-red-600 dark:text-red-400">
                🗑️ Eliminar mis datos (Art. 17 GDPR)
              </h2>
              <p className="text-[var(--color-foreground)]/70 mb-6">
                Solicita la eliminación permanente de todos tus datos personales. Esta acción es
                <strong> irreversible</strong>.
              </p>
              <DataDeletionForm />
            </div>

            {/* Información adicional */}
            <div className="bg-[var(--color-muted)] rounded-lg p-6">
              <h3 className="font-semibold mb-3">ℹ️ Información importante</h3>
              <ul className="space-y-2 text-sm text-[var(--color-foreground)]/70">
                <li>
                  • <strong>Tiempo de respuesta:</strong> Las solicitudes se procesan inmediatamente
                </li>
                <li>
                  • <strong>Verificación:</strong> Solo puedes solicitar datos del email que
                  proporcionas
                </li>
                <li>
                  • <strong>Rate limiting:</strong> Máximo 3 exportaciones/hora, 2 eliminaciones/día
                </li>
                <li>
                  • <strong>Formato:</strong> Los datos se exportan en formato JSON legible
                </li>
                <li>
                  • <strong>Contacto:</strong> Para consultas:{' '}
                  <a href="mailto:privacy@tudominio.com" className="text-[var(--color-primary)]">
                    privacy@tudominio.com
                  </a>
                </li>
              </ul>
            </div>

            {/* Otros derechos GDPR */}
            <div>
              <h3 className="font-semibold mb-3">Otros derechos GDPR</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="border border-[var(--color-border)] rounded-lg p-4">
                  <h4 className="font-medium mb-2">Rectificación (Art. 16)</h4>
                  <p className="text-sm text-[var(--color-foreground)]/70">
                    Contacta a{' '}
                    <a href="mailto:privacy@tudominio.com" className="text-[var(--color-primary)]">
                      privacy@tudominio.com
                    </a>{' '}
                    para corregir datos incorrectos
                  </p>
                </div>

                <div className="border border-[var(--color-border)] rounded-lg p-4">
                  <h4 className="font-medium mb-2">Portabilidad (Art. 20)</h4>
                  <p className="text-sm text-[var(--color-foreground)]/70">
                    Usa la exportación de datos para recibir tu información en formato JSON
                  </p>
                </div>

                <div className="border border-[var(--color-border)] rounded-lg p-4">
                  <h4 className="font-medium mb-2">Oposición (Art. 21)</h4>
                  <p className="text-sm text-[var(--color-foreground)]/70">
                    Usa el enlace de unsubscribe en cualquier email o elimina tus datos
                  </p>
                </div>

                <div className="border border-[var(--color-border)] rounded-lg p-4">
                  <h4 className="font-medium mb-2">Limitación (Art. 18)</h4>
                  <p className="text-sm text-[var(--color-foreground)]/70">
                    Contacta a{' '}
                    <a href="mailto:privacy@tudominio.com" className="text-[var(--color-primary)]">
                      privacy@tudominio.com
                    </a>{' '}
                    para solicitar restricción
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </Container>
  );
}
