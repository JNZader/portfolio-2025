import { fireEvent, render, screen, waitFor } from '@/__tests__/test-utils';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the server action so we control its resolved envelope per test.
vi.mock('@/app/actions/contact', () => ({
  sendContactEmail: vi.fn(),
}));

// Mock the client-side email validator (typo suggestion / disposable checks).
// Default: always valid; individual tests override with mockReturnValueOnce.
vi.mock('@/lib/validations/email-validator-client', () => ({
  quickValidateEmail: vi.fn(() => ({ isValid: true })),
}));

// Mock the toast helpers to assert what the user is shown.
vi.mock('@/lib/utils/toast', () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
}));

// Mock analytics so we can assert the submit is tracked.
vi.mock('@/lib/analytics/events', () => ({
  trackContactSubmit: vi.fn(),
}));

// Import after mocking
import { sendContactEmail } from '@/app/actions/contact';
import { trackContactSubmit } from '@/lib/analytics/events';
import { quickValidateEmail } from '@/lib/validations/email-validator-client';
import { showError, showSuccess } from '@/lib/utils/toast';
import { ContactForm } from '@/components/forms/ContactForm';

const mockSend = sendContactEmail as ReturnType<typeof vi.fn>;
const mockValidateEmail = quickValidateEmail as ReturnType<typeof vi.fn>;
const mockTrack = trackContactSubmit as ReturnType<typeof vi.fn>;
const mockShowSuccess = showSuccess as ReturnType<typeof vi.fn>;
const mockShowError = showError as ReturnType<typeof vi.fn>;

// ES strings resolved from messages/es.json (locale=es in test-utils).
const SUCCESS_TEXT = '¡Mensaje enviado con éxito! ✅ Te responderé en 24-48 horas hábiles.';
const RATE_LIMIT_TEXT = 'Has alcanzado el límite de envíos. Por favor, intenta más tarde.';
const EMAIL_INVALID_TEXT = 'Email inválido';

/**
 * Fill the form with valid data. The reason `<select>` is set via fireEvent.change
 * on the underlying element (react-hook-form's register spreads onChange onto it);
 * userEvent.selectOptions would also work but change() keeps parity with the DOM.
 */
async function fillValidForm() {
  await userEvent.type(screen.getByLabelText(/nombre/i), 'Javier Zader');
  await userEvent.type(screen.getByLabelText(/^email/i), 'javier@example.com');
  fireEvent.change(screen.getByLabelText(/motivo de contacto/i), {
    target: { value: 'job' },
  });
  await userEvent.type(
    screen.getByLabelText(/mensaje/i),
    'Hola, este es un mensaje de prueba válido.'
  );
}

describe('ContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Restore the default "valid" behavior after clearAllMocks wipes it.
    mockValidateEmail.mockReturnValue({ isValid: true });
  });

  it('renders all fields and the submit button', () => {
    render(<ContactForm />);

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/motivo de contacto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/empresa u organización/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/para cuándo lo necesitas/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mensaje/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument();
  });

  it('shows zod field errors (in Spanish) and does NOT call the action on empty submit', async () => {
    render(<ContactForm />);

    await userEvent.click(screen.getByRole('button', { name: /enviar/i }));

    // Field errors come from the zod schema keys, translated to ES by the fe() helper.
    expect(await screen.findByText('El nombre debe tener al menos 2 caracteres')).toBeInTheDocument();
    expect(screen.getByText('El email es requerido')).toBeInTheDocument();
    expect(screen.getByText('El mensaje debe tener al menos 10 caracteres')).toBeInTheDocument();

    // handleSubmit blocks onSubmit while the form is invalid.
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('submits successfully: calls the action once, tracks, shows success and resets', async () => {
    mockSend.mockResolvedValueOnce({ success: true, messageKey: 'toastSuccess' });

    render(<ContactForm />);
    await fillValidForm();

    await userEvent.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => {
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
    expect(mockTrack).toHaveBeenCalledTimes(1);
    expect(mockShowSuccess).toHaveBeenCalledWith(SUCCESS_TEXT);

    // reset() clears the controlled fields after a successful send.
    await waitFor(() => {
      expect(screen.getByLabelText(/nombre/i)).toHaveValue('');
    });
    expect(screen.getByLabelText(/^email/i)).toHaveValue('');
  });

  it('shows an error toast (ES) and does NOT reset when the action fails', async () => {
    mockSend.mockResolvedValueOnce({ success: false, errorKey: 'toastRateLimit' });

    render(<ContactForm />);
    await fillValidForm();

    await userEvent.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(RATE_LIMIT_TEXT);
    });
    expect(mockShowSuccess).not.toHaveBeenCalled();
    expect(mockTrack).not.toHaveBeenCalled();
    // On failure the form keeps the user's input (no reset).
    expect(screen.getByLabelText(/nombre/i)).toHaveValue('Javier Zader');
  });

  it('shows the email typo suggestion panel and defers the action until confirmed', async () => {
    // First check flags a typo suggestion; the corrected re-submit is valid.
    mockValidateEmail
      .mockReturnValueOnce({ isValid: false, suggestion: 'javier@gmail.com' })
      .mockReturnValue({ isValid: true });
    mockSend.mockResolvedValueOnce({ success: true, messageKey: 'toastSuccess' });

    render(<ContactForm />);
    await fillValidForm();

    await userEvent.click(screen.getByRole('button', { name: /enviar/i }));

    // Suggestion panel appears (Yes/No) and the action is NOT called yet.
    expect(await screen.findByText('¿Quisiste decir?')).toBeInTheDocument();
    expect(screen.getByText('javier@gmail.com')).toBeInTheDocument();
    expect(mockSend).not.toHaveBeenCalled();

    // Confirming the suggestion re-submits and fires the action.
    await userEvent.click(screen.getByRole('button', { name: /Sí, usar ese email/i }));

    await waitFor(() => {
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
    expect(mockShowSuccess).toHaveBeenCalledWith(SUCCESS_TEXT);
  });

  it('rejects a disposable email: shows an error and never calls the action', async () => {
    // Invalid with NO suggestion → treated as disposable/invalid, hard stop.
    mockValidateEmail.mockReturnValue({ isValid: false, suggestion: undefined });

    render(<ContactForm />);
    await fillValidForm();

    await userEvent.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(EMAIL_INVALID_TEXT);
    });
    expect(mockSend).not.toHaveBeenCalled();
  });
});
