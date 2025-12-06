import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogPostTracker } from '@/components/blog/BlogPostTracker';
import { Comments } from '@/components/blog/Comments';
import { PortableTextRenderer } from '@/components/blog/PortableTextRenderer';
import { PostHeader } from '@/components/blog/PostHeader';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { ShareButtons } from '@/components/blog/ShareButtons';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import Container from '@/components/ui/Container';
import { logger } from '@/lib/monitoring/logger';
import { generateBlogPostingSchema, generateBreadcrumbSchema } from '@/lib/seo/schema';
import { generateTableOfContents } from '@/lib/utils/toc';
import { sanityFetch } from '@/sanity/lib/client';
import { getImageUrl } from '@/sanity/lib/image';
import { allPostSlugsQuery, postBySlugQuery, relatedPostsQuery } from '@/sanity/lib/queries';
import type { Post } from '@/types/sanity';

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;

  const post = await sanityFetch<Post>({
    query: postBySlugQuery,
    params: { slug },
    tags: [`post:${slug}`],
  });

  if (!post) {
    return {
      title: 'Post no encontrado',
    };
  }

  const ogImage = getImageUrl(post.mainImage, 1200, 630);

  return {
    title: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
    keywords: post.seo?.keywords,
    authors: post.author ? [{ name: post.author.name }] : undefined,
    openGraph: {
      title: post.seo?.metaTitle || post.title,
      description: post.seo?.metaDescription || post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: post.author ? [post.author.name] : undefined,
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: post.mainImage.alt || post.title,
            },
          ]
        : undefined,
    },
  };
}

/**
 * Generate static params (SSG)
 */
export async function generateStaticParams() {
  // Skip static generation in CI with dummy credentials
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!projectId || projectId === 'dummy-project-id') {
    return [];
  }

  try {
    const slugs = await sanityFetch<string[]>({
      query: allPostSlugsQuery,
      tags: ['post'],
    });

    return slugs.map((slug) => ({
      slug,
    }));
  } catch (error) {
    logger.warn('Failed to fetch post slugs for static generation', {
      service: 'blog',
      path: '/blog/[slug]',
      error: (error as Error).message,
    });
    return [];
  }
}

/**
 * Post page
 */
export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  // Fetch post
  const post = await sanityFetch<Post>({
    query: postBySlugQuery,
    params: { slug },
    tags: [`post:${slug}`],
  });

  if (!post) {
    notFound();
  }

  // Generate TOC
  const toc = generateTableOfContents(post.body);

  // Fetch related posts
  const categorySlugArray = post.categories.map((cat) => cat.slug.current);
  const relatedPosts = await sanityFetch<Post[]>({
    query: relatedPostsQuery,
    params: {
      slug,
      categories: categorySlugArray,
    },
    tags: ['post'],
  });

  // Full URL for share buttons
  const fullUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'}/blog/${slug}`;

  // Generate schemas
  const blogPostingSchema = generateBlogPostingSchema({
    title: post.title,
    description: post.excerpt,
    slug: post.slug.current,
    publishedAt: post.publishedAt,
    updatedAt: post._updatedAt,
    image: getImageUrl(post.mainImage, 1200, 630),
    keywords: post.categories?.map((cat) => cat.title),
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Inicio', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: post.title, url: `/blog/${post.slug.current}` },
  ]);

  return (
    <>
      {/* Track blog post view */}
      <BlogPostTracker slug={post.slug.current} title={post.title} />

      {/* JSON-LD Structured Data */}
      <JsonLd data={blogPostingSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* Breadcrumbs */}
      <Container className="pt-8 pb-4">
        <Breadcrumbs
          items={[
            { name: 'Inicio', href: '/' },
            { name: 'Blog', href: '/blog' },
            { name: post.title, href: `/blog/${post.slug.current}` },
          ]}
        />
      </Container>

      {/* Header with hero */}
      <PostHeader post={post} />

      {/* Content */}
      <Container className="py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
            {/* Main content */}
            <article className="min-w-0">
              {/* Body - Card estilizado con MEJOR OPACIDAD */}
              <div className="mb-12 bg-card backdrop-blur-sm rounded-xl border-2 border-border p-8 md:p-12 shadow-md">
                {/* biome-ignore lint/suspicious/noExplicitAny: Type incompatibility between Sanity and Portable Text library */}
                <PortableTextRenderer value={post.body as any} />
              </div>

              {/* Share buttons - Card con MEJOR OPACIDAD */}
              <div className="mb-12 bg-card backdrop-blur-sm rounded-xl border-2 border-border p-6 shadow-md">
                <ShareButtons url={fullUrl} />
              </div>

              {/* Related posts */}
              {relatedPosts.length > 0 && <RelatedPosts posts={relatedPosts} />}

              {/* Comments */}
              <Comments term={`/blog/${slug}`} />
            </article>

            {/* Sidebar (TOC) */}
            {toc.length > 0 && (
              <aside className="hidden lg:block">
                <div className="sticky top-24">
                  <TableOfContents items={toc} />
                </div>
              </aside>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
