import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render as rtlRender, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';
import { createTranslator } from 'use-intl';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@/__tests__/test-utils';
import ErrorPage from '@/app/[locale]/error';
import BlogLoading from '@/app/[locale]/(pages)/blog/loading';
import { EmptyState } from '@/components/blog/EmptyState';
import { Pagination } from '@/components/blog/Pagination';
import { PostHeader } from '@/components/blog/PostHeader';
import { ProjectDetail } from '@/components/projects/ProjectDetail';
import { InteriorHero } from '@/components/ui/InteriorHero';
import { SectionTitle } from '@/components/ui/Section';
import messagesEn from '@/messages/en.json';
import messagesEs from '@/messages/es.json';
import type { Post } from '@/types/sanity';

// --- Mocks -------------------------------------------------------------------

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'testproject';
  process.env.NEXT_PUBLIC_SANITY_DATASET = 'test';
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
}));

vi.mock('@/sanity/lib/image', () => ({
  getImageUrl: (source: unknown) => (source ? 'https://img.example/cover.jpg' : ''),
  getImageBlurUrl: () => '',
}));

vi.mock('@/lib/analytics/errors', () => ({
  trackError: () => undefined,
}));

vi.mock('@/components/blog/PortableTextRenderer', () => ({ PortableTextRenderer: () => null }));
vi.mock('@/components/markdown/MarkdownContent', () => ({ MarkdownContent: () => null }));
vi.mock('@/components/seo/Breadcrumbs', () => ({ Breadcrumbs: () => null }));
vi.mock('@/components/seo/JsonLd', () => ({ JsonLd: () => null }));
vi.mock('@/lib/utils/tech-icons', () => ({ getTechIcon: () => ({ icon: () => null, color: '' }) }));

// ContactForm side-effect dependencies
vi.mock('@/app/actions/contact', () => ({ sendContactEmail: vi.fn() }));
vi.mock('@/lib/validations/email-validator-client', () => ({
  quickValidateEmail: vi.fn(() => ({ isValid: true })),
}));
vi.mock('@/lib/utils/toast', () => ({ showSuccess: vi.fn(), showError: vi.fn() }));
vi.mock('@/lib/analytics/events', () => ({ trackContactSubmit: vi.fn() }));

// Server-component translations for the newsletter page (ES namespace lookup).
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

// --- Helpers -----------------------------------------------------------------

const readSource = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

const CONTACT_FORM_SOURCE = readSource('components/forms/ContactForm.tsx');
const NEWSLETTER_FORM_SOURCE = readSource('components/newsletter/NewsletterForm.tsx');
const NEWSLETTER_PAGE_SOURCE = readSource('app/[locale]/(pages)/newsletter/page.tsx');
const SECTION_DIVIDER_SOURCE = readSource('components/ui/SectionDivider.tsx');
const MODAL_SOURCE = readSource('components/ui/Modal.tsx');

const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2705}\u{2B50}]/u;

function renderEn(ui: React.ReactElement) {
  return rtlRender(
    <NextIntlClientProvider locale="en" messages={messagesEn}>
      {ui}
    </NextIntlClientProvider>
  );
}

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

// --- 1. Display font consistency ----------------------------------------------

