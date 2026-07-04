import { ImageResponse } from 'next/og';
import { SITE_URL } from '@/lib/config/site-config';
import { mergeLocalAndSanityProjects } from '@/lib/data/projects';
import { logger } from '@/lib/monitoring/logger';
import { convertSanityProject } from '@/lib/utils/project';
import { sanityFetch } from '@/sanity/lib/client';
import { projectsQuery } from '@/sanity/lib/queries';
import type { Project as SanityProject } from '@/types/sanity';

// Bare domain (no protocol) for display in the OG card footer.
const SITE_DOMAIN = SITE_URL.replace(/^https?:\/\//, '');

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Image({ params }: Props) {
  const { id } = await params;

  // Resolve the project title + stack from the curated/Sanity set.
  // GitHub-only projects fall back to a generic title — they're rarely the
  // ones shared on social, and fetching GitHub at image-gen time is wasteful.
  let title = 'Proyecto';
  let tech: string[] = [];
  try {
    const sanityProjects = await sanityFetch<SanityProject[]>({
      query: projectsQuery,
      tags: ['project'],
    });
    const project = mergeLocalAndSanityProjects(sanityProjects)
      .map((p) => convertSanityProject(p))
      .find((p) => p.id === id);
    if (project) {
      title = project.title;
      tech = project.tech ?? [];
    }
  } catch (error) {
    logger.warn('Failed to fetch project for OG image', {
      service: 'og-image',
      id,
      error: (error as Error).message,
    });
  }

  const techLine = tech.slice(0, 4).join('  •  ');

  return new ImageResponse(
    <div
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '80px',
      }}
    >
      {/* Label */}
      <div
        style={{
          fontSize: 24,
          color: 'rgba(255, 255, 255, 0.7)',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          fontWeight: 600,
        }}
      >
        Proyecto
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 76,
          fontWeight: 'bold',
          color: 'white',
          lineHeight: 1.15,
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
          flexDirection: 'column',
          gap: '20px',
          width: '100%',
        }}
      >
        {techLine && (
          <div
            style={{
              fontSize: 28,
              color: 'rgba(125, 211, 252, 0.95)',
              fontWeight: 600,
            }}
          >
            {techLine}
          </div>
        )}
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
            {SITE_DOMAIN}
          </div>
        </div>
      </div>
    </div>,
    { ...size }
  );
}
