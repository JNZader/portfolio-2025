import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import es from '@/messages/es.json';
import en from '@/messages/en.json';
import MobileMenu from '@/components/layout/MobileMenu';
import { MAIN_NAVIGATION } from '@/lib/constants/navigation';
import type { AnchorHTMLAttributes } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let locale: 'es' | 'en' = 'es';
let pathname = '/';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: keyof typeof es.MobileMenu) => {
    const messages = locale === 'es' ? es : en;
    return messages.MobileMenu[key];
  },
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
  usePathname: () => pathname,
}));

const navigation = [
  { name: 'Sobre mí', href: '/sobre-mi' },
  { name: 'Proyectos', href: '/proyectos' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contacto', href: '/contacto' },
];

function renderMenu(open = true, onClose = vi.fn()) {
  return render(
    <>
      <h1>Portfolio</h1>
      <button type="button">Abrir menú</button>
      <main id="main-content" tabIndex={-1} />
      <MobileMenu open={open} onClose={onClose} navigation={navigation} />
    </>
  );
}

describe('MobileMenu', () => {
  beforeEach(() => {
    locale = 'es';
    pathname = '/';
  });

  it('uses the canonical main navigation without Home/Inicio', () => {
    expect(MAIN_NAVIGATION.map((item) => item.key)).toEqual([
      'about',
      'projects',
      'blog',
      'contact',
    ]);
  });

  it.each([
    ['es', es.MobileMenu.title],
    ['en', en.MobileMenu.title],
  ] as const)('exposes the %s localized name without contributing an h2', (currentLocale, title) => {
    locale = currentLocale;
    renderMenu();

    const dialog = screen.getByRole('dialog', { name: title });
    expect(dialog.querySelector('h2')).toBeNull();
    expect(document.querySelector('h1')).toBeTruthy();
    expect(document.querySelector('h1')?.compareDocumentPosition(dialog)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(screen.getByText(title)).toHaveClass('sr-only');
  });

  it('focuses the close button after opening and restores the opener on close', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { rerender } = renderMenu(false, onClose);
    const opener = screen.getByRole('button', { name: 'Abrir menú' });
    opener.focus();
    rerender(
      <>
        <h1>Portfolio</h1>
        <button type="button">Abrir menú</button>
        <main id="main-content" tabIndex={-1} />
        <MobileMenu open={true} onClose={onClose} navigation={navigation} />
      </>
    );

    const dialog = screen.getByRole('dialog');
    const closeButton = dialog.querySelectorAll('button')[1];
    expect(closeButton).toHaveFocus();

    await user.click(closeButton);
    rerender(
      <>
        <h1>Portfolio</h1>
        <button type="button">Abrir menú</button>
        <main id="main-content" tabIndex={-1} />
        <MobileMenu open={false} onClose={onClose} navigation={navigation} />
      </>
    );
    expect(opener).toHaveFocus();
  });

  it('restores the opener after the native dialog close event', () => {
    const { rerender } = renderMenu(false);
    const opener = screen.getByRole('button', { name: 'Abrir menú' });
    opener.focus();
    rerender(
      <>
        <h1>Portfolio</h1>
        <button type="button">Abrir menú</button>
        <main id="main-content" tabIndex={-1} />
        <MobileMenu open={true} onClose={vi.fn()} navigation={navigation} />
      </>
    );
    const dialog = screen.getByRole('dialog');

    dialog.dispatchEvent(new Event('close'));

    expect(opener).toHaveFocus();
  });

  it('focuses the destination main after navigation closes the dialog', () => {
    const { rerender } = renderMenu();
    const opener = screen.getByRole('button', { name: 'Abrir menú' });
    opener.focus();
    const navigationLink = screen.getByRole('link', { name: 'Proyectos' });
    navigationLink.click();
    pathname = '/proyectos';

    rerender(
      <>
        <h1>Projects</h1>
        <button type="button">Abrir menú</button>
        <main id="main-content" tabIndex={-1} />
        <MobileMenu open={false} onClose={vi.fn()} navigation={navigation} />
      </>
    );

    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('focuses the destination main after logo navigation', () => {
    pathname = '/proyectos';
    const { rerender } = renderMenu();
    const logo = screen.getByRole('link', { name: es.MobileMenu.homeAria });
    logo.click();
    pathname = '/';

    rerender(
      <>
        <h1>Home</h1>
        <button type="button">Abrir menú</button>
        <main id="main-content" tabIndex={-1} />
        <MobileMenu open={false} onClose={vi.fn()} navigation={navigation} />
      </>
    );

    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('renders Contact once without promoting it to a second CTA style', () => {
    renderMenu();

    const contact = screen.getByRole('link', { name: 'Contacto' });
    expect(contact).toBeInTheDocument();
    expect(contact).not.toHaveClass('bg-primary');
    expect(contact).not.toHaveClass('justify-center');
    expect(screen.queryByRole('link', { name: 'Inicio' })).not.toBeInTheDocument();
  });

  it('restores the opener when navigation stays on the current route', () => {
    const onClose = vi.fn();
    pathname = '/contacto';
    const { rerender } = renderMenu(false, onClose);
    const opener = screen.getByRole('button', { name: 'Abrir menú' });
    opener.focus();
    rerender(
      <>
        <h1>Portfolio</h1>
        <button type="button">Abrir menú</button>
        <main id="main-content" tabIndex={-1} />
        <MobileMenu open={true} onClose={onClose} navigation={navigation} />
      </>
    );
    screen.getByRole('link', { name: 'Contacto' }).click();
    screen.getByRole('dialog').dispatchEvent(new Event('close'));

    expect(opener).toHaveFocus();
  });
});
