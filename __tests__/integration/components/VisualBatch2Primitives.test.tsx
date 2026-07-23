import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, fireEvent, render, screen } from '@/__tests__/test-utils';
import { type AnchorHTMLAttributes, type ReactNode, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// --- Mocks -----------------------------------------------------------------

vi.mock('@/i18n/navigation', () => ({
  Link: ({
    children,
    href,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/sanity/lib/image', () => ({
  getImageUrl: (source: unknown) => (source ? 'https://img.example/cover.jpg' : ''),
  getImageBlurUrl: () => '',
}));

vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock('@/lib/analytics/consent', () => ({
  setDefaultGAConsent: vi.fn(),
  updateGAConsent: vi.fn(),
}));

// --- Imports after mocks ----------------------------------------------------

import Cookies from 'js-cookie';
import PostLoading from '@/app/[locale]/(pages)/blog/[slug]/loading';
import BlogLoading from '@/app/[locale]/(pages)/blog/loading';
import { Pagination } from '@/components/blog/Pagination';
import { PostCard } from '@/components/blog/PostCard';
import { CookieConsent } from '@/components/gdpr/CookieConsent';
import { NewsletterSkeleton } from '@/components/newsletter/NewsletterSkeleton';
import { Modal } from '@/components/ui/Modal';
import { SearchInput } from '@/components/ui/SearchInput';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Post } from '@/types/sanity';

const mockCookieGet = Cookies.get as unknown as ReturnType<typeof vi.fn>;

const readSource = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

const BLOG_LOADING_SOURCE = readSource('app/[locale]/(pages)/blog/loading.tsx');
const POST_LOADING_SOURCE = readSource('app/[locale]/(pages)/blog/[slug]/loading.tsx');
const PROYECTOS_SOURCE = readSource('app/[locale]/(pages)/proyectos/page.tsx');
const PROJECTS_CLIENT_SOURCE = readSource('components/projects/ProjectsClient.tsx');
const NEWSLETTER_SKELETON_SOURCE = readSource('components/newsletter/NewsletterSkeleton.tsx');

// --- 1. Shared Skeleton primitive -------------------------------------------

describe('Skeleton primitive', () => {
  it('renders the base skeleton classes and merges custom classes', () => {
    render(<Skeleton data-testid="sk" className="h-4 w-1/2" />);

    const el = screen.getByTestId('sk');
    expect(el).toHaveAttribute('data-slot', 'skeleton');
    expect(el).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted-foreground/15');
    expect(el).toHaveClass('h-4', 'w-1/2');
  });
});

describe('loading states consume the shared Skeleton', () => {
  it('blog listing loading renders shared skeletons and drops the old style', () => {
    render(<BlogLoading />);

    expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0);
    expect(BLOG_LOADING_SOURCE).toContain('@/components/ui/Skeleton');
    expect(BLOG_LOADING_SOURCE).not.toContain('bg-muted-foreground/20');
  });

  it('blog post loading renders shared skeletons and drops hardcoded palette colors', () => {
    render(<PostLoading />);

    expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0);
    expect(POST_LOADING_SOURCE).toContain('@/components/ui/Skeleton');
    expect(POST_LOADING_SOURCE).not.toContain('bg-[var(--color-gray-300)]');
  });

  it('newsletter skeleton renders shared skeletons and drops bg-muted/50 placeholders', () => {
    render(<NewsletterSkeleton />);

    expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0);
    expect(NEWSLETTER_SKELETON_SOURCE).toContain('@/components/ui/Skeleton');
    expect(NEWSLETTER_SKELETON_SOURCE).not.toContain('bg-muted/50 rounded');
  });
});

// --- 3. Proyectos skeleton grid matches the real grid ------------------------

describe('proyectos suspense fallback grid', () => {
  it('uses the same grid classes as the real ProjectsClient grid', () => {
    const realGrid = PROJECTS_CLIENT_SOURCE.match(/className="(grid gap-\d+ [^"]*grid-cols-3)"/);
    expect(realGrid).not.toBeNull();

    const fallbackGrid = realGrid?.[1] ?? '';
    expect(PROYECTOS_SOURCE).toContain(fallbackGrid);
    expect(PROYECTOS_SOURCE).toContain('gap-8');
    expect(PROYECTOS_SOURCE).not.toContain('gap-6');
  });

  it('builds fallback cards with the shared Skeleton instead of a plain box', () => {
    expect(PROYECTOS_SOURCE).toContain('@/components/ui/Skeleton');
    expect(PROYECTOS_SOURCE).not.toContain('bg-card h-[420px]');
  });
});

// --- 2. Shared SearchInput ---------------------------------------------------

