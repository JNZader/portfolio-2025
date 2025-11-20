'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { getPrimaryCategory } from '@/lib/utils/blog';
import { formatDate } from '@/lib/utils/format';
import { highlightSearchTerm } from '@/lib/utils/search';
import { getImageBlurUrl, getImageUrl } from '@/sanity/lib/image';
import type { Post } from '@/types/sanity';

interface PostCardProps {
  post: Post;
  priority?: boolean;
}

export function PostCard({ post, priority = false }: PostCardProps) {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || '';

  const imageUrl = getImageUrl(post.mainImage, 800, 450);
  const blurUrl = getImageBlurUrl(post.mainImage);
  const primaryCategory = getPrimaryCategory(post);

  // Highlight para título y excerpt
  const titleParts = highlightSearchTerm(post.title, searchTerm);
  const excerptParts = highlightSearchTerm(post.excerpt, searchTerm);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border bg-background transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-primary/20">
      {/* Image */}
      <Link
        href={`/blog/${post.slug.current}`}
        className="relative aspect-[16/9] overflow-hidden bg-muted"
        aria-label={post.title}
      >
        {imageUrl && (
          <>
            <Image
              src={imageUrl}
              alt={post.mainImage.alt || post.title}
              fill
              className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={priority}
              placeholder={blurUrl ? 'blur' : 'empty'}
              blurDataURL={blurUrl}
            />
            {/* Gradient overlay for better badge contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
          </>
        )}

        {/* Featured badge */}
        {post.featured && (
          <div className="absolute left-4 top-4 animate-scale-in">
            <Badge
              variant="default"
              className="bg-gradient-to-r from-primary to-primary-600 border-0 shadow-lg shadow-primary/30"
            >
              ⭐ Destacado
            </Badge>
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
            <span className="text-muted-foreground">{post.readingTime} min lectura</span>
          )}
        </div>

        {/* Title con highlight */}
        <h3 className="mb-2 line-clamp-2 text-xl font-semibold">
          <Link
            href={`/blog/${post.slug.current}`}
            className="hover:text-primary transition-colors"
          >
            <HighlightedText parts={titleParts} />
          </Link>
        </h3>

        {/* Excerpt con highlight */}
        <p className="mb-4 line-clamp-3 text-muted-foreground">
          <HighlightedText parts={excerptParts} />
        </p>

        {/* Footer */}
        <div className="mt-auto flex items-center gap-3 pt-4 border-t">
          {/* Author avatar */}
          {post.author?.image && (
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted">
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
            <time dateTime={post.publishedAt} className="text-muted-foreground">
              {formatDate(post.publishedAt, 'short')}
            </time>
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * Componente auxiliar para texto con highlight
 */
function HighlightedText({ parts }: { parts: { text: string; highlight: boolean }[] }) {
  return (
    <>
      {parts.map((part, index) =>
        part.highlight ? (
          <mark
            key={`highlight-${index}-${part.text.substring(0, 10)}`}
            className="bg-warning/30 text-foreground font-semibold rounded px-1"
          >
            {part.text}
          </mark>
        ) : (
          <span key={`text-${index}-${part.text.substring(0, 10)}`}>{part.text}</span>
        )
      )}
    </>
  );
}
