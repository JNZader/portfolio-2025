import { Heart } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import Container from '@/components/ui/Container';
import { Link } from '@/i18n/navigation';
import { MAIN_NAVIGATION } from '@/lib/constants/navigation';

export default async function Footer() {
  const currentYear = new Date().getFullYear();
  const t = await getTranslations('Footer');
  const tNav = await getTranslations('Nav');

  return (
    <footer
      id="footer"
      className="relative border-t bg-background/95 backdrop-blur-sm overflow-hidden print:hidden"
    >
      {/* Decorative gradient background */}
      <div className="absolute inset-0 -z-10 opacity-40 dark:opacity-20">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-tertiary/5 rounded-full blur-3xl" />
      </div>

      <Container>
        {/* Main Footer Content */}
        <div className="py-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand & Contact Column */}
            <div className="space-y-4">
              <Link href="/" className="text-xl font-bold text-primary">
                JZ
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">{t('brand')}</p>
              <div className="flex gap-4">
                <a
                  href="https://github.com/JNZader"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110 hover:-translate-y-1 rounded-md p-1 -m-1 hover:ring-2 hover:ring-primary/20 focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={t('githubAria')}
                >
                  <FaGithub className="h-5 w-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/jnzader/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110 hover:-translate-y-1 rounded-md p-1 -m-1 hover:ring-2 hover:ring-primary/20 focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={t('linkedinAria')}
                >
                  <FaLinkedin className="h-5 w-5" />
                </a>
              </div>
              <Link
                href="/contacto"
                className="text-sm text-primary hover:text-primary-700 dark:hover:text-primary-600 transition-colors inline-block underline underline-offset-2 decoration-primary/40 hover:decoration-primary-700"
              >
                {t('contactLink')}
              </Link>
            </div>

            {/* Navigation Column */}
            <nav className="space-y-4 md:text-center" aria-label={t('navAria')}>
              <p className="font-semibold">{t('navHeading')}</p>
              <ul className="space-y-2">
                {MAIN_NAVIGATION.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2 decoration-muted-foreground/40 hover:decoration-foreground"
                    >
                      {tNav(item.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Services Column */}
            <div className="space-y-4 md:text-right">
              <p className="font-semibold">{t('servicesHeading')}</p>
              <ul className="space-y-2">
                <li>
                  <span className="text-sm text-muted-foreground">{t('serviceBackend')}</span>
                </li>
                <li>
                  <span className="text-sm text-muted-foreground">{t('serviceApis')}</span>
                </li>
                <li>
                  <span className="text-sm text-muted-foreground">{t('serviceFullstack')}</span>
                </li>
                <li>
                  <span className="text-sm text-muted-foreground">{t('serviceConsulting')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>
                © {currentYear} Javier Zader. {t('madeWith')}
              </span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>{t('andMate')}</span>
            </div>

            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2 decoration-muted-foreground/40 hover:decoration-foreground"
              >
                {t('privacy')}
              </Link>
              <Link
                href="/data-request"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2 decoration-muted-foreground/40 hover:decoration-foreground"
              >
                {t('gdpr')}
              </Link>
              <span className="text-xs text-muted-foreground">{t('builtWith')}</span>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
