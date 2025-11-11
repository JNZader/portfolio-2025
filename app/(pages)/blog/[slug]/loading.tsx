import Container from '@/components/ui/Container';

export default function PostLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <div className="relative aspect-[16/9] max-h-[600px] animate-pulse bg-[var(--color-gray-300)]" />

      {/* Excerpt skeleton */}
      <div className="border-b bg-[var(--color-muted)] py-8">
        <div className="mx-auto max-w-4xl px-6">
          <div className="h-6 w-full animate-pulse rounded bg-[var(--color-gray-300)]" />
          <div className="mt-2 h-6 w-3/4 animate-pulse rounded bg-[var(--color-gray-300)]" />
        </div>
      </div>

      {/* Content skeleton */}
      <Container className="py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
            {/* Main content */}
            <div className="space-y-6">
              {Array.from({ length: 8 }, (_, i) => `content-skeleton-${i}`).map((id) => (
                <div key={id} className="space-y-2">
                  <div className="h-4 w-full animate-pulse rounded bg-[var(--color-gray-300)]" />
                  <div className="h-4 w-11/12 animate-pulse rounded bg-[var(--color-gray-300)]" />
                  <div className="h-4 w-10/12 animate-pulse rounded bg-[var(--color-gray-300)]" />
                </div>
              ))}
            </div>

            {/* Sidebar skeleton */}
            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-[var(--color-gray-300)]" />
                {Array.from({ length: 5 }, (_, i) => `sidebar-skeleton-${i}`).map((id) => (
                  <div
                    key={id}
                    className="h-4 w-full animate-pulse rounded bg-[var(--color-gray-300)]"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
