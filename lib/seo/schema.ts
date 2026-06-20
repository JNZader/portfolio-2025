import type { BlogPosting, BreadcrumbList, Person, WebSite, WithContext } from 'schema-dts';
import { SITE_URL } from '@/lib/config/site-config';
import type { ResumeDataRaw } from '@/lib/types/resume';

/**
 * Generate Person schema (for homepage)
 */
export function generatePersonSchema(): WithContext<Person> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Javier Norberto Zader',
    url: SITE_URL,
    image: `${SITE_URL}/images/profile.jpg`,
    jobTitle: 'Backend Java Developer',
    description:
      'Backend Java Developer con más de 20 años de experiencia en tecnología, especializado en Spring Boot, React y arquitecturas modernas. Técnico en Desarrollo de Software.',
    sameAs: ['https://github.com/JNZader', 'https://linkedin.com/in/jnzader'],
    knowsAbout: [
      'Java',
      'Spring Boot',
      'Spring Framework',
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
export function generateResumePersonSchema(data: ResumeDataRaw): WithContext<Person> {
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
    url: `${SITE_URL}/cv`,
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
    description:
      'Backend Java Developer especializado en Spring Boot, React y arquitecturas modernas',
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
}): WithContext<BlogPosting> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.image ?? `${SITE_URL}/images/portfolio-preview.png`,
    url: `${SITE_URL}/blog/${post.slug}`,
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
      '@id': `${SITE_URL}/blog/${post.slug}`,
    },
  };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}
