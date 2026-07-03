import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { type ReactNode, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { AnnouncerProvider } from '@/components/a11y/ScreenReaderAnnouncer';
import { SkipLinks } from '@/components/a11y/SkipLinks';
import { ThirdPartyScripts } from '@/components/analytics/ThirdPartyScripts';
import { WebVitals } from '@/components/analytics/WebVitals';
import { CookieConsent } from '@/components/gdpr/CookieConsent';
import { ClientComponents } from '@/components/layout/ClientComponents';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { BackToTop } from '@/components/ui/BackToTop';
import { RippleListener } from '@/components/ui/RippleListener';
import { routing } from '@/i18n/routing';
import { VercelAnalyticsProvider } from '@/lib/analytics/vercel';
import { ThemeProvider } from '@/lib/design/theme-provider';
import { fontVariables } from '@/lib/fonts';
import { ResourceHints } from '@/lib/performance/resource-hints';

// OG locale differs from the html lang tag; map the app locales to OG values.
const OG_LOCALE: Record<string, string> = { es: 'es_AR', en: 'en_US' };

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: Pick<LocaleLayoutProps, 'params'>): Promise<Metadata> {
  const { locale } = await params;
  return {
    openGraph: { locale: OG_LOCALE[locale] ?? 'es_AR' },
  };
}

export default async function LocaleLayout({ children, params }: Readonly<LocaleLayoutProps>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering for this locale.
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={fontVariables}
    >
      <ResourceHints />
      <body className="font-sans antialiased">
        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AnnouncerProvider>
              {/* Client-only components (lazy loaded) */}
              <Suspense fallback={null}>
                <ClientComponents />
              </Suspense>

              <div className="relative flex min-h-screen flex-col">
                <SkipLinks />
                <Header />
                <main id="main-content" className="flex-1" tabIndex={-1}>
                  {children}
                </main>
                <Footer />
              </div>

              {/* Non-critical components - lazy loaded */}
              <Suspense fallback={null}>
                <Toaster
                  position="bottom-center"
                  toastOptions={{
                    duration: 5000,
                    style: {
                      background: 'var(--color-background)',
                      color: 'var(--color-foreground)',
                      border: '1px solid var(--color-border)',
                    },
                    success: {
                      iconTheme: {
                        primary: 'var(--color-primary)',
                        secondary: 'var(--color-background)',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: 'var(--color-background)',
                      },
                    },
                  }}
                />
              </Suspense>
              <Suspense fallback={null}>
                <CookieConsent />
              </Suspense>
              <Suspense fallback={null}>
                <BackToTop />
              </Suspense>
              <RippleListener />
              <Suspense fallback={null}>
                <WebVitals />
              </Suspense>
              <Suspense fallback={null}>
                <ThirdPartyScripts />
              </Suspense>
              <Suspense fallback={null}>
                <VercelAnalyticsProvider />
              </Suspense>
            </AnnouncerProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
