import Container from '@/components/ui/Container';
import { Card, CardContent } from '@/components/ui/card';
import Section, { SECTION_BG } from '@/components/ui/Section';

const SKELETON_TECH_ITEMS = [1, 2, 3];
const SKELETON_PROJECT_CARDS = ['a', 'b', 'c', 'd', 'e', 'f'];

function ProjectCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      {/* Image skeleton */}
      <div className="relative h-48 overflow-hidden bg-muted animate-pulse" />

      {/* Content skeleton */}
      <CardContent className="flex-1 flex flex-col p-6">
        {/* Title skeleton */}
        <div className="h-6 bg-muted rounded animate-pulse mb-3 w-3/4" />

        {/* Description skeleton */}
        <div className="space-y-2 mb-4 flex-1">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
          <div className="h-4 bg-muted rounded animate-pulse w-4/6" />
        </div>

        {/* Technologies skeleton */}
        <div className="flex flex-wrap gap-1 mb-4">
          {SKELETON_TECH_ITEMS.map((i) => (
            <div key={i} className="h-5 w-16 bg-muted rounded animate-pulse" />
          ))}
        </div>

        {/* Actions skeleton */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t">
          <div className="h-8 w-24 bg-muted rounded animate-pulse" />
          <div className="flex space-x-1">
            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProyectosLoading() {
  return (
    <>
      {/* Hero Section */}
      <Section background={SECTION_BG.GRADIENT} spacing="xl">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <div className="h-12 bg-muted/50 rounded animate-pulse mb-6 w-2/3 mx-auto" />
            <div className="h-6 bg-muted/50 rounded animate-pulse w-full mx-auto" />
          </div>
        </Container>
      </Section>

      {/* Projects Section */}
      <Section>
        <Container>
          {/* Search skeleton */}
          <div className="mb-8">
            <div className="h-10 bg-muted rounded-lg animate-pulse max-w-md mx-auto" />
          </div>

          {/* Grid skeleton */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SKELETON_PROJECT_CARDS.map((id) => (
              <ProjectCardSkeleton key={id} />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
