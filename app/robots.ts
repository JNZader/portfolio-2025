import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/config/site-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // admin/secret-achievements live under [locale] → also block the /en
        // prefixed variants. api/studio sit outside [locale] (no prefix).
        disallow: [
          '/api/',
          '/admin/',
          '/en/admin/',
          '/private/',
          '/studio/',
          '/secret-achievements/',
          '/en/secret-achievements/',
        ],
      },
      {
        userAgent: 'GPTBot', // OpenAI crawler
        allow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
