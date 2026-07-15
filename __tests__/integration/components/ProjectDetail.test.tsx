import { render, screen } from '@/__tests__/test-utils';
import { ProjectDetail } from '@/components/projects/ProjectDetail';
import { apigen } from '@/lib/data/case-studies/apigen';
import type { Project } from '@/lib/github/types';
import messages from '@/messages/es.json';
import { createTranslator } from 'use-intl';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/blog/PortableTextRenderer', () => ({ PortableTextRenderer: () => null }));
vi.mock('@/components/markdown/MarkdownContent', () => ({ MarkdownContent: () => null }));
vi.mock('@/components/seo/Breadcrumbs', () => ({ Breadcrumbs: () => null }));
vi.mock('@/components/seo/JsonLd', () => ({ JsonLd: () => null }));
vi.mock('@/components/ui/Container', () => ({ default: ({ children }: { children: ReactNode }) => <div>{children}</div> }));
vi.mock('@/components/ui/Section', () => ({ default: ({ children }: { children: ReactNode }) => <section>{children}</section> }));
vi.mock('@/components/ui/badge', () => ({ Badge: ({ children }: { children: ReactNode }) => <span>{children}</span> }));
vi.mock('@/components/ui/button', () => ({
  Button: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: { children: ReactNode; href: string }) => <a href={href} {...props}>{children}</a>,
}));
vi.mock('next/image', () => ({ default: () => null }));
vi.mock('@/lib/utils/tech-icons', () => ({ getTechIcon: () => ({ icon: () => null, color: '' }) }));

describe('ProjectDetail GitHub safety contract', () => {
  it('keeps the named APiGen GitHub link safe for a new tab', () => {
    const project: Project = {
      id: apigen._id,
      title: apigen.title,
      description: apigen.excerpt,
      url: apigen.githubUrl ?? '#',
      github: apigen.githubUrl,
      tech: apigen.technologies ?? [],
      source: 'sanity',
      featured: apigen.featured,
      repoIsOrigin: apigen.repoIsOrigin,
      publishedAt: apigen.publishedAt,
      body: apigen.body,
    };
    const t = createTranslator<Record<string, any>, string>({ locale: 'es', messages, namespace: 'ProjectDetail' });
    const tMarkdown = createTranslator<Record<string, any>, string>({ locale: 'es', messages, namespace: 'MarkdownContent' });

    render(
      <ProjectDetail
        project={project}
        locale="es"
        t={t}
        tMarkdown={tMarkdown}
        body={project.body}
        readme={null}
        repoInfo={undefined}
        hasLinks
        projectSchema={{} as never}
        breadcrumbSchema={{} as never}
      />
    );

    const link = screen.getByRole('link', { name: /^Repositorio de origen$/ });
    expect(link).toHaveAttribute('href', project.github);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
