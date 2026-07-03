import { beforeEach, describe, expect, it, vi } from 'vitest';

// Anti-enumeration regression tests: every subscriber state (new, active,
// pending, unsubscribed) must produce an indistinguishable response,
// otherwise an attacker can probe which emails are subscribed.

const findUnique = vi.fn();
const create = vi.fn().mockResolvedValue({});
const update = vi.fn().mockResolvedValue({});

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    subscriber: {
      findUnique: (...args: unknown[]) => findUnique(...args),
      create: (...args: unknown[]) => create(...args),
      update: (...args: unknown[]) => update(...args),
    },
  },
}));

const sendMock = vi.fn().mockResolvedValue({ data: { id: 'email-id' }, error: null });
vi.mock('@/lib/email/resend', () => ({
  resend: { emails: { send: (...args: unknown[]) => sendMock(...args) } },
  emailConfig: { from: 'noreply@test.dev', to: 'owner@test.dev' },
}));

vi.mock('@/lib/email/templates/NewsletterConfirm', () => ({ default: () => null }));

const limit = vi.fn().mockResolvedValue({ success: true });
vi.mock('@/lib/rate-limit/redis', () => ({
  newsletterRateLimiter: { limit: (...args: unknown[]) => limit(...args) },
  getClientIdentifier: vi.fn().mockReturnValue('127.0.0.1'),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers({ 'user-agent': 'vitest' })),
}));

vi.mock('@/lib/monitoring/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/monitoring/performance', () => ({
  trackDatabaseQuery: (_name: string, fn: () => unknown) => fn(),
  trackEmailSend: (_name: string, fn: () => unknown) => fn(),
}));

// sendConfirmationEmail hace no-op sin RESEND_API_KEY (modo dev) — los tests
// necesitan la key seteada para ejercitar el envío real (mockeado).
process.env.RESEND_API_KEY = 'test-key';

import { subscribeToNewsletter } from '@/app/actions/newsletter';

function formDataWith(email: string) {
  const fd = new FormData();
  fd.append('email', email);
  return fd;
}

async function subscribeAs(existing: { status: string } | null) {
  findUnique.mockResolvedValue(
    existing ? { email: 'x@example.com', ...existing } : null
  );
  return subscribeToNewsletter(formDataWith('x@example.com'));
}

describe('subscribeToNewsletter — anti-enumeration', () => {
  beforeEach(() => {
    findUnique.mockReset();
    create.mockClear();
    update.mockClear();
    sendMock.mockClear();
    limit.mockResolvedValue({ success: true });
  });

  it('returns the SAME response for every subscriber state', async () => {
    const newSubscriber = await subscribeAs(null);
    const active = await subscribeAs({ status: 'ACTIVE' });
    const pending = await subscribeAs({ status: 'PENDING' });
    const unsubscribed = await subscribeAs({ status: 'UNSUBSCRIBED' });

    // All succeed with the identical generic message — no state leaks.
    expect(newSubscriber).toEqual(active);
    expect(active).toEqual(pending);
    expect(pending).toEqual(unsubscribed);
    expect(newSubscriber.success).toBe(true);
  });

  it('does not send any email for an already-active subscriber', async () => {
    await subscribeAs({ status: 'ACTIVE' });
    expect(sendMock).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it('creates the subscriber and sends confirmation for a new email', async () => {
    await subscribeAs(null);
    expect(create).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it('rejects when rate limited', async () => {
    limit.mockResolvedValue({ success: false });
    const result = await subscribeAs(null);
    expect(result.success).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('rejects an invalid email without touching the database', async () => {
    const result = await subscribeToNewsletter(formDataWith('not-an-email'));
    expect(result.success).toBe(false);
    expect(findUnique).not.toHaveBeenCalled();
  });
});
