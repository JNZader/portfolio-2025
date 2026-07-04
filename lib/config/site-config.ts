/**
 * Site-wide configuration
 * Central source of truth for site metadata and settings
 */

/**
 * Hard fallback when NEXT_PUBLIC_SITE_URL isn't set at all. Exported so
 * `lib/config/site-url.ts` (the guarded getter used for transactional email
 * links) can reuse the exact same literal instead of duplicating it.
 */
export const DEFAULT_SITE_URL = 'https://javierzader.com';

/**
 * Canonical site URL. Single source of truth for the production domain.
 * Falls back to the canonical .com domain so SEO/canonical/OG URLs stay
 * consistent across the whole app (metadata, schema, sitemap, robots, feed).
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;

export const SITE_CONFIG = {
  name: 'Javier Zader',
  title: 'Javier Zader - Backend Developer',
  description: 'Backend Developer · Sistemas end-to-end en Java, Go y Rust',
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
    'Go',
    'Rust',
    'React',
    'Next.js',
    'TypeScript',
    'Portfolio',
  ],
} as const;

export type SiteConfig = typeof SITE_CONFIG;
