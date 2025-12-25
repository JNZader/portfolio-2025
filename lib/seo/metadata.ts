import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://javierzader.dev';
const SITE_NAME = 'Javier Zader - Backend Java Developer';
const SITE_DESCRIPTION =
  'Backend Java Developer con más de 20 años de experiencia en tecnología, especializado en Spring Boot, React y arquitecturas modernas';

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
  const ogImage = image ?? `${SITE_URL}/og-image.png`;

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
        'en-US': url.replace(SITE_URL, `${SITE_URL}/en`),
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
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        authors: ['Javier Zader'],
      }),
    },

    // Verification
    verification: {
      google: 'google-site-verification-code',
      // yandex: 'yandex-verification-code',
      // bing: 'bing-verification-code',
    },

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
