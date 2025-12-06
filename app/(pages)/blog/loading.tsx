import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';

export default function BlogLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <Section className="bg-[var(--color-muted)]">
        <Container>
          <div className="py-12">
            <div className="h-10 w-48 animate-pulse rounded-lg bg-[var(--color-gray-300)]" />
            <div className="mt-4 h-6 w-96 max-w-full animate-pulse rounded-lg bg-[var(--color-gray-300)]" />
          </div>
        </Container>
      </Section>

      {/* Filters skeleton */}
      <Section>
        <Container>
          <div className="mb-8">
            <div className="mb-4 h-4 w-24 animate-pulse rounded bg-[var(--color-gray-300)]" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }, (_, i) => `filter-skeleton-${i}`).map((id) => (
                <div
                  key={id}
                  className="h-9 w-24 animate-pulse rounded-md bg-[var(--color-gray-300)]"
                />
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Grid skeleton */}
      <Section>
        <Container>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => `post-skeleton-${i}`).map((id) => (
              <div
                key={id}
                className="overflow-hidden rounded-lg border bg-[var(--color-background)]"
              >
                {/* Image skeleton */}
                <div className="aspect-[16/9] animate-pulse bg-[var(--color-gray-300)]" />

                {/* Content skeleton */}
                <div className="p-6">
                  <div className="mb-3 h-6 w-20 animate-pulse rounded-full bg-[var(--color-gray-300)]" />
                  <div className="mb-2 h-6 w-full animate-pulse rounded bg-[var(--color-gray-300)]" />
                  <div className="mb-4 space-y-2">
                    <div className="h-4 w-full animate-pulse rounded bg-[var(--color-gray-300)]" />
                    <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--color-gray-300)]" />
                  </div>
                  <div className="flex items-center gap-3 pt-4">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-[var(--color-gray-300)]" />
                    <div className="space-y-1">
                      <div className="h-4 w-24 animate-pulse rounded bg-[var(--color-gray-300)]" />
                      <div className="h-3 w-20 animate-pulse rounded bg-[var(--color-gray-300)]" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
