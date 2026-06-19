import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
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
import { VercelAnalyticsProvider } from '@/lib/analytics/vercel';
import { SITE_URL } from '@/lib/config/site-config';
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

// Display grotesk for headings — 'swap' so the distinctive face actually
// renders (the whole point of a display font); adjustFontFallback keeps CLS low.
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['500', '700'],
  preload: true,
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Javier Zader — Backend Developer · Sistemas end-to-end',
    template: '%s | Javier Zader',
  },
  description:
    'Backend Developer: sistemas end-to-end en Java, Go y Rust, plataformas industriales con ML en el edge y herramientas de desarrollo con IA. 20+ años en tecnología.',
  keywords: [
    'backend developer',
    'java',
    'spring boot',
    'go',
    'rust',
    'machine learning',
    'edge ml',
    'ai tooling',
    'code generation',
    'sistemas end-to-end',
  ],
  authors: [{ name: 'Javier Zader' }],
  creator: 'Javier Zader',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: SITE_URL,
    title: 'Javier Zader — Backend Developer · Sistemas end-to-end',
    description:
      'Backend Developer: sistemas end-to-end en Java, Go y Rust, plataformas industriales con ML en el edge y herramientas de desarrollo con IA. 20+ años en tecnología.',
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
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
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
      </body>
    </html>
  );
}
