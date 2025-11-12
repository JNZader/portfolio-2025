import type { Metadata } from 'next';
import { CategoryFilter } from '@/components/blog/CategoryFilter';
import { EmptyState } from '@/components/blog/EmptyState';
import { Pagination } from '@/components/blog/Pagination';
import { PostGrid } from '@/components/blog/PostGrid';
import { SearchInput } from '@/components/blog/SearchInput';
import { SearchStats } from '@/components/blog/SearchStats';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
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

  // Category info (si hay filtro activo)
  const activeCategory = categorySlug
    ? categories.find((cat) => cat.slug.current === categorySlug)
    : null;

  // Determinar si hay búsqueda activa
  const isSearching = !!normalizedSearch;

  return (
    <>
      {/* Hero */}
      <Section className="bg-[var(--color-muted)]">
        <Container>
          <div className="py-12">
            <h1 className="text-4xl font-bold mb-4">
              {activeCategory ? activeCategory.title : 'Blog'}
            </h1>
            <p className="text-lg text-[var(--color-muted-foreground)] max-w-2xl mb-6">
              {activeCategory
                ? activeCategory.description ||
                  `Artículos sobre ${activeCategory.title.toLowerCase()}`
                : 'Artículos sobre desarrollo web, programación y las últimas tecnologías.'}
            </p>

            {/* Search Input */}
            <div className="max-w-md">
              <SearchInput />
            </div>
          </div>
        </Container>
      </Section>

      {/* Filters */}
      {!isSearching && (
        <Section>
          <Container>
            <div className="mb-8">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                Categorías
              </h2>
              <CategoryFilter categories={categories} />
            </div>
          </Container>
        </Section>
      )}

      {/* Search Stats */}
      {isSearching && (
        <Section>
          <Container>
            <SearchStats total={total} categoryName={activeCategory?.title} />
          </Container>
        </Section>
      )}

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
                isSearching
                  ? 'No se encontraron resultados'
                  : activeCategory
                    ? `No hay posts en "${activeCategory.title}"`
                    : 'No hay posts disponibles'
              }
              description={
                isSearching
                  ? `No hay artículos que coincidan con "${searchTerm}". Intenta con otros términos.`
                  : activeCategory
                    ? 'Prueba con otra categoría.'
                    : 'Aún no se han publicado artículos.'
              }
              action={
                isSearching || activeCategory
                  ? { label: 'Ver todos los posts', href: '/blog' }
                  : undefined
              }
            />
          )}
        </Container>
      </Section>

      {/* Stats */}
      {posts.length > 0 && !isSearching && (
        <Section className="border-t">
          <Container>
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Mostrando {posts.length} de {total} artículo
                {total !== 1 ? 's' : ''}
                {activeCategory && (
                  <>
                    {' '}
                    en <strong>{activeCategory.title}</strong>
                  </>
                )}
              </p>
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
