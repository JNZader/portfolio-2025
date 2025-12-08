import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
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
import { VercelAnalyticsProvider } from '@/lib/analytics/vercel';
import { ThemeProvider } from '@/lib/design/theme-provider';
import { ResourceHints } from '@/lib/performance/resource-hints';
import './globals.css';

// Variable font with subsetting
// Using 'optional' display to eliminate render delay on slow connections
// The font will only be used if it loads within ~100ms, otherwise fallback is used
const inter = Inter({
  subsets: ['latin'],
  display: 'optional',
  variable: '--font-inter',
  preload: true,
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Oxygen',
    'Ubuntu',
    'sans-serif',
  ],
  adjustFontFallback: true,
});

// Monospace for code blocks - optional display for consistency
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'optional',
  variable: '--font-mono',
  preload: true,
  fallback: ['Consolas', 'Monaco', 'Courier New', 'monospace'],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://javierzader.com'),
  title: {
    default: 'Javier Zader - Portfolio',
    template: '%s | Javier Zader',
  },
  description:
    'Backend Java Developer especializado en Spring Boot, React y arquitecturas modernas. Más de 20 años de experiencia en tecnología.',
  keywords: [
    'portfolio',
    'desarrollo web',
    'next.js',
    'react',
    'typescript',
    'java',
    'spring boot',
    'backend developer',
  ],
  authors: [{ name: 'Javier Zader' }],
  creator: 'Javier Zader',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://javierzader.com',
    title: 'Javier Zader - Backend Java Developer',
    description:
      'Backend Java Developer especializado en Spring Boot, React y arquitecturas modernas. Más de 20 años de experiencia en tecnología.',
    siteName: 'Javier Zader Portfolio',
  },
  alternates: {
    types: {
      'application/rss+xml': [
        {
          url: '/feed.xml',
          title: 'RSS Feed - Javier Zader Blog',
        },
      ],
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <ResourceHints />
      <body className="font-sans antialiased">
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
      </body>
    </html>
  );
}
