import type { Metadata } from 'next';
import Container from '@/components/ui/Container';
import { ObfuscatedEmail } from '@/components/ui/ObfuscatedEmail';
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
            Última actualización: <time dateTime="2025-01-01">Enero de 2025</time>
          </p>

          <hr />

          <h2>1. Introducción</h2>
          <p>
            Esta política de privacidad explica cómo Javier Norberto Zader ("yo", "mi", "este
            sitio") recopila, usa y protege tu información personal cuando usas este sitio web.
          </p>
          <p>
            Me comprometo a proteger tu privacidad y cumplir con la Ley 25.326 de Protección de
            Datos Personales de Argentina, así como con el Reglamento General de Protección de Datos
            (GDPR) de la Unión Europea para visitantes de la UE.
          </p>

          <h2>2. Información que Recopilo</h2>

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

          <h2>3. Cómo Uso tu Información</h2>
          <p>Uso tu información personal para:</p>
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

          <h2>4. Base Legal para el Procesamiento</h2>
          <p>Proceso tu información bajo las siguientes bases legales:</p>

          <h3>4.1 Ley Argentina 25.326</h3>
          <ul>
            <li>
              <strong>Consentimiento (Art. 5):</strong> Para newsletter y cookies no esenciales
            </li>
            <li>
              <strong>Interés legítimo:</strong> Para analytics y mejoras del sitio
            </li>
          </ul>

          <h3>4.2 GDPR (para visitantes de la UE)</h3>
          <ul>
            <li>
              <strong>Consentimiento (Art. 6.1.a):</strong> Para newsletter y cookies no esenciales
            </li>
            <li>
              <strong>Interés legítimo (Art. 6.1.f):</strong> Para analytics y mejoras del sitio
            </li>
          </ul>

          <h2>5. Compartir Información</h2>
          <p>
            <strong>NO vendo ni alquilo tu información personal.</strong>
          </p>
          <p>Comparto información solo con:</p>
          <ul>
            <li>
              <strong>Proveedores de servicios:</strong> Resend (emails), Upstash (rate limiting),
              Vercel (hosting)
            </li>
            <li>
              <strong>Obligaciones legales:</strong> Si lo requiere la ley o una orden judicial
            </li>
          </ul>

          <h2>6. Cookies</h2>
          <p>Uso los siguientes tipos de cookies:</p>

          <h3>6.1 Cookies Esenciales (Requeridas)</h3>
          <ul>
            <li>
              <strong>cookie-consent:</strong> Almacena tus preferencias de cookies (365 días)
            </li>
          </ul>

          <h3>6.2 Cookies de Analytics (Opcionales)</h3>
          <ul>
            <li>Actualmente no uso cookies de analytics de terceros</li>
          </ul>

          <h3>6.3 Cookies de Marketing (Opcionales)</h3>
          <ul>
            <li>Actualmente no uso cookies de marketing de terceros</li>
          </ul>

          <p>
            Puedes gestionar tus preferencias de cookies en cualquier momento mediante el banner que
            aparece en la parte inferior de la página.
          </p>

          <h2>7. Tus Derechos</h2>

          <div className="bg-[var(--color-primary)]/10 border border-[var(--color-primary)] rounded-lg p-6 my-6">
            <h3 className="mt-0">Derechos del Usuario (Ley 25.326 y GDPR)</h3>
            <ul className="mb-0">
              <li>
                <strong>Derecho de Acceso:</strong> Solicitar una copia de tus datos
              </li>
              <li>
                <strong>Derecho de Rectificación:</strong> Corregir datos incorrectos
              </li>
              <li>
                <strong>Derecho de Supresión:</strong> Solicitar eliminación de tus datos
              </li>
              <li>
                <strong>Derecho a la Portabilidad:</strong> Recibir tus datos en formato JSON
              </li>
              <li>
                <strong>Derecho de Oposición:</strong> Oponerte al procesamiento de tus datos
              </li>
              <li>
                <strong>Derecho a Retirar Consentimiento:</strong> En cualquier momento sin afectar
                la legalidad del procesamiento previo
              </li>
            </ul>
          </div>

          <div className="mb-4">
            Para ejercer estos derechos, visita la{' '}
            <a href="/data-request">página de solicitud de datos</a> o contacta a{' '}
            <ObfuscatedEmail
              user="jnzader"
              domain="gmail.com"
              className="text-[var(--color-primary)] hover:underline"
            />
          </div>

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
              <strong>Registros de consentimiento:</strong> 3 años (para cumplir con requisitos de
              auditoría)
            </li>
          </ul>

          <h2>9. Seguridad</h2>
          <p>Implemento las siguientes medidas de seguridad:</p>
          <ul>
            <li>
              <strong>Encriptación:</strong> Todas las comunicaciones usan HTTPS/TLS
            </li>
            <li>
              <strong>Tokens seguros:</strong> Generados con nanoid (32 caracteres)
            </li>
            <li>
              <strong>Rate limiting:</strong> Protección contra abuso (límites por IP y email)
            </li>
            <li>
              <strong>Verificación por email:</strong> Para operaciones sensibles como exportación y
              eliminación de datos
            </li>
            <li>
              <strong>Sanitización:</strong> Todos los inputs se sanitizan contra XSS
            </li>
          </ul>

          <h2>10. Transferencias Internacionales</h2>
          <p>
            Tus datos pueden ser procesados en servidores fuera de Argentina. Los proveedores
            utilizados cumplen con estándares de protección de datos:
          </p>
          <ul>
            <li>
              <strong>Vercel:</strong> Hosting con opción de región cercana
            </li>
            <li>
              <strong>Resend:</strong> Servicio de emails con cumplimiento GDPR
            </li>
            <li>
              <strong>Upstash:</strong> Redis serverless para rate limiting
            </li>
          </ul>
          <p>
            Argentina tiene estatus de "adecuación" reconocido por la Unión Europea, lo que permite
            transferencias de datos desde la UE.
          </p>

          <h2>11. Menores de Edad</h2>
          <p>
            Este sitio no está dirigido a menores de 13 años. No recopilo intencionalmente
            información de menores. Si descubro que he recopilado datos de un menor, los eliminaré
            inmediatamente.
          </p>

          <h2>12. Cambios en esta Política</h2>
          <p>
            Puedo actualizar esta política ocasionalmente. Te notificaré de cambios importantes por
            email (si estás suscrito) o mediante un aviso en el sitio. La versión actual siempre
            estará disponible en esta página con la fecha de última actualización.
          </p>

          <h2>13. Contacto</h2>
          <p>
            Para cualquier pregunta sobre esta política o para ejercer tus derechos de protección de
            datos, contacta a:
          </p>
          <div className="bg-[var(--color-muted)] rounded-lg p-4 my-4">
            <p className="mb-2">
              <strong>Responsable del Tratamiento:</strong>
            </p>
            <p className="mb-1">Javier Norberto Zader</p>
            <p className="mb-1">
              Email:{' '}
              <ObfuscatedEmail
                user="jnzader"
                domain="gmail.com"
                className="text-[var(--color-primary)] hover:underline"
              />
            </p>
            <p className="mb-1">Ubicación: Córdoba, Argentina</p>
            <p className="mb-0">Tiempo de respuesta: 10 días hábiles (según Ley 25.326 Art. 14)</p>
          </div>

          <h2>14. Autoridad de Supervisión</h2>
          <p>
            Tienes derecho a presentar una queja ante la autoridad de protección de datos
            correspondiente:
          </p>
          <ul>
            <li>
              <strong>Argentina:</strong>{' '}
              <a href="https://www.argentina.gob.ar/aaip" target="_blank" rel="noopener noreferrer">
                Agencia de Acceso a la Información Pública (AAIP)
              </a>
            </li>
            <li>
              <strong>Unión Europea:</strong> Encuentra tu autoridad local en{' '}
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
            <strong>Versión:</strong> 1.0 | <strong>Fecha efectiva:</strong> Enero de 2025
          </p>
        </article>
      </Section>
    </Container>
  );
}
