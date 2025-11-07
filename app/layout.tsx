import type { Metadata } from 'next';
import './globals.css';
import type React from 'react';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Portfolio',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased"> {children} </body>
    </html>
  );
}
