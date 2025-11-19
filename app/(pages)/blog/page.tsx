import type { Metadata } from 'next';
import { RevealOnScroll } from '@/components/animations';
import { BlogFilters } from '@/components/blog/BlogFilters';
import { EmptyState } from '@/components/blog/EmptyState';
import { Pagination } from '@/components/blog/Pagination';
import { PostGrid } from '@/components/blog/PostGrid';
import Container from '@/components/ui/Container';
import Section, {
  SECTION_BG,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from '@/components/ui/Section';
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

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1', 10);
  const categorySlug = params.category || null;
  const searchTerm = params.search || '';

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

  return (
    <>
      {/* Hero */}
      <Section background={SECTION_BG.GRADIENT} spacing="xl">
        <Container>
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
      </Section>

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
              title={
                normalizedSearch || categorySlug
                  ? 'No se encontraron resultados'
                  : 'No hay posts disponibles'
              }
              description={
                normalizedSearch
                  ? `No hay artículos que coincidan con "${searchTerm}". Intenta con otros términos.`
                  : categorySlug
                    ? 'Prueba con otra categoría.'
                    : 'Aún no se han publicado artículos.'
              }
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
