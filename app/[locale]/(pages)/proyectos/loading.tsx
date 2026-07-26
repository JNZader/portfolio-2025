import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import { Skeleton } from '@/components/ui/Skeleton';

const SKELETON_PROJECT_ITEMS = Array.from({ length: 6 }, (_, index) => `project-skeleton-${index}`);
const SKELETON_TECH_CHIPS = Array.from({ length: 8 }, (_, index) => `tech-chip-skeleton-${index}`);

export default function ProyectosLoading() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading projects page">
      {/* Hero — mirrors InteriorHero used by the real page */}
      <Section
        container={false}
        spacing={null}
        className="relative overflow-hidden border-b py-16 md:py-24"
      >
        <Container>
          <div
            data-testid="proyectos-loading-hero"
            data-region="hero"
            aria-hidden="true"
            className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)] md:gap-14"
          >
            <div
              data-testid="proyectos-loading-hero-content"
              data-region="hero-content"
              className="max-w-2xl"
            >
              <Skeleton
                data-testid="proyectos-loading-hero-accent"
                data-region="hero-accent"
                className="mb-5 h-1 w-16 rounded-full"
              />
              <Skeleton
                data-testid="proyectos-loading-hero-title"
                data-region="hero-title"
                className="h-12 w-3/4 rounded-lg md:h-14"
              />
              <Skeleton
                data-testid="proyectos-loading-hero-description"
                data-region="hero-description"
                className="mt-6 h-16 w-full max-w-2xl rounded-lg"
              />
            </div>
            <div className="flex justify-center md:justify-end">
              <div
                data-testid="proyectos-loading-hero-motif"
                data-region="hero-motif"
                className="w-full rounded-3xl border border-border/70 bg-card/55 p-4 shadow-sm md:p-6"
              >
                <Skeleton className="h-48 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Projects section — left-aligned search/filter row + card grid */}
      <Section spacing="lg" container={false}>
        <Container>
          <div className="space-y-6">
            <div
              data-testid="proyectos-loading-filters"
              data-region="filter"
              aria-hidden="true"
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-4 sm:flex-row">
                <Skeleton
                  data-testid="proyectos-loading-search"
                  data-region="search"
                  className="h-12 min-w-0 flex-1 border border-input bg-background"
                />
                <Skeleton
                  data-testid="proyectos-loading-filter-control"
                  data-region="control"
                  className="h-11 w-full sm:w-64 rounded-md border border-border"
                />
              </div>
              <div data-region="tech-bar" className="flex flex-wrap gap-2">
                {SKELETON_TECH_CHIPS.map((id) => (
                  <Skeleton key={id} className="h-11 w-20 rounded-md" />
                ))}
                <Skeleton className="h-11 w-24 rounded-md" />
              </div>
            </div>
            <Skeleton
              data-testid="proyectos-loading-result-count"
              data-region="result-count"
              aria-hidden="true"
              className="h-5 w-40"
            />

            <div
              data-testid="proyectos-loading-cards"
              data-region="cards"
              aria-hidden="true"
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {SKELETON_PROJECT_ITEMS.map((id) => (
                <div
                  key={id}
                  data-testid="proyectos-loading-card"
                  data-region="card"
                  className="overflow-hidden rounded-lg border border-border bg-card"
                >
                  <Skeleton data-region="card-image" className="h-48 rounded-none" />
                  <div data-region="card-content" className="p-6">
                    <Skeleton className="mb-3 h-7 w-3/4" />
                    <div className="mb-4 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/6" />
                    </div>
                    <div data-region="card-tech" className="mb-4 flex flex-wrap gap-1.5">
                      <Skeleton className="h-5 w-14 rounded-full" />
                      <Skeleton className="h-5 w-14 rounded-full" />
                      <Skeleton className="h-5 w-14 rounded-full" />
                    </div>
                    <div
                      data-region="card-actions"
                      className="flex items-center justify-between border-t border-border/50 pt-4"
                    >
                      <Skeleton className="h-9 w-24" />
                      <div className="flex gap-1">
                        <Skeleton className="h-9 w-9" />
                        <Skeleton className="h-9 w-9" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
