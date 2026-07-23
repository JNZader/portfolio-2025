import { render as rtlRender, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@/__tests__/test-utils';
import ErrorPage from '@/app/[locale]/error';
import { PostCard } from '@/components/blog/PostCard';
import { PostHeader } from '@/components/blog/PostHeader';
import { TableOfContents } from '@/components/blog/TableOfContents';
import messagesEn from '@/messages/en.json';
import messagesEs from '@/messages/es.json';
import type { Post } from '@/types/sanity';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'testproject';
  process.env.NEXT_PUBLIC_SANITY_DATASET = 'test';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
});

vi.mock('@/i18n/navigation', () => ({
  Link: ({
    children,
    href,
    ...props
  }: { children: ReactNode; href: string } & Record<string, unknown>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('@/lib/analytics/errors', () => ({
  trackError: () => undefined,
}));

vi.mock('@/sanity/lib/client', () => ({
  sanityFetch: async ({ params }: { params?: unknown }) =>
    params ? { posts: [basePost], total: 1 } : [],
}));

function namespaceT(ns: string, messages: Record<string, Record<string, string>>) {
  const msgs = messages[ns] ?? {};
  const t = (key: string, values?: Record<string, unknown>) => {
    let msg = msgs[key] ?? key;
    if (values) {
      for (const [k, v] of Object.entries(values)) {
        msg = msg.replaceAll(`{${k}}`, String(v));
      }
    }
    return msg;
  };
  t.rich = (key: string) => (msgs[key] ?? key).replace(/<\/?b>/g, '');
  return t;
}

vi.mock('next-intl/server', () => ({
  setRequestLocale: () => {},
  getLocale: async () => 'es',
  getTranslations: async (ns: string) =>
    namespaceT(ns, messagesEs as unknown as Record<string, Record<string, string>>),
}));

const basePost = {
  _id: 'post-1',
  title: 'Post de prueba',
  slug: { current: 'post-de-prueba' },
  excerpt: 'Extracto de prueba',
  mainImage: undefined,
  categories: [],
  publishedAt: '2026-01-15T00:00:00Z',
  featured: false,
} as unknown as Post;

const postWithImage = {
  ...basePost,
  mainImage: {
    _type: 'image',
    asset: { _type: 'reference', _ref: 'image-abc123-1600x900-jpg' },
    alt: 'Portada',
  },
} as unknown as Post;

function renderEn(ui: React.ReactElement) {
  return rtlRender(
    <NextIntlClientProvider locale="en" messages={messagesEn}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe('batch 1: PostHeader contrast without mainImage', () => {
  it('uses foreground text and a gradient backdrop when the post has no image', () => {
    const { container } = render(<PostHeader post={basePost} />);

    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveClass('text-foreground');
    expect(title).not.toHaveClass('text-white');

    const heroContainer = container.querySelector('header')?.firstElementChild;
    expect(heroContainer).toHaveClass('bg-gradient-to-br');
    expect(heroContainer).toHaveClass('from-primary/10');
    expect(heroContainer).toHaveClass('to-tertiary/10');
    expect(heroContainer).not.toHaveClass('bg-muted');
  });

  it('keeps white text over the image when the post has one', () => {
    render(<PostHeader post={postWithImage} />);

    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveClass('text-white');
    expect(title).not.toHaveClass('text-foreground');
  });
});

describe('batch 1: PostCard featured badge is translated', () => {
  const featuredPost = { ...basePost, featured: true } as Post;

  it('renders the translated badge with a Star icon and no emoji in ES', () => {
    const { container } = render(<PostCard post={featuredPost} />);

    expect(screen.getByText('Destacado')).toBeInTheDocument();
    expect(container.querySelector('svg.lucide-star')).not.toBeNull();
    expect(screen.queryByText(/⭐/)).not.toBeInTheDocument();
  });

  it('renders the badge in English under the EN locale', () => {
    renderEn(<PostCard post={featuredPost} />);

    expect(screen.getByText('Featured')).toBeInTheDocument();
    expect(screen.queryByText(/Destacado/)).not.toBeInTheDocument();
  });
});

describe('batch 1: TableOfContents heading is translated', () => {
  const items = [{ id: 'intro', text: 'Intro', level: 2 as const }];

  it('renders the ES heading', () => {
    render(<TableOfContents items={items} />);
    expect(screen.getByText('Contenido')).toBeInTheDocument();
  });

  it('renders the EN heading instead of the Spanish literal', () => {
    renderEn(<TableOfContents items={items} />);
    expect(screen.getByText('Contents')).toBeInTheDocument();
    expect(screen.queryByText('Contenido')).not.toBeInTheDocument();
  });
});

describe('batch 1: newsletter page drops invented metrics', () => {
  it('renders only the real frequency stat', async () => {
    const { default: NewsletterPage } = await import('@/app/[locale]/(pages)/newsletter/page');
    render(await NewsletterPage({ params: Promise.resolve({ locale: 'es' }) }));

    expect(screen.getByText('Semanal')).toBeInTheDocument();
    expect(screen.queryByText('1,234+')).not.toBeInTheDocument();
    expect(screen.queryByText('42%')).not.toBeInTheDocument();
  });
});

describe('batch 1: legal pages use InteriorHero without nested containers', () => {
  it('privacy renders InteriorHero and a single container layer', async () => {
    const { default: PrivacyPage } = await import('@/app/[locale]/(pages)/privacy/page');
    const { container } = render(
      await PrivacyPage({ params: Promise.resolve({ locale: 'es' }) })
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Política de Privacidad' })
    ).toBeInTheDocument();
    expect(container.querySelectorAll('.max-w-7xl .max-w-7xl')).toHaveLength(0);
  });

  it('data-request renders InteriorHero and a single container layer', async () => {
    const { default: DataRequestPage } = await import(
      '@/app/[locale]/(pages)/data-request/page'
    );
    const { container } = render(
      await DataRequestPage({ params: Promise.resolve({ locale: 'es' }) })
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Solicitud de Datos' })
    ).toBeInTheDocument();
    expect(container.querySelectorAll('.max-w-7xl .max-w-7xl')).toHaveLength(0);
  });
});

describe('batch 1: blog listing has no dead gap between filters and grid', () => {
  it('renders filters and grid inside one adjacent section', async () => {
    const { default: BlogPage } = await import('@/app/[locale]/(pages)/blog/page');
    const { container } = render(
      await BlogPage({
        params: Promise.resolve({ locale: 'es' }),
        searchParams: Promise.resolve({}),
      })
    );

    // InteriorHero section + a single content section (filters + grid together)
    const sections = container.querySelectorAll('section');
    expect(sections).toHaveLength(2);

    const content = sections[1];
    expect(content.querySelector('input')).not.toBeNull();
    expect(content.querySelector('article')).not.toBeNull();
  });
});

describe('batch 1: error page uses layout-friendly sizing and error token', () => {
  it('drops min-h-screen and raw red-500 classes', () => {
    const { container } = render(<ErrorPage error={new Error('boom')} reset={() => {}} />);

    const wrapper = container.firstElementChild;
    expect(wrapper).not.toHaveClass('min-h-screen');
    expect(wrapper).toHaveClass('min-h-[50vh]');
    expect(container.querySelector('.text-red-500')).toBeNull();
    expect(container.querySelector('.bg-red-500\\/10')).toBeNull();
    expect(container.querySelector('svg')).toHaveClass('text-error');
  });
});
