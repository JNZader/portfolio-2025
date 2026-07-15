import { Heart } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import Container from '@/components/ui/Container';
import { ExternalLink } from '@/components/ui/ExternalLink';
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
          <div data-footer-grid="primary" className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand & Contact Column */}
            <div data-footer-column="brand" className="min-w-0 space-y-4">
              <Link
                href="/"
                className="inline-flex min-h-11 min-w-11 items-center text-xl font-bold text-primary"
              >
                JZ
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">{t('brand')}</p>
              <div className="flex gap-2">
                <ExternalLink
                  href="https://github.com/JNZader"
                  trackLabel="GitHub"
                  className="inline-flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  aria-label={t('githubAria')}
                >
                  <FaGithub className="h-5 w-5" />
                </ExternalLink>
                <ExternalLink
                  href="https://www.linkedin.com/in/jnzader/"
                  trackLabel="LinkedIn"
                  className="inline-flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  aria-label={t('linkedinAria')}
                >
                  <FaLinkedin className="h-5 w-5" />
                </ExternalLink>
              </div>
              <Link
                href="/contacto"
                className="inline-flex min-h-11 min-w-11 items-center text-sm text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:text-primary-700 hover:decoration-primary-700 dark:hover:text-primary-600"
              >
                {t('contactLink')}
              </Link>
            </div>

            {/* Navigation Column */}
            <nav
              data-footer-column="navigation"
              className="min-w-0 space-y-4"
              aria-label={t('navAria')}
            >
              <p className="font-semibold">{t('navHeading')}</p>
              <ul>
                {MAIN_NAVIGATION.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className="inline-flex min-h-11 min-w-11 items-center text-sm text-muted-foreground underline decoration-muted-foreground/40 underline-offset-2 transition-colors hover:text-foreground hover:decoration-foreground"
                    >
                      {tNav(item.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Services Column */}
            <div data-footer-column="services" className="min-w-0 space-y-4">
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
          <div data-footer-bottom-bar className="flex flex-col sm:flex-row items-start gap-4">
            <div
              data-footer-bottom-group="copyright"
              className="flex items-center gap-1 text-sm text-muted-foreground"
            >
              <span>
                © {currentYear} Javier Zader. {t('madeWith')}
              </span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>{t('andMate')}</span>
            </div>

            <div
              data-footer-bottom-group="legal"
              className="flex flex-wrap items-center justify-start gap-x-4"
            >
              <Link
                href="/privacy"
                className="inline-flex min-h-11 min-w-11 items-center text-sm text-muted-foreground underline decoration-muted-foreground/40 underline-offset-2 transition-colors hover:text-foreground hover:decoration-foreground"
              >
                {t('privacy')}
              </Link>
              <Link
                href="/data-request"
                className="inline-flex min-h-11 min-w-11 items-center text-sm text-muted-foreground underline decoration-muted-foreground/40 underline-offset-2 transition-colors hover:text-foreground hover:decoration-foreground"
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
