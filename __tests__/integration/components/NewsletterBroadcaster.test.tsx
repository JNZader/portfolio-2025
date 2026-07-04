import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@/__tests__/test-utils';

// Mock the admin actions and toast so we assert on calls, not real network.
const mockBroadcast = vi.fn();
const mockTest = vi.fn();
vi.mock('@/app/actions/admin-newsletter', () => ({
  sendNewsletterBroadcast: (fd: FormData) => mockBroadcast(fd),
  sendTestNewsletter: (fd: FormData) => mockTest(fd),
}));

const mockToastError = vi.fn();
vi.mock('react-hot-toast', () => ({
  toast: { error: (m: string) => mockToastError(m), success: vi.fn() },
}));

import { NewsletterBroadcaster } from '@/components/admin/NewsletterBroadcaster';

function fill() {
  fireEvent.change(screen.getByLabelText('Asunto'), { target: { value: 'Hola' } });
  fireEvent.change(screen.getByPlaceholderText(/Escribe tu contenido/i), {
    target: { value: 'Contenido de prueba' },
  });
}

describe('NewsletterBroadcaster', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBroadcast.mockResolvedValue({ success: true, message: 'ok' });
  });

  it('asks for confirmation before broadcasting instead of sending immediately', () => {
    render(<NewsletterBroadcaster />);
    fill();

    fireEvent.click(screen.getByRole('button', { name: /Enviar Broadcast/i }));

    // Inline confirm panel appears; the action was NOT called yet.
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(mockBroadcast).not.toHaveBeenCalled();
  });

  it('sends only after confirming', async () => {
    render(<NewsletterBroadcaster />);
    fill();

    fireEvent.click(screen.getByRole('button', { name: /Enviar Broadcast/i }));
    fireEvent.click(screen.getByRole('button', { name: /Sí, enviar a todos/i }));

    await waitFor(() => expect(mockBroadcast).toHaveBeenCalledTimes(1));
  });

  it('cancelling hides the panel without sending', () => {
    render(<NewsletterBroadcaster />);
    fill();

    fireEvent.click(screen.getByRole('button', { name: /Enviar Broadcast/i }));
    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(mockBroadcast).not.toHaveBeenCalled();
  });

  it('validates subject/content before asking to confirm', () => {
    render(<NewsletterBroadcaster />);

    fireEvent.click(screen.getByRole('button', { name: /Enviar Broadcast/i }));

    expect(mockToastError).toHaveBeenCalledWith('Completa asunto y contenido');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});
