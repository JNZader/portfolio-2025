import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import es from '@/messages/es.json';
import en from '@/messages/en.json';
import { SkipLinks } from '@/components/a11y/SkipLinks';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let locale = 'es';

vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string) => {
    const messages = locale === 'es' ? es : en;
    const namespaceMessages = messages[namespace as keyof typeof messages];

    if (!namespaceMessages || typeof namespaceMessages !== 'object') {
      throw new Error(`Missing namespace: ${namespace}`);
    }

    const message = namespaceMessages[key as keyof typeof namespaceMessages];
    if (typeof message !== 'string') {
      throw new Error(`Missing message: ${namespace}.${key}`);
    }

    return message;
  },
}));

const expectedLinks = [
  { key: 'mainContent', href: '#main-content' },
  { key: 'mainNavigation', href: '#main-navigation' },
  { key: 'footer', href: '#footer' },
] as const;

describe('SkipLinks', () => {
  beforeEach(() => {
    locale = 'es';
  });

  it('keeps the localized namespace in parity with equivalent non-empty labels', () => {
    for (const key of Object.keys(es.SkipLinks)) {
      expect(en.SkipLinks).toHaveProperty(key);
      expect(es.SkipLinks[key as keyof typeof es.SkipLinks]).not.toBe('');
      expect(en.SkipLinks[key as keyof typeof en.SkipLinks]).not.toBe('');
    }

    expect(Object.keys(es.SkipLinks)).toEqual(Object.keys(en.SkipLinks));
  });

  it.each([
    ['es', es.SkipLinks],
    ['en', en.SkipLinks],
  ] as const)('renders %s names, existing targets, and focus behavior', (currentLocale, messages) => {
    locale = currentLocale;
    render(<SkipLinks />);

    for (const link of expectedLinks) {
      const renderedLink = screen.getByRole('link', { name: messages[link.key] });

      expect(renderedLink).toHaveAttribute('href', link.href);
      expect(renderedLink).toHaveClass('skip-link', 'focus:translate-y-0', 'focus:outline-none');
      expect(renderedLink).not.toHaveTextContent(currentLocale === 'es' ? en.SkipLinks[link.key] : es.SkipLinks[link.key]);
    }
  });

  it('supports tab focus and Enter activation while preserving the fragment target contract', async () => {
    const user = userEvent.setup();

    render(
      <>
        <SkipLinks />
        <main id="main-content" tabIndex={-1} />
      </>
    );

    await user.tab();
    const skipLink = screen.getByRole('link', { name: es.SkipLinks.mainContent });
    expect(skipLink).toHaveFocus();

    await user.keyboard('{Enter}');

    // happy-dom dispatches the native anchor activation but does not implement
    // browser fragment navigation's focus transfer to a tabindex=-1 target.
    expect(skipLink).toHaveAttribute('href', '#main-content');
    expect(document.querySelector('#main-content')).toHaveAttribute('tabindex', '-1');
  });
});
