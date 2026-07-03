import type { Metadata } from 'next';
import { DataDeletionForm } from '@/components/gdpr/DataDeletionForm';
import { DataRequestForm } from '@/components/gdpr/DataRequestForm';
import Container from '@/components/ui/Container';
import { ObfuscatedEmail } from '@/components/ui/ObfuscatedEmail';
import Section from '@/components/ui/Section';

export const metadata: Metadata = {
  title: 'Solicitud de Datos',
  description: 'Ejercer tus derechos de protección de datos (Ley 25.326 y GDPR)',
};

export default function DataRequestPage() {
  return (
    <Container className="py-12">
      <Section>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Solicitud de Datos</h1>
          <p className="text-lg text-[var(--color-foreground)]/70 mb-12">
            Ejerce tus derechos de protección de datos personales (Ley 25.326 y GDPR)
          </p>

          <div className="space-y-12">
            {/* Exportar Datos */}
            <div className="border border-[var(--color-border)] rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-2">📥 Exportar mis datos</h2>
              <p className="text-[var(--color-foreground)]/70 mb-6">
                Solicita una copia de toda la información que tenemos sobre ti en formato JSON.
                Recibirás un email de verificación con el enlace de descarga.
              </p>
              <DataRequestForm />
            </div>

            {/* Eliminar Datos */}
            <div className="border border-destructive/30 rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-2 text-destructive">🗑️ Eliminar mis datos</h2>
              <p className="text-[var(--color-foreground)]/70 mb-6">
                Solicita la eliminación permanente de todos tus datos personales. Recibirás un email
                de verificación para confirmar. Esta acción es<strong> irreversible</strong>.
              </p>
              <DataDeletionForm />
            </div>

            {/* Información adicional */}
            <div className="bg-[var(--color-muted)] rounded-lg p-6">
              <h3 className="font-semibold mb-3">ℹ️ Información importante</h3>
              <ul className="space-y-2 text-sm text-[var(--color-foreground)]/70">
                <li>
                  • <strong>Verificación por email:</strong> Recibirás un enlace de confirmación
                  válido por 15 minutos
                </li>
                <li>
                  • <strong>Tiempo de respuesta:</strong> 10 días hábiles (Ley 25.326 Art. 14)
                </li>
                <li>
                  • <strong>Rate limiting:</strong> Máximo 5 solicitudes/hora por IP
                </li>
                <li>
                  • <strong>Formato:</strong> Los datos se exportan en formato JSON legible
                </li>
                <li>
                  • <strong>Contacto:</strong> Para consultas:{' '}
                  <ObfuscatedEmail
                    user="jnzader"
                    domain="gmail.com"
                    className="text-[var(--color-primary)]"
                  />
                </li>
              </ul>
            </div>

            {/* Otros derechos */}
            <div>
              <h3 className="font-semibold mb-3">Otros derechos de protección de datos</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="border border-[var(--color-border)] rounded-lg p-4">
                  <h4 className="font-medium mb-2">Rectificación</h4>
                  <p className="text-sm text-[var(--color-foreground)]/70">
                    Contacta a{' '}
                    <ObfuscatedEmail
                      user="jnzader"
                      domain="gmail.com"
                      className="text-[var(--color-primary)]"
                    />{' '}
                    para corregir datos incorrectos
                  </p>
                </div>

                <div className="border border-[var(--color-border)] rounded-lg p-4">
                  <h4 className="font-medium mb-2">Portabilidad</h4>
                  <p className="text-sm text-[var(--color-foreground)]/70">
                    Usa la exportación de datos para recibir tu información en formato JSON
                  </p>
                </div>

                <div className="border border-[var(--color-border)] rounded-lg p-4">
                  <h4 className="font-medium mb-2">Oposición</h4>
                  <p className="text-sm text-[var(--color-foreground)]/70">
                    Usa el enlace de unsubscribe en cualquier email o elimina tus datos
                  </p>
                </div>

                <div className="border border-[var(--color-border)] rounded-lg p-4">
                  <h4 className="font-medium mb-2">Limitación</h4>
                  <p className="text-sm text-[var(--color-foreground)]/70">
                    Contacta a{' '}
                    <ObfuscatedEmail
                      user="jnzader"
                      domain="gmail.com"
                      className="text-[var(--color-primary)]"
                    />{' '}
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
