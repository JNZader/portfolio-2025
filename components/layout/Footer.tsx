import Link from 'next/link';
import { NewsletterInline } from '@/components/newsletter/NewsletterInline';

export default function Footer() {
  return (
    <footer className="border-t bg-[var(--color-muted)]">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-semibold mb-4">Newsletter</h3>
            <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
              Suscríbete para recibir contenido exclusivo
            </p>
            <NewsletterInline />
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-2">
            <div>
              <h3 className="text-sm font-semibold mb-4">Navegación</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="hover:text-[var(--color-primary)]">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link href="/sobre-mi" className="hover:text-[var(--color-primary)]">
                    Sobre mí
                  </Link>
                </li>
                <li>
                  <Link href="/proyectos" className="hover:text-[var(--color-primary)]">
                    Proyectos
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-[var(--color-primary)]">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="hover:text-[var(--color-primary)]">
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="/data-request" className="hover:text-[var(--color-primary)]">
                    Mis Datos (GDPR)
                  </Link>
                </li>
                <li>
                  <Link href="/contacto" className="hover:text-[var(--color-primary)]">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-[var(--color-muted-foreground)]">
          <p>© {new Date().getFullYear()} Portfolio. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
