import { beforeEach, describe, expect, it, vi } from 'vitest';

// First real coverage of the lead-form server action: validation, rate
// limiting, XSS sanitization and the email-send failure path.

const sendMock = vi.fn();
vi.mock('@/lib/email/resend', () => ({
  resend: { emails: { send: (...args: unknown[]) => sendMock(...args) } },
  emailConfig: { from: 'noreply@test.dev', to: 'owner@test.dev' },
  validateEmailConfig: vi.fn(),
}));

const contactEmailProps = vi.fn();
vi.mock('@/lib/email/templates/ContactEmail', () => ({
  default: (props: unknown) => {
    contactEmailProps(props);
    return null;
  },
}));
vi.mock('@/lib/email/templates/ContactConfirm', () => ({ default: () => null }));

const limit = vi.fn();
vi.mock('@/lib/rate-limit/redis', () => ({
  contactRateLimiter: { limit: (...args: unknown[]) => limit(...args) },
  getClientIdentifier: vi.fn().mockReturnValue('127.0.0.1'),
}));

const validateEmail = vi.fn();
vi.mock('@/lib/validations/email-validator', () => ({
  validateEmail: (...args: unknown[]) => validateEmail(...args),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers({ 'user-agent': 'vitest' })),
}));

vi.mock('@/lib/monitoring/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/monitoring/performance', () => ({
  measureAsync: (_name: string, fn: () => unknown) => fn(),
  trackEmailSend: (_name: string, fn: () => unknown) => fn(),
}));

import { sendContactEmail } from '@/app/actions/contact';

function validFormData(overrides: Record<string, string> = {}) {
  const fd = new FormData();
  fd.append('name', overrides.name ?? 'Juan Pérez');
  fd.append('email', overrides.email ?? 'juan@example.com');
  fd.append('reason', overrides.reason ?? 'freelance');
  fd.append('message', overrides.message ?? 'Hola, me interesa hablar sobre un proyecto backend.');
  return fd;
}

describe('sendContactEmail', () => {
  beforeEach(() => {
    sendMock.mockReset().mockResolvedValue({ data: { id: 'email-id' }, error: null });
    limit.mockReset().mockResolvedValue({ success: true });
    validateEmail
      .mockReset()
      .mockResolvedValue({ isValid: true, domain: 'example.com', hasMxRecords: true });
  });

  it('sends owner + confirmation emails and reports success', async () => {
    const result = await sendContactEmail(validFormData());
    expect(result.success).toBe(true);
    expect(sendMock).toHaveBeenCalledTimes(2);
  });

  it('rejects invalid input via zod without sending anything', async () => {
    const fd = validFormData({ email: 'not-an-email' });
    const result = await sendContactEmail(fd);
    expect(result.success).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('rejects when the advanced email validation fails', async () => {
    validateEmail.mockResolvedValue({ isValid: false, reason: 'Dominio desechable' });
    const result = await sendContactEmail(validFormData());
    expect(result.success).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('stops at the rate limit before sending', async () => {
    limit.mockResolvedValue({ success: false });
    const result = await sendContactEmail(validFormData());
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('límite');
    }
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('fails gracefully when the owner email cannot be sent', async () => {
    sendMock.mockResolvedValueOnce({ data: null, error: new Error('resend down') });
    const result = await sendContactEmail(validFormData());
    expect(result.success).toBe(false);
    // Confirmation email must not go out if the owner email failed.
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it('sanitizes html out of the message before emailing', async () => {
    // El nombre ya lo bloquea el regex de zod; el message acepta texto libre,
    // así que es el campo donde sanitizeText tiene que actuar.
    contactEmailProps.mockClear();
    await sendContactEmail(
      validFormData({ message: 'Hola <script>alert(1)</script> me interesa tu laburo backend.' })
    );
    expect(contactEmailProps).toHaveBeenCalled();
    const props = contactEmailProps.mock.calls[0][0] as { message: string };
    expect(props.message).not.toContain('<script>');
  });
});
