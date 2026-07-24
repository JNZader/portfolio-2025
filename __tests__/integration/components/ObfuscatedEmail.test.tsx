import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/__tests__/test-utils';
import userEvent from '@testing-library/user-event';
import { ObfuscatedEmail } from '@/components/ui/ObfuscatedEmail';

/**
 * Batch 6 / N-03 — email at the conversion point: ONE click to act, and the
 * literal address must not appear in the rendered HTML (anti-scraping).
 */
describe('ObfuscatedEmail', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete (globalThis.location as Partial<Location>).href;
  });

  it('renders send/copy buttons without exposing the literal email in the HTML', () => {
    const { container } = render(<ObfuscatedEmail user="jnzader" domain="gmail.com" />);

    expect(container.textContent).not.toContain('jnzader@gmail.com');
    expect(screen.getByRole('button', { name: /enviar email/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copiar dirección/i })).toBeInTheDocument();
  });

  it('has no fake menu semantics', () => {
    const { container } = render(<ObfuscatedEmail user="jnzader" domain="gmail.com" />);

    expect(container.querySelector('[aria-haspopup]')).toBeNull();
    expect(container.querySelector('[role="menu"]')).toBeNull();
    expect(container.querySelector('[role="menuitem"]')).toBeNull();
  });

  it('opens mailto with the assembled address on a single click', async () => {
    const user = userEvent.setup();
    const assignSpy = vi.spyOn(globalThis.location, 'href', 'set');

    render(<ObfuscatedEmail user="jnzader" domain="gmail.com" />);
    await user.click(screen.getByRole('button', { name: /enviar email/i }));

    expect(assignSpy).toHaveBeenCalledWith('mailto:jnzader@gmail.com');
  });

  it('copies the assembled address with one click and announces it politely', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    render(<ObfuscatedEmail user="jnzader" domain="gmail.com" />);

    await user.click(screen.getByRole('button', { name: /copiar dirección/i }));

    expect(writeText).toHaveBeenCalledWith('jnzader@gmail.com');
    expect(await screen.findByText('Email copiado al portapapeles')).toBeInTheDocument();
  });
});
