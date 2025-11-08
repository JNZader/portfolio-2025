import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import SkipLink from '@/components/ui/SkipLink';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Tu Nombre - Portfolio',
    template: '%s | Tu Nombre',
  },
  description: 'Portfolio profesional de desarrollo web con Next.js 16 y React 19',
  keywords: ['portfolio', 'desarrollo web', 'next.js', 'react', 'typescript'],
  authors: [{ name: 'Tu Nombre' }],
  creator: 'Tu Nombre',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://tudominio.com',
    title: 'Tu Nombre - Portfolio',
    description: 'Portfolio profesional de desarrollo web',
    siteName: 'Tu Nombre Portfolio',
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
