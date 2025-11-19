import type { Metadata } from 'next';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad y tratamiento de datos personales',
};

export default function PrivacyPage() {
  return (
    <Container className="py-12">
      <Section>
        <article className="prose prose-lg dark:prose-invert max-w-none">
          <h1>Política de Privacidad</h1>
          <p className="lead">
            Última actualización: <time>5 de octubre de 2025</time>
          </p>

          <hr />

          <h2>1. Introducción</h2>
          <p>
            Esta política de privacidad explica cómo [TU NOMBRE/EMPRESA] ("nosotros", "nuestro")
            recopila, usa y protege tu información personal cuando usas nuestro sitio web.
          </p>
          <p>
            Nos comprometemos a proteger tu privacidad y cumplir con el Reglamento General de
            Protección de Datos (GDPR) de la Unión Europea y otras leyes aplicables.
          </p>

          <h2>2. Información que Recopilamos</h2>

          <h3>2.1 Información que Proporcionas Directamente</h3>
          <ul>
            <li>
              <strong>Newsletter:</strong> Email, fecha de suscripción, preferencias de
              consentimiento
            </li>
            <li>
              <strong>Formulario de Contacto:</strong> Nombre, email, mensaje
            </li>
          </ul>

          <h3>2.2 Información Recopilada Automáticamente</h3>
          <ul>
            <li>
              <strong>Cookies:</strong> Preferencias de cookies, sesión
            </li>
            <li>
              <strong>Metadata:</strong> Dirección IP, User-Agent, navegador, dispositivo
            </li>
            <li>
              <strong>Analytics:</strong> Páginas visitadas, tiempo de permanencia (solo si
              autorizas cookies de analytics)
            </li>
          </ul>

          <h2>3. Cómo Usamos tu Información</h2>
          <p>Usamos tu información personal para:</p>
          <ul>
            <li>
              <strong>Newsletter:</strong> Enviarte emails con contenido y actualizaciones (solo con
              tu consentimiento explícito)
            </li>
            <li>
              <strong>Responder consultas:</strong> Procesar y responder tus mensajes de contacto
            </li>
            <li>
              <strong>Mejorar el sitio:</strong> Analizar el uso del sitio para mejorar la
              experiencia (si autorizas cookies de analytics)
            </li>
            <li>
              <strong>Cumplimiento legal:</strong> Cumplir con obligaciones legales y resolver
              disputas
            </li>
          </ul>

          <h2>4. Base Legal para el Procesamiento (GDPR)</h2>
          <p>Procesamos tu información bajo las siguientes bases legales:</p>
          <ul>
            <li>
              <strong>Consentimiento (Art. 6.1.a GDPR):</strong> Para newsletter y cookies no
              esenciales
            </li>
            <li>
              <strong>Interés legítimo (Art. 6.1.f GDPR):</strong> Para analytics y mejoras del
              sitio
            </li>
            <li>
              <strong>Obligación legal (Art. 6.1.c GDPR):</strong> Para cumplir con leyes aplicables
            </li>
          </ul>

          <h2>5. Compartir Información</h2>
          <p>
            <strong>NO vendemos ni alquilamos tu información personal.</strong>
          </p>
          <p>Compartimos información solo con:</p>
          <ul>
            <li>
              <strong>Proveedores de servicios:</strong> Resend (emails), Supabase (base de datos),
              Vercel (hosting) - todos certificados GDPR
            </li>
            <li>
              <strong>Obligaciones legales:</strong> Si lo requiere la ley o una orden judicial
            </li>
          </ul>

          <h2>6. Cookies</h2>
          <p>Usamos los siguientes tipos de cookies:</p>

          <h3>6.1 Cookies Esenciales (Requeridas)</h3>
          <ul>
            <li>
              <strong>cookie-consent:</strong> Almacena tus preferencias de cookies (365 días)
            </li>
            <li>
              <strong>session:</strong> Mantiene tu sesión activa (hasta que cierres el navegador)
            </li>
          </ul>

          <h3>6.2 Cookies de Analytics (Opcionales)</h3>
          <ul>
            <li>
              <strong>_ga, _ga_*:</strong> Google Analytics para análisis de tráfico (si las
              autorizas)
            </li>
          </ul>

          <h3>6.3 Cookies de Marketing (Opcionales)</h3>
          <ul>
            <li>Actualmente no usamos cookies de marketing de terceros</li>
          </ul>

          <p>
            Puedes gestionar tus preferencias de cookies en cualquier momento en la parte inferior
            de la página.
          </p>

          <h2>7. Tus Derechos (GDPR)</h2>
          <p>Bajo el GDPR, tienes los siguientes derechos:</p>

          <div className="bg-[var(--color-primary)]/10 border border-[var(--color-primary)] rounded-lg p-6 my-6">
            <h3 className="mt-0">Derechos del Usuario</h3>
            <ul className="mb-0">
              <li>
                <strong>Derecho de Acceso (Art. 15):</strong> Solicitar una copia de tus datos
              </li>
              <li>
                <strong>Derecho de Rectificación (Art. 16):</strong> Corregir datos incorrectos
              </li>
              <li>
                <strong>Derecho al Olvido (Art. 17):</strong> Solicitar eliminación de tus datos
              </li>
              <li>
                <strong>Derecho a la Portabilidad (Art. 20):</strong> Recibir tus datos en formato
                JSON
              </li>
              <li>
                <strong>Derecho de Oposición (Art. 21):</strong> Oponerte al procesamiento de tus
                datos
              </li>
              <li>
                <strong>Derecho a Retirar Consentimiento:</strong> En cualquier momento sin afectar
                la legalidad del procesamiento previo
              </li>
            </ul>
          </div>

          <p>
            Para ejercer estos derechos, visita nuestra{' '}
            <a href="/data-request">página de solicitud de datos</a> o contacta a{' '}
            <a href="mailto:privacy@tudominio.com">privacy@tudominio.com</a>
          </p>

          <h2>8. Retención de Datos</h2>
          <ul>
            <li>
              <strong>Newsletter:</strong> Hasta que canceles la suscripción + 30 días (para
              procesar la baja)
            </li>
            <li>
              <strong>Formulario de contacto:</strong> 24 meses desde el último mensaje
            </li>
            <li>
              <strong>Consent logs:</strong> 3 años (para cumplir con requisitos de auditoría GDPR)
            </li>
          </ul>

          <h2>9. Seguridad</h2>
          <p>Implementamos las siguientes medidas de seguridad:</p>
          <ul>
            <li>
              <strong>Encriptación:</strong> Todas las comunicaciones usan HTTPS/TLS
            </li>
            <li>
              <strong>Tokens seguros:</strong> Generados con nanoid (32 caracteres)
            </li>
            <li>
              <strong>Rate limiting:</strong> Protección contra abuso (3-5 requests/hora)
            </li>
            <li>
              <strong>Sanitización:</strong> Todos los inputs se sanitizan contra XSS
            </li>
            <li>
              <strong>Database:</strong> Base de datos en servidor seguro con backups diarios
            </li>
          </ul>

          <h2>10. Transferencias Internacionales</h2>
          <p>
            Tus datos pueden ser procesados en servidores fuera de la UE. Nuestros proveedores están
            certificados bajo:
          </p>
          <ul>
            <li>
              <strong>Supabase:</strong> Infraestructura en AWS (Frankfurt, UE)
            </li>
            <li>
              <strong>Resend:</strong> Certificado GDPR, servidores en UE disponibles
            </li>
            <li>
              <strong>Vercel:</strong> Puedes elegir región UE para deployment
            </li>
          </ul>

          <h2>11. Menores de Edad</h2>
          <p>
            Nuestro sitio no está dirigido a menores de 16 años. No recopilamos intencionalmente
            información de menores. Si descubrimos que hemos recopilado datos de un menor, los
            eliminaremos inmediatamente.
          </p>

          <h2>12. Cambios en esta Política</h2>
          <p>
            Podemos actualizar esta política ocasionalmente. Te notificaremos de cambios importantes
            por email (si estás suscrito) o mediante un aviso en el sitio. La versión actual siempre
            estará disponible en esta página con la fecha de última actualización.
          </p>

          <h2>13. Contacto</h2>
          <p>
            Para cualquier pregunta sobre esta política o para ejercer tus derechos GDPR, contacta
            a:
          </p>
          <div className="bg-[var(--color-muted)] rounded-lg p-4 my-4">
            <p className="mb-2">
              <strong>Responsable de Protección de Datos:</strong>
            </p>
            <p className="mb-1">Email: privacy@tudominio.com</p>
            <p className="mb-1">Dirección: [TU DIRECCIÓN]</p>
            <p className="mb-0">Tiempo de respuesta: 30 días (según GDPR Art. 12.3)</p>
          </div>

          <h2>14. Autoridad de Supervisión</h2>
          <p>
            Tienes derecho a presentar una queja ante tu autoridad de protección de datos local:
          </p>
          <ul>
            <li>
              <strong>España:</strong>{' '}
              <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">
                Agencia Española de Protección de Datos (AEPD)
              </a>
            </li>
            <li>
              <strong>UE:</strong> Encuentra tu autoridad local en{' '}
              <a
                href="https://edpb.europa.eu/about-edpb/board/members_en"
                target="_blank"
                rel="noopener noreferrer"
              >
                EDPB
              </a>
            </li>
          </ul>

          <hr />

          <p className="text-sm text-[var(--color-foreground)]/60">
            <strong>Versión:</strong> 1.0 | <strong>Fecha efectiva:</strong> 5 de octubre de 2025
          </p>
        </article>
      </Section>
    </Container>
  );
}
