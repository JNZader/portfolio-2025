import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/config/site-config';

const DISALLOWED_PATHS = [
  '/api/',
  '/admin/',
  '/en/admin/',
  '/private/',
  '/studio/',
  '/secret-achievements/',
  '/en/secret-achievements/',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOWED_PATHS,
      },
      {
        userAgent: 'GPTBot', // OpenAI crawler
        allow: '/',
        disallow: DISALLOWED_PATHS,
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: DISALLOWED_PATHS,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