describe('SearchInput', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    placeholder: 'Buscar artículos…',
    ariaLabel: 'Buscar artículos',
    clearAriaLabel: 'Limpiar búsqueda',
  };

  it('renders an accessible input with placeholder and label', () => {
    render(<SearchInput {...defaultProps} />);

    const input = screen.getByRole('searchbox', { name: 'Buscar artículos' });
    expect(input).toHaveAttribute('placeholder', 'Buscar artículos…');
  });

  it('calls onChange immediately on typing', () => {
    const onChange = vi.fn();
    render(<SearchInput {...defaultProps} onChange={onChange} />);

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'a11y' } });
    expect(onChange).toHaveBeenCalledWith('a11y');
  });

  it('debounces onDebouncedChange', () => {
    const onDebouncedChange = vi.fn();

    function Harness() {
      const [value, setValue] = useState('');
      return (
        <SearchInput
          {...defaultProps}
          value={value}
          onChange={setValue}
          onDebouncedChange={onDebouncedChange}
        />
      );
    }
    render(<Harness />);

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'react' } });
    expect(onDebouncedChange).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(onDebouncedChange).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onDebouncedChange).toHaveBeenCalledWith('react');
  });

  it('shows a 44px clear button with accessible label that clears the value', () => {
    const onChange = vi.fn();
    render(<SearchInput {...defaultProps} value="react" onChange={onChange} />);

    const clear = screen.getByRole('button', { name: 'Limpiar búsqueda' });
    expect(clear).toHaveClass('size-11');

    fireEvent.click(clear);
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('hides the clear button when the value is empty', () => {
    render(<SearchInput {...defaultProps} value="" />);

    expect(screen.queryByRole('button', { name: 'Limpiar búsqueda' })).not.toBeInTheDocument();
  });
});

// --- 4. PostCard visual fallback ---------------------------------------------

const BASE_POST = {
  _id: 'post-1',
  title: 'Guía de accesibilidad',
  slug: { current: 'guia-accesibilidad' },
  excerpt: 'Una guía práctica sobre accesibilidad web.',
  categories: [],
  publishedAt: '2026-01-15T00:00:00.000Z',
  featured: false,
} as const;

describe('PostCard visual fallback', () => {
  it('renders a themed visual fallback inside the 16:9 link when there is no mainImage', () => {
    const post = { ...BASE_POST, mainImage: undefined } as unknown as Post;
    const { container } = render(<PostCard post={post} />);

    const fallback = container.querySelector('[data-post-visual]');
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveAttribute('aria-hidden', 'true');
    expect(fallback).toHaveClass('bg-gradient-to-br');

    const imageLink = screen
      .getAllByRole('link', { name: BASE_POST.title })
      .find((link) => link.contains(fallback));
    expect(imageLink).toBeDefined();
    expect(imageLink).toHaveClass('aspect-[16/9]');
  });

  it('renders the real image instead of the fallback when mainImage exists', () => {
    const post = {
      ...BASE_POST,
      mainImage: { alt: 'Portada', asset: { _ref: 'image-abc' } },
    } as unknown as Post;
    const { container } = render(<PostCard post={post} />);

    expect(container.querySelector('[data-post-visual]')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Portada' })).toBeInTheDocument();
  });
});

// --- 5. Minimum 44px touch targets -------------------------------------------

describe('minimum 44px touch targets', () => {
  it('modal close button is at least 44x44', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        Contenido
      </Modal>
    );

    expect(screen.getByRole('button', { name: 'Cerrar modal' })).toHaveClass('size-11');
  });

  it('cookie preference switches expose a 44px hit area', async () => {
    vi.useFakeTimers();
    mockCookieGet.mockReturnValue(undefined);

    render(<CookieConsent />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Personalizar' }));

    const switches = screen.getAllByRole('switch');
    expect(switches).toHaveLength(3);
    for (const switchEl of switches) {
      expect(switchEl).toHaveClass('size-11');
    }

    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });
});

// --- 6. Pagination as links ---------------------------------------------------

describe('Pagination links', () => {
  it('renders page numbers as prefetchable links with href and 44px targets', () => {
    render(<Pagination currentPage={2} totalPages={5} />);

    const nav = screen.getByRole('navigation', { name: 'Paginación del blog' });
    const links = Array.from(nav.querySelectorAll('a[href]'));
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.getAttribute('href')).toMatch(/^\/blog\?.*page=\d+/);
    }

    for (const page of [1, 2, 3, 4, 5]) {
      const link = screen.getByRole('link', { name: `Página ${page}` });
      expect(link).toHaveAttribute('href', `/blog?page=${page}`);
      expect(link).toHaveClass('size-11');
    }
  });

  it('marks the current page with aria-current and keeps prev/next as links', () => {
    render(<Pagination currentPage={2} totalPages={5} />);

    expect(screen.getByRole('link', { name: 'Página 2' })).toHaveAttribute('aria-current', 'page');

    const prev = screen.getByRole('link', { name: 'Página anterior' });
    expect(prev).toHaveAttribute('href', '/blog?page=1');
    expect(prev).toHaveClass('h-11');

    const next = screen.getByRole('link', { name: 'Página siguiente' });
    expect(next).toHaveAttribute('href', '/blog?page=3');
    expect(next).toHaveClass('h-11');
  });

  it('does not render a previous link on the first page', () => {
    render(<Pagination currentPage={1} totalPages={5} />);

    expect(screen.queryByRole('link', { name: 'Página anterior' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Página siguiente' })).toBeInTheDocument();
  });
});
