import { ImageResponse } from 'next/og';
import { logger } from '@/lib/monitoring/logger';
import { sanityFetch } from '@/sanity/lib/client';
import { postBySlugQuery } from '@/sanity/lib/queries';
import type { Post } from '@/types/sanity';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: Props) {
  const { slug } = await params;

  // Skip in CI with dummy credentials
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!projectId || projectId === 'dummy-project-id') {
    // Return default image for CI
    return new ImageResponse(
      <div
        style={{
          fontSize: 64,
          background: 'linear-gradient(to bottom right, #1e40af, #7c3aed)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          padding: '40px',
        }}
      >
        <div style={{ fontSize: 48 }}>Blog Post</div>
      </div>,
      { ...size }
    );
  }

  // Fetch post
  let post: Post | null = null;
  try {
    post = await sanityFetch<Post>({
      query: postBySlugQuery,
      params: { slug },
      tags: [`post:${slug}`],
    });
  } catch (error) {
    logger.warn('Failed to fetch post for OG image', {
      service: 'og-image',
      slug,
      error: (error as Error).message,
    });
  }

  const title = post?.title || 'Blog Post';
  const categories = post?.categories?.map((cat) => cat.title).join(', ') || '';

  return new ImageResponse(
    <div
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '80px',
      }}
    >
      {/* Categories */}
      {categories && (
        <div
          style={{
            fontSize: 24,
            color: 'rgba(255, 255, 255, 0.8)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: 600,
          }}
        >
          {categories}
        </div>
      )}

      {/* Title */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 'bold',
          color: 'white',
          lineHeight: 1.2,
          textAlign: 'left',
          maxWidth: '100%',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {title}
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <div
          style={{
            fontSize: 32,
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: 600,
          }}
        >
          Javier Zader
        </div>
        <div
          style={{
            fontSize: 28,
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          javierzader.dev
        </div>
      </div>
    </div>,
    { ...size }
  );
}
