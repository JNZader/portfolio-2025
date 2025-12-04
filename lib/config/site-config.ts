/**
 * Site-wide configuration
 * Central source of truth for site metadata and settings
 */
export const SITE_CONFIG = {
  name: 'Javier Zader',
  title: 'Javier Zader - Backend Java Developer',
  description: 'Backend Java Developer especializado en Spring Boot y microservicios',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
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
