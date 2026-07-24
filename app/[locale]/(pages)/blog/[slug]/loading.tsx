import Container from '@/components/ui/Container';
import { Skeleton } from '@/components/ui/Skeleton';

const SKELETON_CONTENT_ITEMS = Array.from({ length: 8 }, (_, i) => `content-skeleton-${i}`);
const SKELETON_SIDEBAR_ITEMS = Array.from({ length: 5 }, (_, i) => `sidebar-skeleton-${i}`);

export default function PostLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <Skeleton className="relative aspect-[16/9] max-h-[600px] rounded-none" />

      {/* Excerpt skeleton */}
      <div className="border-b bg-[var(--color-muted)] py-8">
        <div className="mx-auto max-w-4xl px-6">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="mt-2 h-6 w-3/4" />
        </div>
      </div>

      {/* Content skeleton */}
      <Container className="py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
            {/* Main content */}
            <div className="space-y-6">
              {SKELETON_CONTENT_ITEMS.map((id) => (
                <div key={id} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="h-4 w-10/12" />
                </div>
              ))}
            </div>

            {/* Sidebar skeleton */}
            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-2">
                <Skeleton className="h-4 w-24" />
                {SKELETON_SIDEBAR_ITEMS.map((id) => (
                  <Skeleton key={id} className="h-4 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
