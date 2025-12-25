import type { Metadata } from 'next';
import { RevealOnScroll } from '@/components/animations';
import { BlogFilters } from '@/components/blog/BlogFilters';
import { EmptyState } from '@/components/blog/EmptyState';
import { Pagination } from '@/components/blog/Pagination';
import { PostGrid } from '@/components/blog/PostGrid';
import { SearchTracker } from '@/components/blog/SearchTracker';
import Container from '@/components/ui/Container';
import Section, { SectionDescription, SectionHeader, SectionTitle } from '@/components/ui/Section';
import { getPaginationRange, getTotalPages } from '@/lib/utils/blog';
import { isValidSearchTerm, normalizeSearchTerm } from '@/lib/utils/search';
import { sanityFetch } from '@/sanity/lib/client';
import { categoriesQuery, paginatedPostsQuery } from '@/sanity/lib/queries';
import type { Category, Post } from '@/types/sanity';

export const metadata: Metadata = {
  title: 'Blog - Portfolio 2025',
  description: 'Artículos sobre desarrollo web, programación y tecnología.',
};

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    search?: string;
  }>;
}

export default async function BlogPage({ searchParams }: Readonly<BlogPageProps>) {
  const params = await searchParams;
  const currentPage = Number.parseInt(params.page ?? '1', 10);
  const categorySlug = params.category ?? null;
  const searchTerm = params.search ?? '';

  // Normalizar búsqueda para GROQ
  const normalizedSearch =
    searchTerm && isValidSearchTerm(searchTerm) ? normalizeSearchTerm(searchTerm) : null;

  // Fetch categories
  const categories = await sanityFetch<Category[]>({
    query: categoriesQuery,
    tags: ['category'],
  });

  // Fetch paginated posts con búsqueda
  const { start, end } = getPaginationRange(currentPage);
  const { posts, total } = await sanityFetch<{
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
  });

  const totalPages = getTotalPages(total);

  // Determine empty state message and description
  let emptyTitle: string;
  let emptyDescription: string;

  if (normalizedSearch || categorySlug) {
    emptyTitle = 'No se encontraron resultados';
    if (normalizedSearch) {
      emptyDescription = `No hay artículos que coincidan con "${searchTerm}". Intenta con otros términos.`;
    } else {
      emptyDescription = 'Prueba con otra categoría.';
    }
  } else {
    emptyTitle = 'No hay posts disponibles';
    emptyDescription = 'Aún no se han publicado artículos.';
  }

  return (
    <>
      {/* Track search query */}
      {searchTerm && normalizedSearch && <SearchTracker query={searchTerm} results={total} />}

      {/* Hero */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-tertiary/5" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
        </div>

        {/* Animated blobs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-tertiary/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '1s' }}
        />

        {/* Dot pattern overlay */}
        <div className="absolute inset-0 -z-10 opacity-[0.02] dark:opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        <Container className="relative z-10">
          <RevealOnScroll>
            <SectionHeader centered>
              <SectionTitle size="xl" as="h1">
                Blog
              </SectionTitle>
              <SectionDescription size="lg" className="mx-auto">
                Artículos sobre desarrollo web, programación y las últimas tecnologías.
              </SectionDescription>
            </SectionHeader>
          </RevealOnScroll>
        </Container>
      </section>

      {/* Search and Filters */}
      <Section spacing="lg">
        <Container>
          <RevealOnScroll>
            <BlogFilters categories={categories} totalPosts={total} />
          </RevealOnScroll>
        </Container>
      </Section>

      {/* Posts Grid */}
      <Section>
        <Container>
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
                  ? { label: 'Ver todos los posts', href: '/blog' }
                  : undefined
              }
            />
          )}
        </Container>
      </Section>
    </>
  );
}
