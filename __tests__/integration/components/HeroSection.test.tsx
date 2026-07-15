import type { ReactNode } from 'react';
import { render, screen } from '@/__tests__/test-utils';
import { HeroSection } from '@/components/sections/hero-section';
import { describe, expect, it, vi } from 'vitest';

let locale = 'es';

const captions = {
  es: '<b>apigen</b> — una herramienta que construí: de un schema SQL a una API Spring Boot completa y corriendo.',
  en: '<b>apigen</b> — a tool I built that turns a SQL schema into a complete, running Spring Boot API.',
};

function exactName(value: string): RegExp {
  return new RegExp(`^${value.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}$`);
}

vi.mock('next-intl/server', () => ({
  getTranslations: async (namespace: string) => {
    const messages: Record<string, string> = {
      'Common.aGithub': 'Visitar perfil de GitHub',
      'Common.aLinkedin': 'Visitar perfil de LinkedIn',
      'Common.aEmail': 'Enviar correo electrónico',
    };
    const translate = (key: string) => messages[`${namespace}.${key}`] ?? key;
    translate.rich = (_key: string, values: { b: (chunks: ReactNode) => ReactNode }) => {
      const caption = captions[locale as keyof typeof captions];
      const [name, rest] = caption.replace(/<b>|<\/b>/g, '').split(' — ');
      return <>{values.b(name)} — {rest}</>;
    };
    return translate;
  },
}));

vi.mock('next/dynamic', () => ({
  default: () => function DynamicPlaceholder(): ReactNode {
    return <div data-testid="hero-terminal" aria-hidden="true" />;
  },
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: { children: ReactNode; href: string }) => (
    <a href={locale === 'en' ? `/en${href}` : href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/ui/ExternalLink', () => ({
  ExternalLink: ({ children, href, trackLabel: _trackLabel, ...props }: { children: ReactNode; href: string; trackLabel?: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/ui/HeroBackground', () => ({ HeroBackground: () => null }));
vi.mock('@/components/ui/ScrollIndicator', () => ({ ScrollIndicator: () => null }));

async function renderHero(nextLocale: 'es' | 'en') {
  locale = nextLocale;
  return render(
    await HeroSection({
      title: 'Javier Zader',
      description: 'Description',
      primaryCta: { text: 'Projects', href: '/proyectos' },
      showScrollIndicator: false,
    })
  );
}

describe('HeroSection project conversion contract', () => {
  it.each([
    ['es', captions.es.replace(/<b>|<\/b>/g, '')],
    ['en', captions.en.replace(/<b>|<\/b>/g, '')],
  ] as const)('renders the whole localized caption as the sole APiGen link in %s', async (nextLocale, caption) => {
    await renderHero(nextLocale);

    const terminal = screen.getByTestId('hero-terminal');
    const links = screen.getAllByRole('link', { name: exactName(caption) });
    const link = links[0];
    const paragraph = link.closest('p');

    expect(links).toHaveLength(1);
    expect(link).toHaveAttribute('href', nextLocale === 'en' ? '/en/proyectos/apigen' : '/proyectos/apigen');
    expect(link.querySelector('strong')).toHaveTextContent('apigen');
    expect(link).toHaveClass('underline', 'focus-visible:outline-2');
    expect(paragraph?.previousElementSibling).toBe(terminal);
    expect(paragraph?.parentElement).toBe(terminal.parentElement);
    expect(terminal).toHaveAttribute('aria-hidden', 'true');
    expect(terminal.querySelector('a,button,input,select,textarea,[tabindex]')).toBeNull();
    expect(screen.queryByRole('link', { name: /github/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId('apigen-featured-actions')).not.toBeInTheDocument();
  });
});