describe('batch 3: headings use the display font like InteriorHero', () => {
  it('InteriorHero h1 keeps the display font (regression guard)', () => {
    render(<InteriorHero variant="blog" title="Blog" description="desc" />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('text-display-lg');
  });

  it('SectionTitle renders with the display font', () => {
    render(<SectionTitle>Sección</SectionTitle>);

    expect(screen.getByRole('heading', { level: 2 })).toHaveClass('text-display-lg');
  });

  it('PostHeader h1 renders with the display font', () => {
    render(<PostHeader post={basePost} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('text-display-lg');
  });

  it('ProjectDetail h1 renders with the display font', () => {
    const project = {
      id: 'p-1',
      title: 'Proyecto de prueba',
      description: 'Descripción',
      url: '#',
      tech: [],
      source: 'sanity',
      featured: false,
    } as never;
    const t = createTranslator<Record<string, any>, string>({
      locale: 'es',
      messages: messagesEs,
      namespace: 'ProjectDetail',
    });
    const tMarkdown = createTranslator<Record<string, any>, string>({
      locale: 'es',
      messages: messagesEs,
      namespace: 'MarkdownContent',
    });

    render(
      <ProjectDetail
        project={project}
        locale="es"
        t={t}
        tMarkdown={tMarkdown}
        body={undefined}
        readme={null}
        repoInfo={undefined}
        hasLinks={false}
        projectSchema={{} as never}
        breadcrumbSchema={{} as never}
      />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('text-display-lg');
  });
});

// --- 2. Arbitrary var() syntax migrated to token classes -----------------------

describe('batch 3: arbitrary var() color syntax migrated to token classes', () => {
  const migratedFiles = [
    'app/[locale]/(pages)/data-request/page.tsx',
    'app/[locale]/error.tsx',
    'components/blog/EmptyState.tsx',
    'components/blog/Pagination.tsx',
    'components/forms/ContactForm.tsx',
    'components/blog/TableOfContents.tsx',
    'app/[locale]/(pages)/newsletter/page.tsx',
  ];

  for (const file of migratedFiles) {
    it(`${file} has no [var(--color-…)] utilities`, () => {
      expect(readSource(file)).not.toContain('[var(--color-');
    });
  }
});

// --- 3. Emoji UI icons replaced with lucide ------------------------------------

describe('batch 3: emoji UI icons replaced with lucide', () => {
  it('newsletter page source has no emoji literals and imports lucide icons', () => {
    expect(NEWSLETTER_PAGE_SOURCE).not.toMatch(EMOJI_RE);
    expect(NEWSLETTER_PAGE_SOURCE).toContain("from 'lucide-react'");
  });

  it('newsletter page renders lucide icons for benefits and the privacy checklist', async () => {
    const { default: NewsletterPage } = await import('@/app/[locale]/(pages)/newsletter/page');
    const { container } = render(
      await NewsletterPage({ params: Promise.resolve({ locale: 'es' }) })
    );

    expect(container.querySelector('svg.lucide-file-text')).not.toBeNull();
    expect(container.querySelector('svg.lucide-lightbulb')).not.toBeNull();
    expect(container.querySelector('svg.lucide-rocket')).not.toBeNull();
    expect(container.querySelector('svg.lucide-gift')).not.toBeNull();
    // Checklist items (5) use circle-check icons instead of ✅
    expect(container.querySelectorAll('svg.lucide-circle-check').length).toBe(5);
  });

  it('ContactForm source has no emoji literals and uses lucide icons', () => {
    expect(CONTACT_FORM_SOURCE).not.toMatch(EMOJI_RE);
    expect(CONTACT_FORM_SOURCE).toContain('Lightbulb');
    expect(CONTACT_FORM_SOURCE).toContain("from 'lucide-react'");
  });

  it('ContactForm renders a lucide send icon in the submit button', async () => {
    const { ContactForm } = await import('@/components/forms/ContactForm');
    const { container } = render(<ContactForm />);

    const submit = screen.getByRole('button', { name: /enviar/i });
    expect(submit.querySelector('svg.lucide-send')).not.toBeNull();
    expect(container.textContent).not.toMatch(EMOJI_RE);
  });
});

// --- 4. Shared icons cleanup ----------------------------------------------------

describe('batch 3: shared icons module removed in favor of lucide', () => {
  it('components/ui/icons.tsx no longer exists', () => {
    expect(existsSync(resolve(process.cwd(), 'components/ui/icons.tsx'))).toBe(false);
  });

  it('forms use lucide Loader2 instead of SpinnerIcon', () => {
    expect(CONTACT_FORM_SOURCE).toContain('Loader2');
    expect(CONTACT_FORM_SOURCE).not.toContain('SpinnerIcon');
    expect(NEWSLETTER_FORM_SOURCE).toContain('Loader2');
    expect(NEWSLETTER_FORM_SOURCE).not.toContain('SpinnerIcon');
  });

  it('the dead Icons message namespace is removed from both locales', () => {
    expect((messagesEs as Record<string, unknown>).Icons).toBeUndefined();
    expect((messagesEn as Record<string, unknown>).Icons).toBeUndefined();
  });

  it('Pagination uses lucide chevrons instead of hand-rolled SVGs', () => {
    const { container } = render(<Pagination currentPage={2} totalPages={5} />);

    expect(container.querySelector('svg.lucide-chevron-left')).not.toBeNull();
    expect(container.querySelector('svg.lucide-chevron-right')).not.toBeNull();
  });

  it('EmptyState uses a lucide icon instead of a hand-rolled SVG', () => {
    const { container } = render(<EmptyState />);

    expect(container.querySelector('svg.lucide-file-text')).not.toBeNull();
  });

  it('error page uses lucide AlertTriangle instead of a hand-rolled SVG', () => {
    const { container } = render(<ErrorPage error={new Error('boom')} reset={() => {}} />);

    const icon = container.querySelector('svg.lucide-alert-triangle');
    expect(icon).not.toBeNull();
    expect(icon).toHaveClass('text-error');
  });
});

// --- 5. Dead code removal ---------------------------------------------------------

describe('batch 3: dead code removed', () => {
  it('SectionDivider drops the unused dots variant', () => {
    expect(SECTION_DIVIDER_SOURCE).not.toContain('dots');
  });

  it('Modal drops the unused ModalProvider context fallback', () => {
    expect(MODAL_SOURCE).not.toContain('ModalProvider');
    expect(MODAL_SOURCE).not.toContain('ModalCountContext');
  });
});

// --- 6. Legal motif badge is translated --------------------------------------------

describe('batch 3: legal hero badge is translated', () => {
  it('renders the ES badge', () => {
    render(<InteriorHero variant="legal" title="Legal" description="desc" />);

    expect(screen.getByText('GDPR / Ley 25.326')).toBeInTheDocument();
  });

  it('renders the EN badge', () => {
    renderEn(<InteriorHero variant="legal" title="Legal" description="desc" />);

    expect(screen.getByText('GDPR / Law 25,326')).toBeInTheDocument();
    expect(screen.queryByText('GDPR / Ley 25.326')).not.toBeInTheDocument();
  });

  it('keeps the key in both locales with exact parity', () => {
    const es = messagesEs as unknown as { InteriorHero?: { legalBadge?: string } };
    const en = messagesEn as unknown as { InteriorHero?: { legalBadge?: string } };
    expect(es.InteriorHero?.legalBadge).toBe('GDPR / Ley 25.326');
    expect(en.InteriorHero?.legalBadge).toBe('GDPR / Law 25,326');
  });
});

// --- 7. Blog loading skeleton filter row height --------------------------------------

describe('batch 3: blog loading skeleton filter row matches the real controls', () => {
  it('filter placeholders are h-12 like the real SearchInput', () => {
    render(<BlogLoading />);

    expect(screen.getByTestId('blog-loading-search')).toHaveClass('h-12');
    expect(screen.getByTestId('blog-loading-filter-control')).toHaveClass('h-12');
  });
});
