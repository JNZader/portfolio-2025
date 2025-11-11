import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils/format';
import { getImageBlurUrl, getImageUrl } from '@/sanity/lib/image';
import type { Post } from '@/types/sanity';

interface PostHeaderProps {
  post: Post;
}

export function PostHeader({ post }: PostHeaderProps) {
  const imageUrl = getImageUrl(post.mainImage, 1600, 900);
  const blurUrl = getImageBlurUrl(post.mainImage);

  return (
    <header className="relative">
      {/* Hero Image */}
      <div className="relative aspect-[16/9] max-h-[600px] overflow-hidden bg-[var(--color-muted)]">
        {imageUrl && (
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
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="mx-auto max-w-4xl">
            {/* Categories */}
            <div className="mb-4 flex flex-wrap gap-2">
              {post.categories.map((category) => (
                <Link key={category._id} href={`/blog?category=${category.slug.current}`}>
                  <Badge
                    variant="default"
                    style={{
                      backgroundColor: category.color || 'var(--color-primary)',
                    }}
                  >
                    {category.title}
                  </Badge>
                </Link>
              ))}
            </div>

            {/* Title */}
            <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
              {post.author && (
                <div className="flex items-center gap-2">
                  {post.author.image && (
                    <div className="relative h-8 w-8 overflow-hidden rounded-full">
                      <Image
                        src={getImageUrl(post.author.image, 32, 32)}
                        alt={post.author.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <span className="font-medium">{post.author.name}</span>
                </div>
              )}

              <span>•</span>

              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, 'long')}</time>

              {post.readingTime && (
                <>
                  <span>•</span>
                  <span>{post.readingTime} min lectura</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Excerpt */}
      {post.excerpt && (
        <div className="border-b bg-[var(--color-muted)] py-8">
          <div className="mx-auto max-w-4xl px-6">
            <p className="text-xl leading-relaxed text-[var(--color-muted-foreground)]">
              {post.excerpt}
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
