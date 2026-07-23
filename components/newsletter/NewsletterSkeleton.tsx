import { Skeleton } from '@/components/ui/Skeleton';

const SKELETON_FEATURES = [1, 2, 3];

export function NewsletterSkeleton() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center space-y-8">
          {/* Badge skeleton */}
          <div className="flex justify-center">
            <Skeleton className="h-8 w-32 rounded-full" />
          </div>

          {/* Title skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-10 md:h-12 max-w-xl mx-auto" />
            <Skeleton className="h-6 max-w-2xl mx-auto" />
          </div>

          {/* Form skeleton */}
          <div className="max-w-md mx-auto p-8 rounded-lg border bg-card shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              <Skeleton className="flex-1 h-12" />
              <Skeleton className="h-12 w-full sm:w-auto sm:px-6 bg-primary/20" />
            </div>
            <div className="flex items-center gap-4 mt-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>

          {/* Features skeleton */}
          <div className="flex flex-wrap justify-center gap-6">
            {SKELETON_FEATURES.map((i) => (
              <Skeleton key={i} className="h-5 w-48" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
