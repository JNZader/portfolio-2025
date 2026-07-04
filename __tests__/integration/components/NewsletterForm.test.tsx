import { render, screen, waitFor } from '@/__tests__/test-utils';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NewsletterForm } from '@/components/newsletter/NewsletterForm';

// Mock the server action
vi.mock('@/app/actions/newsletter', () => ({
  subscribeToNewsletter: vi.fn(),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Import after mocking
import { subscribeToNewsletter } from '@/app/actions/newsletter';
import toast from 'react-hot-toast';

const mockSubscribe = subscribeToNewsletter as ReturnType<typeof vi.fn>;
const mockToast = toast as unknown as { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

describe('NewsletterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form with email input and submit button', () => {
    render(<NewsletterForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /suscribir/i })).toBeInTheDocument();
  });

  it('should submit form successfully', async () => {
    // La acción ahora devuelve una KEY semántica; el hook la traduce con next-intl
    // (locale=es en el test env), así que el toast recibe el texto ES resuelto.
    mockSubscribe.mockResolvedValueOnce({
      success: true,
      messageKey: 'toastSubscribe',
    });

    render(<NewsletterForm />);

    const input = screen.getByLabelText(/email/i);
    const button = screen.getByRole('button', { name: /suscribir/i });

    await userEvent.type(input, 'test@example.com');
    await userEvent.click(button);

    await waitFor(() => {
      expect(mockSubscribe).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith(
        'Si tu email no estaba suscrito, te enviamos un link de confirmación. ¡Revisa tu inbox!',
        expect.any(Object)
      );
    });
  });

  it('should show error toast on failure', async () => {
    mockSubscribe.mockResolvedValueOnce({
      success: false,
      errorKey: 'toastRateLimit',
    });

    render(<NewsletterForm />);

    const input = screen.getByLabelText(/email/i);
    await userEvent.type(input, 'existing@example.com');
    await userEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        'Demasiados intentos. Por favor, intenta más tarde.',
        expect.any(Object)
      );
    });
  });

  it('should show validation error for invalid email', async () => {
    render(<NewsletterForm />);

    const input = screen.getByLabelText(/email/i);
    const button = screen.getByRole('button');

    await userEvent.type(input, 'invalid-email');
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });
  });

  it('should show loading state during submission', async () => {
    // Make the promise never resolve to keep loading state
    mockSubscribe.mockImplementationOnce(() => new Promise(() => {}));

    render(<NewsletterForm />);

    const input = screen.getByLabelText(/email/i);
    const button = screen.getByRole('button');

    await userEvent.type(input, 'test@example.com');
    await userEvent.click(button);

    // Button should be disabled and show loading text
    await waitFor(() => {
      expect(button).toBeDisabled();
      expect(screen.getByText(/suscribiendo/i)).toBeInTheDocument();
    });
  });

  it('should clear form after successful submission', async () => {
    mockSubscribe.mockResolvedValueOnce({
      success: true,
      messageKey: 'toastSubscribe',
    });

    render(<NewsletterForm />);

    const input = screen.getByLabelText(/email/i);

    await userEvent.type(input, 'test@example.com');
    await userEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('should handle unexpected errors', async () => {
    // Silence console.error for this test since we expect an error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockSubscribe.mockRejectedValueOnce(new Error('Network error'));

    render(<NewsletterForm />);

    const input = screen.getByLabelText(/email/i);
    await userEvent.type(input, 'test@example.com');
    await userEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        'Error inesperado. Por favor, intenta más tarde.',
        expect.any(Object)
      );
    });

    consoleSpy.mockRestore();
  });
});
