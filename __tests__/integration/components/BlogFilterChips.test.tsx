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

const pushMock = vi.fn();

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn(), refresh: vi.fn() }),
}));

const CATEGORIES = [
  { _id: 'c1', title: 'Tech', slug: { current: 'tech' }, postCount: 2 },
  { _id: 'c2', title: 'Life', slug: { current: 'life' }, postCount: 1 },
] as unknown as Category[];

/**
 * Proyectos filters redesign — blog parity: category chips adopt the shared
 * FilterChip (checkbox semantics, bare check when selected, 44px target)
 * while the blog toggle panel, URL contract and behavior stay unchanged.
 */
describe('blog category chips', () => {
  it('chips expose checkbox semantics with a bare check on the active category', async () => {
    const user = userEvent.setup();
    render(<BlogFilters categories={CATEGORIES} totalPosts={3} />);

    await user.click(screen.getByRole('button', { name: /filtros/i }));

    const tech = screen.getByRole('checkbox', { name: /Tech/ });
    expect(tech).toHaveAttribute('aria-checked', 'true');
    expect(within(tech).getByTestId('filter-check')).toBeInTheDocument();
    expect(tech.querySelector('.lucide-x')).not.toBeInTheDocument();
    expect(tech.className).toContain('min-h-11');
    expect(tech.className).toContain('min-w-11');

    const life = screen.getByRole('checkbox', { name: /Life/ });
    expect(life).toHaveAttribute('aria-checked', 'false');
    expect(within(life).queryByTestId('filter-check')).not.toBeInTheDocument();

    const all = screen.getByRole('checkbox', { name: /todas/i });
    expect(all).toHaveAttribute('aria-checked', 'false');
    expect(within(all).queryByTestId('filter-check')).not.toBeInTheDocument();
  });

  it('unselected chips use the de-grayed foreground treatment', async () => {
    const user = userEvent.setup();
    render(<BlogFilters categories={CATEGORIES} totalPosts={3} />);

    await user.click(screen.getByRole('button', { name: /filtros/i }));

    const life = screen.getByRole('checkbox', { name: /Life/ });
    expect(life.className).toContain('text-foreground/80');
    expect(life.className).not.toContain('text-muted-foreground');
  });

  it('selecting a category keeps the existing URL contract', async () => {
    const user = userEvent.setup();
    pushMock.mockClear();
    render(<BlogFilters categories={CATEGORIES} totalPosts={3} />);

    await user.click(screen.getByRole('button', { name: /filtros/i }));
    await user.click(screen.getByRole('checkbox', { name: /Life/ }));

    expect(pushMock).toHaveBeenCalledWith('/blog?category=life');
  });

  it('resetting to Todas clears the category param', async () => {
    const user = userEvent.setup();
    pushMock.mockClear();
    render(<BlogFilters categories={CATEGORIES} totalPosts={3} />);

    await user.click(screen.getByRole('button', { name: /filtros/i }));
    await user.click(screen.getByRole('checkbox', { name: /todas/i }));

    expect(pushMock).toHaveBeenCalledWith('/blog');
  });
});
