import type { BlogPosting, BreadcrumbList, Person, WebSite, WithContext } from 'schema-dts';
import { SITE_URL } from '@/lib/config/site-config';
import { localizedUrl } from '@/lib/seo/locale-url';
import type { ResumeDataRaw } from '@/lib/types/resume';

const PERSON_DESCRIPTION_ES =
  'Backend Developer con más de 20 años en tecnología, especializado en sistemas end-to-end con Java, Go y Rust — de plataformas industriales con ML en el edge a herramientas de desarrollo con IA. Técnico en Desarrollo de Software.';
const PERSON_DESCRIPTION_EN =
  'Backend Developer with 20+ years in technology, specialized in end-to-end systems with Java, Go, and Rust — from industrial platforms with ML at the edge to AI-powered development tools. Software Development Technician.';

/**
 * Generate Person schema (for homepage)
 *
 * @param locale - 'es' (default) or 'en'. Controls the canonical `url` (EN
 * gets the `/en` prefix) and the human-readable `description`.
 */
export function generatePersonSchema(locale = 'es'): WithContext<Person> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Javier Norberto Zader',
    url: locale === 'en' ? `${SITE_URL}/en` : SITE_URL,
    image: `${SITE_URL}/images/profile.jpg`,
    jobTitle: 'Backend Developer',
    description: locale === 'en' ? PERSON_DESCRIPTION_EN : PERSON_DESCRIPTION_ES,
    sameAs: ['https://github.com/JNZader', 'https://www.linkedin.com/in/jnzader/'],
    knowsAbout: [
      'Java',
      'Spring Boot',
      'Go',
      'Rust',
      'Python',
      'Machine Learning',
      'React',
      'Next.js',
      'Node.js',
      'PostgreSQL',
      'MySQL',
      'Docker',
      'REST APIs',
      'Hibernate ORM',
      'JWT',
      'Web Development',
    ],
    alumniOf: {
      '@type': 'Organization',
      name: 'Universidad Gastón Dachary',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Córdoba',
      addressCountry: 'Argentina',
    },
  };
}

/**
 * Generate Person schema from live resume data (for the /cv page).
 *
 * Unlike generatePersonSchema() — which is hardcoded for the homepage — this
 * derives jobTitle, knowsAbout, and alumniOf from the actual resume data
 * (Sanity with JSON fallback), so the structured data stays in sync with the
 * CV content without manual edits.
 */
export function generateResumePersonSchema(
  data: ResumeDataRaw,
  locale = 'es'
): WithContext<Person> {
  // "Córdoba, Argentina" → locality + country
  const [locality, country] = data.personalInfo.location.split(',').map((s) => s.trim());

  // Flatten all skill categories into a single knowsAbout list.
  const knowsAbout = Object.values(data.skills).flat();

  // One Organization per education entry (deduped by institution name).
  const institutions = [...new Set(data.education.map((e) => e.institution).filter(Boolean))];

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: data.personalInfo.name,
    url: locale === 'en' ? `${SITE_URL}/en/cv` : `${SITE_URL}/cv`,
    image: `${SITE_URL}/images/profile.jpg`,
    jobTitle: data.personalInfo.title,
    description: data.summary,
    sameAs: [data.personalInfo.github, data.personalInfo.linkedin].filter(Boolean),
    knowsAbout,
    alumniOf: institutions.map((name) => ({ '@type': 'Organization' as const, name })),
    address: {
      '@type': 'PostalAddress',
      addressLocality: locality,
      addressCountry: country,
    },
  };
}

/**
 * Generate WebSite schema
 */
export function generateWebSiteSchema(): WithContext<WebSite> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Javier Zader - Portfolio',
    url: SITE_URL,
    description: 'Backend Developer · Sistemas end-to-end en Java, Go y Rust',
    author: {
      '@type': 'Person',
      name: 'Javier Zader',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/blog?search={search_term_string}`,
      },
      // @ts-expect-error - query-input is valid in schema.org but not in schema-dts types
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate BlogPosting schema
 */
export function generateBlogPostingSchema(post: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  image?: string;
  keywords?: string[];
  locale?: string;
}): WithContext<BlogPosting> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.image ?? `${SITE_URL}/images/portfolio-preview.png`,
    url: localizedUrl(`/blog/${post.slug}`, post.locale ?? 'es'),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: {
      '@type': 'Person',
      name: 'Javier Zader',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Javier Zader',
    },
    keywords: post.keywords?.join(', '),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': localizedUrl(`/blog/${post.slug}`, post.locale ?? 'es'),
    },
  };
}

/**
 * Generate BreadcrumbList schema
 *
 * @param locale - 'es' (default) or 'en'. Controls whether each item's `item`
 * URL gets the `/en` prefix (mirrors `localeAlternates`'s path handling).
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
  locale = 'es'
): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => {
      const path = locale === 'en' ? (item.url === '/' ? '/en' : `/en${item.url}`) : item.url;
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${SITE_URL}${path}`,
      };
    }),
  };
}
