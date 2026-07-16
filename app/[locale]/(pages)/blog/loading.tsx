import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';

const SKELETON_POST_ITEMS = Array.from({ length: 6 }, (_, index) => `post-skeleton-${index}`);

const PULSE = 'animate-pulse bg-muted-foreground/20';

export default function BlogLoading() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading blog page">
      <Section
        container={false}
        spacing={null}
        className="relative overflow-hidden border-b py-16 md:py-24"
      >
        <Container>
          <div
            data-testid="blog-loading-hero"
            data-region="hero"
            aria-hidden="true"
            className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)] md:gap-14"
          >
            <div
              data-testid="blog-loading-hero-content"
              data-region="hero-content"
              className="max-w-2xl"
            >
              <div
                data-testid="blog-loading-hero-accent"
                data-region="hero-accent"
                className={`mb-5 h-1 w-16 rounded-full ${PULSE}`}
              />
              <div
                data-testid="blog-loading-hero-title"
                data-region="hero-title"
                className={`h-12 w-3/4 rounded-lg md:h-14 ${PULSE}`}
              />
              <div
                data-testid="blog-loading-hero-description"
                data-region="hero-description"
                className={`mt-6 h-16 w-full max-w-2xl rounded-lg ${PULSE}`}
              />
            </div>
            <div className="flex justify-center md:justify-end">
              <div
                data-testid="blog-loading-hero-motif"
                data-region="hero-motif"
                className="w-full rounded-3xl border border-border/70 bg-card/55 p-4 shadow-sm md:p-6"
              >
                <div className={`aspect-square w-full rounded-2xl ${PULSE}`} />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="lg" container={false}>
        <Container>
          <div
            data-testid="blog-loading-filters"
            data-region="filter"
            aria-hidden="true"
            className="space-y-4"
          >
            <div className="flex flex-col gap-4 sm:flex-row">
              <div
                data-testid="blog-loading-search"
                data-region="search"
                className={`h-10 min-w-0 flex-1 rounded-md border border-input bg-background ${PULSE}`}
              />
              <div
                data-testid="blog-loading-filter-control"
                data-region="control"
                className={`h-10 w-24 rounded-md border border-border ${PULSE}`}
              />
            </div>
            <div
              data-testid="blog-loading-result-count"
              data-region="result-count"
              className={`h-5 w-32 rounded ${PULSE}`}
            />
          </div>
        </Container>
      </Section>

      <Section spacing="lg" container={false}>
        <Container>
          <div
            data-testid="blog-loading-cards"
            data-region="cards"
            aria-hidden="true"
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {SKELETON_POST_ITEMS.map((id) => (
              <div
                key={id}
                data-testid="blog-loading-card"
                data-region="card"
                className="overflow-hidden rounded-lg border border-border bg-background"
              >
                <div data-region="card-image" className={`aspect-[16/9] ${PULSE}`} />
                <div data-region="card-content" className="p-6">
                  <div className={`mb-3 h-6 w-20 rounded-full ${PULSE}`} />
                  <div className={`mb-2 h-6 w-full rounded ${PULSE}`} />
                  <div className="mb-4 space-y-2">
                    <div className={`h-4 w-full rounded ${PULSE}`} />
                    <div className={`h-4 w-3/4 rounded ${PULSE}`} />
                  </div>
                  <div data-region="card-author" className="flex items-center gap-3 pt-4">
                    <div className={`h-10 w-10 rounded-full ${PULSE}`} />
                    <div className="space-y-1">
                      <div className={`h-4 w-24 rounded ${PULSE}`} />
                      <div className={`h-3 w-20 rounded ${PULSE}`} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </div>
  );
}
