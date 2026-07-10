import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/__tests__/test-utils';
import ProjectCard from '@/components/projects/ProjectCard';
import type { Project } from '@/lib/github/types';

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const PROJECT: Project = {
  id: 'api-platform',
  title: 'API Platform',
  description: 'Backend platform with a documented delivery pipeline.',
  url: '/proyectos/api-platform',
  github: 'https://github.com/example/api-platform',
  demo: 'https://example.com/api-platform',
  tech: ['TypeScript', 'PostgreSQL', 'Docker'],
  source: 'sanity',
};

describe('project card visual UX', () => {
  it('renders a deterministic project visual with real project data when no image exists', () => {
    const { container } = render(<ProjectCard project={PROJECT} />);

    expect(screen.queryByText('Sin imagen')).not.toBeInTheDocument();
    expect(container.querySelector('[data-project-visual]')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /repositorio de API Platform/i })).toHaveClass('size-11');
    expect(screen.getByRole('link', { name: /demo de API Platform/i })).toHaveClass('size-11');
  });
});
