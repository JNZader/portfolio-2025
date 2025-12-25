import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils/format';
import { getImageBlurUrl, getImageUrl } from '@/sanity/lib/image';
import type { Post } from '@/types/sanity';

interface PostHeaderProps {
  post: Post;
}

export function PostHeader({ post }: Readonly<PostHeaderProps>) {
  const imageUrl = getImageUrl(post.mainImage, 1600, 900);
  const blurUrl = getImageBlurUrl(post.mainImage);

  return (
    <header className="relative">
      {/* Hero Image Container */}
      <div className="relative w-full aspect-[16/9] max-h-[600px] overflow-hidden bg-muted">
        {imageUrl && (
          <>
            {/* Image */}
            <Image
              src={imageUrl}
              alt={post.mainImage.alt || post.title}
              fill
              className="object-cover"
              priority
              placeholder={blurUrl ? 'blur' : 'empty'}
              blurDataURL={blurUrl}
              sizes="100vw"
            />

            {/* FIXED: Overlay mejorado con mejor cobertura */}
            {/* Base darkening layer - cubre TODA la imagen */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30" />

            {/* Additional gradient for extra text protection at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black via-black/70 to-transparent" />
          </>
        )}

        {/* Title overlay - positioned at bottom */}
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-12 z-10">
          <div className="mx-auto max-w-4xl">
            {/* Categories */}
            <div className="mb-4 flex flex-wrap gap-2">
              {post.categories.map((category) => (
                <Link key={category._id} href={`/blog?category=${category.slug.current}`}>
                  <Badge
                    variant="default"
                    className="shadow-lg"
                    style={{
                      backgroundColor: category.color ?? 'var(--color-primary)',
                      color: 'white',
                    }}
                  >
                    {category.title}
                  </Badge>
                </Link>
              ))}
            </div>

            {/* Title - ALWAYS white for maximum contrast */}
            <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl lg:text-6xl drop-shadow-lg">
              {post.title}
            </h1>

            {/* Meta - ALWAYS white/light for maximum contrast */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/95">
              {post.author && (
                <div className="flex items-center gap-2">
                  {post.author.image && (
                    <div className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-white/30">
                      <Image
                        src={getImageUrl(post.author.image, 32, 32)}
                        alt={post.author.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <span className="font-medium drop-shadow">{post.author.name}</span>
                </div>
              )}

              <span className="text-white/70">•</span>

              <time dateTime={post.publishedAt} className="drop-shadow">
                {formatDate(post.publishedAt, 'long')}
              </time>

              {post.readingTime && (
                <>
                  <span className="text-white/70">•</span>
                  <span className="drop-shadow">{post.readingTime} min lectura</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Excerpt - con mejor contraste */}
      {post.excerpt && (
        <div className="border-b border-border bg-muted/80 backdrop-blur-sm py-8">
          <div className="mx-auto max-w-4xl px-6">
            <p className="text-xl leading-relaxed text-foreground">{post.excerpt}</p>
          </div>
        </div>
      )}
    </header>
  );
}
