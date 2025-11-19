import { Heart } from 'lucide-react';
import Link from 'next/link';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import Container from '@/components/ui/Container';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const navigation = [
    { name: 'Inicio', href: '/' },
    { name: 'Sobre mí', href: '/sobre-mi' },
    { name: 'Proyectos', href: '/proyectos' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contacto', href: '/contacto' },
  ];

  return (
    <footer id="footer" className="border-t bg-background/95 backdrop-blur-sm">
      <Container>
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand & Contact Column */}
            <div className="space-y-4">
              <Link href="/" className="text-xl font-bold text-primary">
                JZ
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Backend Java Developer especializado en crear soluciones robustas, escalables y
                mantenibles con Spring Boot y tecnologías modernas.
              </p>
              <div className="flex gap-4">
                <Link
                  href="https://github.com/JNZader"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="GitHub"
                >
                  <FaGithub className="h-5 w-5" />
                </Link>
                <Link
                  href="https://www.linkedin.com/in/jnzader/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin className="h-5 w-5" />
                </Link>
              </div>
              <Link
                href="/contacto"
                className="text-sm text-primary hover:text-primary/80 transition-colors inline-block"
              >
                Contactar →
              </Link>
            </div>

            {/* Navigation Column */}
            <nav className="space-y-4 md:text-center" aria-label="Enlaces del pie de página">
              <p className="font-semibold">Navegación</p>
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Services Column */}
            <div className="space-y-4 md:text-right">
              <p className="font-semibold">Servicios</p>
              <ul className="space-y-2">
                <li>
                  <span className="text-sm text-muted-foreground">Desarrollo Backend</span>
                </li>
                <li>
                  <span className="text-sm text-muted-foreground">APIs REST</span>
                </li>
                <li>
                  <span className="text-sm text-muted-foreground">Aplicaciones Full Stack</span>
                </li>
                <li>
                  <span className="text-sm text-muted-foreground">Consultoría Técnica</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>© {currentYear} Javier Zader. Hecho con</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>y mucho cafe</span>
            </div>

            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacidad
              </Link>
              <Link
                href="/data-request"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Datos GDPR
              </Link>
              <span className="text-xs text-muted-foreground">Construido con Next.js</span>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
