import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/config/site-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/private/', '/studio/', '/secret-achievements/'],
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
