import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/__tests__/test-utils';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, locale: _locale, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: ReactNode;
    href: string;
    locale?: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  usePathname: () => '/',
}));

describe('language switcher visual UX', () => {
  it('gives each language option a 44px target while keeping concise labels', () => {
    render(<LanguageSwitcher />);

    const english = screen.getByRole('link', { name: 'Ver en inglés' });
    expect(english).toHaveClass('size-11');
    expect(english).toHaveTextContent('en');
  });
});
