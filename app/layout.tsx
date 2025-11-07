import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import SkipLink from '@/components/ui/SkipLink';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Javier Zader - Portfolio',
    template: '%s | Javier Zader',
  },
  description: 'Portfolio profesional de desarrollo hecho con Next.js 16 y React 19',
  keywords: ['portfolio', 'desarrollo web', 'next.js', 'react', 'typescript'],
  authors: [{ name: 'Javier Zader' }],
  creator: 'Javier Zader',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://tudominio.com',
    title: 'Javier Zader - Portfolio',
    description: 'Portfolio profesional de desarrollo',
    siteName: 'Javier Zader Portfolio',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="antialiased flex min-h-screen flex-col">
        <SkipLink />
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
