import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@/__tests__/test-utils';
import userEvent from '@testing-library/user-event';
import { BlogFilters } from '@/components/blog/BlogFilters';
import type { Category } from '@/types/sanity';

// Selected state comes from the URL — simulate an active category filter.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/blog',
  useSearchParams: () => new URLSearchParams('category=tech'),
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));

const CATEGORIES = [
  { _id: 'c1', title: 'Tech', slug: { current: 'tech' }, postCount: 2 },
  { _id: 'c2', title: 'Life', slug: { current: 'life' }, postCount: 1 },
] as unknown as Category[];

/**
 * Batch 6 — blog category chips share the projects filter style: a bare check
 * marks the selected toggle, no filled-vs-outline ambiguity.
 */
describe('blog category chips', () => {
  it('the active category chip shows a bare check and pressed state', async () => {
    const user = userEvent.setup();
    render(<BlogFilters categories={CATEGORIES} totalPosts={3} />);

    await user.click(screen.getByRole('button', { name: /filtros/i }));

    const tech = screen.getByRole('button', { name: /Tech/ });
    expect(tech).toHaveAttribute('aria-pressed', 'true');
    expect(within(tech).getByTestId('filter-check')).toBeInTheDocument();
    expect(tech.querySelector('.lucide-x')).not.toBeInTheDocument();

    const life = screen.getByRole('button', { name: /Life/ });
    expect(life).toHaveAttribute('aria-pressed', 'false');
    expect(within(life).queryByTestId('filter-check')).not.toBeInTheDocument();
  });
});
