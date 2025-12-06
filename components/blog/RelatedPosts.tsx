import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { getPrimaryCategory } from '@/lib/utils/blog';
import { formatDate } from '@/lib/utils/format';
import { getImageUrl } from '@/sanity/lib/image';
import type { Post } from '@/types/sanity';

interface RelatedPostsProps {
  posts: Post[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 border-t border-border pt-12">
      <h2 className="mb-6 text-2xl font-bold text-foreground">Artículos relacionados</h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const imageUrl = getImageUrl(post.mainImage, 600, 400);
          const primaryCategory = getPrimaryCategory(post);

          return (
            <Link
              key={post._id}
              href={`/blog/${post.slug.current}`}
              className="group block overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md hover:border-primary/30"
            >
              {/* Image */}
              {imageUrl && (
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <Image
                    src={imageUrl}
                    alt={post.mainImage.alt || post.title}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                {primaryCategory && (
                  <Badge
                    variant="outline"
                    className="mb-2"
                    style={{
                      borderColor: primaryCategory.color || undefined,
                      color: primaryCategory.color || undefined,
                    }}
                  >
                    {primaryCategory.title}
                  </Badge>
                )}

                <h3 className="mb-2 line-clamp-2 font-semibold text-foreground group-hover:text-primary transition-colors">
                  {post.title}
                </h3>

                <p className="text-sm text-muted-foreground">
                  {formatDate(post.publishedAt, 'short')}
                  {post.readingTime && ` • ${post.readingTime} min`}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
