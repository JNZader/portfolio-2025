import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RevealOnScroll } from '@/components/animations';
import { BlogFilters } from '@/components/blog/BlogFilters';
import { EmptyState } from '@/components/blog/EmptyState';
import { Pagination } from '@/components/blog/Pagination';
import { PostGrid } from '@/components/blog/PostGrid';
import { SearchTracker } from '@/components/blog/SearchTracker';
import Container from '@/components/ui/Container';
import { InteriorHero } from '@/components/ui/InteriorHero';
import Section from '@/components/ui/Section';
import { localeAlternates } from '@/lib/seo/alternates';
import { getPaginationRange, getTotalPages } from '@/lib/utils/blog';
import { isValidSearchTerm, normalizeSearchTerm } from '@/lib/utils/search';
import { sanityFetch } from '@/sanity/lib/client';
import { categoriesQuery, paginatedPostsQuery } from '@/sanity/lib/queries';
import type { Category, Post } from '@/types/sanity';

interface BlogPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: string;
    category?: string;
    search?: string;
  }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: Readonly<BlogPageProps>): Promise<Metadata> {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const t = await getTranslations({ locale, namespace: 'Blog' });
  const paramsValue = query;
  const isFiltered = Boolean(paramsValue.search || paramsValue.category || paramsValue.page);

  return {
    title: 'Blog',
    description: t('metaDescription'),
    alternates: await localeAlternates('/blog'),
    // Filtered views (search/category/page) are thin/duplicate of /blog.
    // Keep them out of the index but follow links (canonical above already
    // consolidates them to /blog).
    ...(isFiltered && {
      robots: { index: false, follow: true },
    }),
  };
}

export default async function BlogPage({ params, searchParams }: Readonly<BlogPageProps>) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations('Blog');
  const paramsValue = query;
  const currentPage = Number.parseInt(paramsValue.page ?? '1', 10);
  const categorySlug = paramsValue.category ?? null;
  const searchTerm = paramsValue.search ?? '';

  // Normalizar búsqueda para GROQ
  const normalizedSearch =
    searchTerm && isValidSearchTerm(searchTerm) ? normalizeSearchTerm(searchTerm) : null;

  // Categories and posts are independent queries — fetch them in parallel
  // instead of paying two sequential Sanity round-trips.
  const { start, end } = getPaginationRange(currentPage);
  const [categories, { posts, total }] = await Promise.all([
    sanityFetch<Category[]>({
      query: categoriesQuery,
      tags: ['category'],
    }),
    sanityFetch<{
      posts: Post[];
      total: number;
    }>({
      query: paginatedPostsQuery,
      params: {
        start,
        end,
        category: categorySlug,
        search: normalizedSearch,
      },
      tags: ['post'],
    }),
  ]);

  const totalPages = getTotalPages(total);

  // Determine empty state message and description
  let emptyTitle: string;
  let emptyDescription: string;

  if (normalizedSearch || categorySlug) {
    emptyTitle = t('emptySearchTitle');
    if (normalizedSearch) {
      emptyDescription = t('emptySearch', { search: searchTerm });
    } else {
      emptyDescription = t('emptyCategory');
    }
  } else {
    emptyTitle = t('emptyTitle');
    emptyDescription = t('emptyDescription');
  }

  return (
    <>
      {/* Track search query */}
      {searchTerm && normalizedSearch && <SearchTracker query={searchTerm} results={total} />}

      {/* Hero — shared InteriorHero (same language as projects/contact/about) */}
      <InteriorHero variant="blog" title="Blog" description={t('heroDescription')} />

      {/* Search, filters and posts grid — one section to avoid dead vertical gap */}
      <Section spacing="lg">
        <Container>
          <div className="space-y-8">
            <RevealOnScroll>
              <BlogFilters categories={categories} totalPosts={total} />
            </RevealOnScroll>

            {posts.length > 0 ? (
              <>
                <PostGrid posts={posts} />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12">
                    <Pagination currentPage={currentPage} totalPages={totalPages} />
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                title={emptyTitle}
                description={emptyDescription}
                action={
                  normalizedSearch || categorySlug
                    ? { label: t('viewAll'), href: '/blog' }
                    : undefined
                }
              />
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}
