import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { getPrimaryCategory } from '@/lib/utils/blog';
import { formatDate } from '@/lib/utils/format';
import { getImageBlurUrl, getImageUrl } from '@/sanity/lib/image';
import type { Post } from '@/types/sanity';

interface PostCardProps {
  post: Post;
  priority?: boolean;
}

export function PostCard({ post, priority = false }: PostCardProps) {
  const imageUrl = getImageUrl(post.mainImage, 800, 450);
  const blurUrl = getImageBlurUrl(post.mainImage);
  const primaryCategory = getPrimaryCategory(post);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border bg-[var(--color-background)] transition-shadow hover:shadow-lg">
      {/* Image */}
      <Link
        href={`/blog/${post.slug.current}`}
        className="relative aspect-[16/9] overflow-hidden bg-[var(--color-muted)]"
      >
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={post.mainImage.alt || post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
            placeholder={blurUrl ? 'blur' : 'empty'}
            blurDataURL={blurUrl}
          />
        )}

        {/* Featured badge */}
        {post.featured && (
          <div className="absolute left-4 top-4">
            <Badge variant="default">Destacado</Badge>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        {/* Category + Reading time */}
        <div className="mb-3 flex items-center gap-3 text-sm">
          {primaryCategory && (
            <Link
              href={`/blog?category=${primaryCategory.slug.current}`}
              className="hover:underline"
            >
              <Badge
                variant="outline"
                style={{
                  borderColor: primaryCategory.color || 'var(--color-border)',
                  color: primaryCategory.color || 'var(--color-foreground)',
                }}
              >
                {primaryCategory.title}
              </Badge>
            </Link>
          )}

          {post.readingTime && (
            <span className="text-[var(--color-muted-foreground)]">
              {post.readingTime} min lectura
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="mb-2 line-clamp-2 text-xl font-semibold">
          <Link
            href={`/blog/${post.slug.current}`}
            className="hover:text-[var(--color-primary)] transition-colors"
          >
            {post.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="mb-4 line-clamp-3 text-[var(--color-muted-foreground)]">{post.excerpt}</p>

        {/* Footer */}
        <div className="mt-auto flex items-center gap-3 pt-4 border-t">
          {/* Author avatar */}
          {post.author?.image && (
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-[var(--color-muted)]">
              <Image
                src={getImageUrl(post.author.image, 40, 40)}
                alt={post.author.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Author name + date */}
          <div className="flex flex-col text-sm">
            {post.author && <span className="font-medium">{post.author.name}</span>}
            <time dateTime={post.publishedAt} className="text-[var(--color-muted-foreground)]">
              {formatDate(post.publishedAt, 'short')}
            </time>
          </div>
        </div>
      </div>
    </article>
  );
}
