import type { BlogPosting, BreadcrumbList, Person, WebSite, WithContext } from 'schema-dts';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://javierzader.dev';

/**
 * Generate Person schema (for homepage)
 */
export function generatePersonSchema(): WithContext<Person> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Javier Norberto Zader',
    url: SITE_URL,
    image: `${SITE_URL}/profile.jpg`,
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
    image: post.image || `${SITE_URL}/og-image.png`,
    url: `${SITE_URL}/blog/${post.slug}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      '@type': 'Person',
      name: 'Javier Zader',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Javier Zader',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
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
