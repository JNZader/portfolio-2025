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
