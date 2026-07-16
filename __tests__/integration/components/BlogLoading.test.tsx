import { render, screen } from '@testing-library/react';
import BlogLoading from '@/app/[locale]/(pages)/blog/loading';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const LOADING_SOURCE = readFileSync(
  resolve(process.cwd(), 'app/[locale]/(pages)/blog/loading.tsx'),
  'utf8',
);
const BLOG_E2E_SOURCE = readFileSync(resolve(process.cwd(), 'e2e/tests/blog.spec.ts'), 'utf8');

describe('BlogLoading static contract', () => {
  it('exposes one named busy status and decorative loading regions', () => {
    render(<BlogLoading />);

    const statuses = screen.getAllByRole('status');
    expect(statuses).toHaveLength(1);
    expect(statuses[0]).toHaveAttribute('aria-busy', 'true');
    expect(statuses[0]).toHaveAttribute('aria-label', 'Loading blog page');

    expect(screen.getByTestId('blog-loading-hero')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('blog-loading-filters')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('blog-loading-cards')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(statuses[0].querySelector('[aria-live], [role="status"]')).toBeNull();
  });

  it('models the hero and initial filter geometry without category placeholders', () => {
    render(<BlogLoading />);

    const hero = screen.getByTestId('blog-loading-hero');
    expect(hero).toHaveClass('md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]');
    expect(hero.parentElement?.parentElement).toHaveClass('border-b', 'py-16', 'md:py-24');
    expect(screen.getByTestId('blog-loading-hero-content')).toBeInTheDocument();
    expect(screen.getByTestId('blog-loading-hero-motif')).toBeInTheDocument();
    expect(screen.getByTestId('blog-loading-hero-accent')).toBeInTheDocument();
    expect(screen.getByTestId('blog-loading-hero-title')).toBeInTheDocument();
    expect(screen.getByTestId('blog-loading-hero-description')).toBeInTheDocument();

    expect(screen.getAllByTestId('blog-loading-search')).toHaveLength(1);
    expect(screen.getAllByTestId('blog-loading-filter-control')).toHaveLength(1);
    expect(screen.getAllByTestId('blog-loading-result-count')).toHaveLength(1);
    expect(screen.getByTestId('blog-loading-filter-control')).toHaveAttribute(
      'data-region',
      'control',
    );
    expect(document.querySelector('[data-region="filter-control"]')).toBeNull();
    expect(screen.getByTestId('blog-loading-filters')).toHaveAttribute('data-region', 'filter');
    expect(document.querySelector('[data-region="filters"]')).toBeNull();
    expect(screen.getByTestId('blog-loading-filters').firstElementChild).toHaveClass(
      'flex',
      'flex-col',
      'sm:flex-row',
    );
    expect(screen.queryByTestId('blog-loading-category')).not.toBeInTheDocument();
    expect(document.querySelector('[data-category], [data-region*="category"]')).toBeNull();
  });

  it('keeps six cards with explicit image, content, and author regions', () => {
    render(<BlogLoading />);

    expect(screen.getByTestId('blog-loading-cards')).toHaveClass(
      'grid',
      'sm:grid-cols-2',
      'lg:grid-cols-3',
    );
    const cards = screen.getAllByTestId('blog-loading-card');
    expect(cards).toHaveLength(6);
    for (const card of cards) {
      expect(card.querySelector('[data-region="card-image"]')).not.toBeNull();
      expect(card.querySelector('[data-region="card-content"]')).not.toBeNull();
      expect(card.querySelector('[data-region="card-author"]')).not.toBeNull();
    }
  });

  it('does not expose interactive or focusable placeholder descendants', () => {
    render(<BlogLoading />);

    const status = screen.getByRole('status');
    expect(status.querySelector('a, button, input, select, textarea, form, [tabindex]')).toBeNull();
  });

  it('has no Sanity, CMS, or data-fetching dependency', () => {
    expect(LOADING_SOURCE).not.toMatch(/@sanity|next-sanity|sanity|cms/i);
    expect(LOADING_SOURCE).not.toMatch(/\bfetch\s*\(|process\.env/);
  });

  it('keeps runtime blocks typed and geometry checks region-scoped', () => {
    expect(BLOG_E2E_SOURCE).toContain('preflightSanityEnvironment');
    expect(BLOG_E2E_SOURCE).toContain('Sanity representative fetch failed: network or timeout error');
    expect(BLOG_E2E_SOURCE).toContain('clippedByAncestor');
    expect(BLOG_E2E_SOURCE).toContain('hasOwnOverflow');
    expect(BLOG_E2E_SOURCE).toContain("element.classList.contains('max-w-7xl')");
  });
});
