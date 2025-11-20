import { groq } from 'next-sanity';

/**
 * Proyectos
 */
export const projectsQuery = groq`
  *[_type == "project"] | order(publishedAt desc) {
    _id,
    _updatedAt,
    title,
    slug,
    excerpt,
    mainImage,
    technologies,
    demoUrl,
    githubUrl,
    featured,
    publishedAt
  }
`;

export const featuredProjectsQuery = groq`
  *[_type == "project" && featured == true] | order(publishedAt desc) [0...3] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    technologies,
    demoUrl,
    githubUrl
  }
`;

export const projectBySlugQuery = groq`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    technologies,
    demoUrl,
    githubUrl,
    featured,
    publishedAt,
    body
  }
`;

/**
 * Blog Posts
 */
export const postsQuery = groq`
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    _updatedAt,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    readingTime,
    featured,
    categories[]-> {
      _id,
      title,
      slug,
      color
    },
    author
  }
`;

export const featuredPostsQuery = groq`
  *[_type == "post" && featured == true] | order(publishedAt desc) [0...3] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    readingTime,
    categories[]-> {
      _id,
      title,
      slug,
      color
    }
  }
`;

export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    readingTime,
    featured,
    categories[]-> {
      _id,
      title,
      slug,
      color
    },
    author,
    seo,
    body
  }
`;

export const postsByCategoryQuery = groq`
  *[_type == "post" && $categorySlug in categories[]->slug.current] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    readingTime,
    categories[]-> {
      _id,
      title,
      slug,
      color
    }
  }
`;

/**
 * Categorías
 */
export const categoriesQuery = groq`
  *[_type == "category"] | order(title asc) {
    _id,
    title,
    slug,
    description,
    color,
    "postCount": count(*[_type == "post" && references(^._id)])
  }
`;

export const categoryBySlugQuery = groq`
  *[_type == "category" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    color
  }
`;

/**
 * Posts con paginación Y búsqueda
 */
export const paginatedPostsQuery = groq`{
  "posts": *[
    _type == "post" &&
    (!defined($category) || $category in categories[]->slug.current) &&
    (!defined($search) || [title, excerpt, pt::text(body)] match $search)
  ] | order(publishedAt desc) [$start...$end] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    readingTime,
    featured,
    categories[]-> {
      _id,
      title,
      slug,
      color
    },
    author
  },
  "total": count(*[
    _type == "post" &&
    (!defined($category) || $category in categories[]->slug.current) &&
    (!defined($search) || [title, excerpt, pt::text(body)] match $search)
  ])
}`;


/**
 * Posts destacados para sidebar
 */
export const sidebarPostsQuery = groq`
  *[_type == "post" && featured == true] | order(publishedAt desc) [0...5] {
    _id,
    title,
    slug,
    publishedAt,
    readingTime
  }
`;

/**
 * Posts relacionados (misma categoría)
 */
export const relatedPostsQuery = groq`
  *[
    _type == "post" &&
    slug.current != $slug &&
    count((categories[]->slug.current)[@ in $categories]) > 0
  ] | order(publishedAt desc) [0...3] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    readingTime,
    categories[]-> {
      _id,
      title,
      slug,
      color
    }
  }
`;

/**
 * Todos los slugs (para generateStaticParams)
 */
export const allPostSlugsQuery = groq`
  *[_type == "post" && defined(slug.current)][].slug.current
`;