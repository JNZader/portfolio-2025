/**
 * Site-wide configuration
 * Central source of truth for site metadata and settings
 */

/**
 * Canonical site URL. Single source of truth for the production domain.
 * Falls back to the canonical .com domain so SEO/canonical/OG URLs stay
 * consistent across the whole app (metadata, schema, sitemap, robots, feed).
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://javierzader.com';

export const SITE_CONFIG = {
  name: 'Javier Zader',
  title: 'Javier Zader - Backend Java Developer',
  description: 'Backend Java Developer especializado en Spring Boot y microservicios',
  url: SITE_URL,
  locale: 'es-AR',
  author: {
    name: 'Javier Zader',
    email: 'jnzader@gmail.com',
    github: 'https://github.com/JNZader',
    linkedin: 'https://www.linkedin.com/in/jnzader/',
  },
  keywords: [
    'Backend Developer',
    'Java Developer',
    'Spring Boot',
    'React',
    'Next.js',
    'TypeScript',
    'Portfolio',
  ],
} as const;

export type SiteConfig = typeof SITE_CONFIG;
