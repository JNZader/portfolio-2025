import { render, screen } from '@/__tests__/test-utils';
import { NewsletterHero } from '@/components/newsletter/NewsletterHero';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next-intl')>();
  return {
    ...actual,
    useTranslations: () => (key: string) => {
      const messages: Record<string, string> = {
        badge: 'Updates',
        heading: 'Blog updates',
        description: 'Get blog posts, engineering notes, and release notes. This is an opt-in subscription, not a contact channel.',
        benefit1: 'Blog posts and notes',
        benefit2: 'One digest a week',
        benefit3: 'No spam or outreach',
        ariaLabel: 'Newsletter subscription',
        emailLabel: 'Email',
        emailPlaceholder: 'you@email.com',
        subscribe: 'Subscribe',
        subscribing: 'Subscribing…',
        subscribed: 'Subscribed!',
        noSpam: 'No spam',
        unsubscribe: 'Unsubscribe anytime',
      };
      return messages[key] ?? key;
    },
  };
});

vi.mock('@/hooks/useNewsletterSubscription', () => ({
  useNewsletterSubscription: () => ({ status: 'idle', subscribe: vi.fn() }),
}));

describe('NewsletterHero', () => {
  it('reads as a quieter opt-in updates section instead of a hero block', () => {
    const { container } = render(<NewsletterHero />);

    expect(screen.getByRole('heading', { name: 'Blog updates' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'Get blog posts, engineering notes, and release notes. This is an opt-in subscription, not a contact channel.'
      )
    )
      .toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass('py-12');
    expect(container.firstElementChild).not.toHaveClass('bg-gradient-to-br');

    const card =
      container.querySelector('[data-testid="newsletter-card"]') ?? container.querySelector('div.rounded-lg');
    expect(card).not.toBeNull();
    expect(card).not.toHaveClass('border-2');
  });
});
