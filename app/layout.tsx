import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SITE_URL } from '@/lib/config/site-config';
import './globals.css';

// Pass-through root layout. The <html>/<body>, providers, Header/Footer and
// fonts live in `app/[locale]/layout.tsx` (locale-aware) and, for the Sanity
// route, in `app/studio/[[...tool]]/layout.tsx`. This root only carries the
// global base metadata and the global stylesheet. See the i18n Phase 1 plan.
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

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
