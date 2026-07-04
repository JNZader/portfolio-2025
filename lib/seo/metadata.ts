import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/config/site-config';

const SITE_NAME = 'Javier Zader — Backend Developer · Sistemas end-to-end';
const SITE_DESCRIPTION =
  'Backend Developer: sistemas end-to-end en Java, Go y Rust, plataformas industriales con ML en el edge y herramientas de desarrollo con IA. 20+ años en tecnología.';

/**
 * OG locale fields (`og:locale` / `og:locale:alternate`) for a given app
 * locale. When a route sets its own `openGraph` object inside
 * `generateMetadata`, it REPLACES the parent layout's `openGraph` — losing
 * `og:locale` — so any route with a per-page `openGraph` must spread this in.
 */
export function ogLocaleFields(locale: string): { locale: string; alternateLocale: string } {
  return locale === 'en'
    ? { locale: 'en_US', alternateLocale: 'es_AR' }
    : { locale: 'es_AR', alternateLocale: 'en_US' };
}

/**
 * Generate metadata for a page
 */
export function generateMetadata({
  title,
  description,
  image,
  path = '',
  type = 'website',
  publishedTime,
  modifiedTime,
  keywords = [],
}: {
  title: string;
  description: string;
  image?: string;
  path?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
}): Metadata {
  const url = `${SITE_URL}${path}`;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    keywords: [...keywords, 'backend', 'java', 'spring boot', 'react', 'next.js', 'desarrollador'],
    authors: [{ name: 'Javier Zader', url: SITE_URL }],
    creator: 'Javier Zader',
    publisher: 'Javier Zader',

    // Basic metadata
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
      languages: {
        'es-ES': url,
      },
    },

    // Open Graph
    openGraph: {
      type,
      locale: 'es_ES',
      url,
      siteName: SITE_NAME,
      title,
      description,
      // Only set an explicit OG image when one is passed. Otherwise we fall
      // back to Next's file-based dynamic OG (app/opengraph-image.tsx), which
      // actually exists — avoids advertising a missing /og-image.png (404).
      ...(image && {
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      }),
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        authors: ['Javier Zader'],
      }),
    },

    // Verification — only emitted when the token is configured (env var).
    // Avoids shipping a placeholder that GSC can't verify.
    ...(process.env.GOOGLE_SITE_VERIFICATION && {
      verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION,
      },
    }),

    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * Default metadata
 */
export const defaultMetadata: Metadata = generateMetadata({
  title: 'Inicio',
  description: SITE_DESCRIPTION,
});
