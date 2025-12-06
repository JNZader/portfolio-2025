import { logger } from '@/lib/monitoring/logger';
import { sanityFetch } from '@/sanity/lib/client';
import { urlForImage } from '@/sanity/lib/image';
import { postsQuery } from '@/sanity/lib/queries';
import type { Post } from '@/types/sanity';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://javierzader.dev';
const AUTHOR_NAME = 'Javier Zader';

/**
 * RSS Feed para el blog
 * Endpoint: /feed.xml
 */
export async function GET() {
  try {
    // Obtener todos los posts publicados
    const posts = await sanityFetch<Post[]>({
      query: postsQuery,
      tags: ['post'],
    });

    // Generar RSS XML
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${AUTHOR_NAME} - Blog de Desarrollo Web</title>
    <link>${SITE_URL}/blog</link>
    <description>Artículos sobre desarrollo web, Java, Spring Boot, React, Next.js y arquitecturas modernas</description>
    <language>es-ES</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/favicon.ico</url>
      <title>${AUTHOR_NAME} - Blog</title>
      <link>${SITE_URL}</link>
    </image>
${posts
  .map((post) => {
    const postUrl = `${SITE_URL}/blog/${post.slug.current}`;
    const imageUrl = post.mainImage ? urlForImage(post.mainImage).width(1200).url() : '';

    return `    <item>
      <title><![CDATA[${escapeXml(post.title)}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${escapeXml(post.excerpt)}]]></description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <dc:creator><![CDATA[${escapeXml(post.author?.name || AUTHOR_NAME)}]]></dc:creator>
${post.categories?.map((cat) => `      <category>${escapeXml(cat.title)}</category>`).join('\n')}
${imageUrl ? `      <enclosure url="${imageUrl}" type="image/jpeg"/>` : ''}
${post.readingTime ? `      <content:encoded><![CDATA[<p>Tiempo de lectura: ${post.readingTime} min</p><p>${escapeXml(post.excerpt)}</p>]]></content:encoded>` : ''}
    </item>`;
  })
  .join('\n')}
  </channel>
</rss>`;

    return new Response(rss, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    logger.error('Error generating RSS feed', error as Error, {
      path: '/feed.xml',
    });
    return new Response('Error generando RSS feed', { status: 500 });
  }
}

/**
 * Escapa caracteres especiales para XML
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
