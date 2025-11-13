import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import SkipLink from '@/components/ui/SkipLink';
import { ThemeProvider } from '@/lib/design/theme-provider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <SkipLink />
            <Header />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
