import { act, fireEvent, render, screen } from '@/__tests__/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock js-cookie: control Cookies.get per test, assert Cookies.set payloads
vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

// Mock the GA consent bridge so we can assert the consent LOGIC in isolation
vi.mock('@/lib/analytics/consent', () => ({
  setDefaultGAConsent: vi.fn(),
  updateGAConsent: vi.fn(),
}));

// Import after mocking
import { setDefaultGAConsent, updateGAConsent } from '@/lib/analytics/consent';
import Cookies from 'js-cookie';
import { CookieConsent } from '@/components/gdpr/CookieConsent';

const mockGet = Cookies.get as unknown as ReturnType<typeof vi.fn>;
const mockSet = Cookies.set as unknown as ReturnType<typeof vi.fn>;
const mockSetDefault = setDefaultGAConsent as ReturnType<typeof vi.fn>;
const mockUpdate = updateGAConsent as ReturnType<typeof vi.fn>;

const COOKIE_KEY = 'cookie-consent';
const VERSION = '1.0';

/**
 * The banner is revealed via a 1000ms setTimeout (+ requestAnimationFrame for
 * the enter animation). Flush both to surface the banner in the DOM.
 */
async function revealBanner() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000);
  });
}

/** Flush the 300ms exit-animation timer that unmounts the banner. */
async function flushHide() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(300);
  });
}

/** Parse the JSON payload written to the cookie by Cookies.set. */
function lastCookiePayload() {
  expect(mockSet).toHaveBeenCalled();
  const [key, value, options] = mockSet.mock.calls[mockSet.mock.calls.length - 1];
  return { key, options, prefs: JSON.parse(value as string) };
}

describe('CookieConsent (GDPR)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockGet.mockReturnValue(undefined);
  });

  afterEach(() => {
    // Flush the 300ms hide timer (if any) before switching back to real timers
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('shows the banner and sets default GA consent when there is no stored consent', async () => {
    mockGet.mockReturnValue(undefined);

    render(<CookieConsent />);

    // Default (denied) GA consent is set immediately on mount
    expect(mockSetDefault).toHaveBeenCalledTimes(1);
    // Banner is NOT visible before the 1000ms delay elapses
    expect(screen.queryByRole('region', { name: 'Consentimiento de cookies' })).toBeNull();

    await revealBanner();

    expect(
      screen.getByRole('region', { name: 'Consentimiento de cookies' })
    ).toBeInTheDocument();
    // No prior consent → GA consent is never "updated" from a stored value
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('does NOT show the banner and applies stored consent when version matches', async () => {
    mockGet.mockReturnValue(
      JSON.stringify({ essential: true, analytics: true, marketing: false, version: VERSION })
    );

    render(<CookieConsent />);

    expect(mockSetDefault).toHaveBeenCalledTimes(1);
    // Stored analytics=true is replayed into GA consent
    expect(mockUpdate).toHaveBeenCalledWith(true);

    await revealBanner();

    expect(screen.queryByRole('region', { name: 'Consentimiento de cookies' })).toBeNull();
  });

  it('re-shows the banner (migration path) when the stored version differs', async () => {
    mockGet.mockReturnValue(
      JSON.stringify({ essential: true, analytics: true, marketing: true, version: '0.9' })
    );

    render(<CookieConsent />);

    // Outdated version → do NOT trust stored analytics, re-prompt instead
    expect(mockUpdate).not.toHaveBeenCalled();

    await revealBanner();

    expect(
      screen.getByRole('region', { name: 'Consentimiento de cookies' })
    ).toBeInTheDocument();
  });

  it('re-shows the banner when the stored consent is malformed JSON', async () => {
    mockGet.mockReturnValue('not-json{');

    render(<CookieConsent />);

    expect(mockUpdate).not.toHaveBeenCalled();

    await revealBanner();

    expect(
      screen.getByRole('region', { name: 'Consentimiento de cookies' })
    ).toBeInTheDocument();
  });

  it('Accept all → persists analytics:true, marketing:true and enables GA analytics', async () => {
    render(<CookieConsent />);
    await revealBanner();

    fireEvent.click(screen.getByRole('button', { name: 'Aceptar todas' }));

    const { key, prefs, options } = lastCookiePayload();
    expect(key).toBe(COOKIE_KEY);
    expect(prefs).toMatchObject({
      essential: true,
      analytics: true,
      marketing: true,
      version: VERSION,
    });
    expect(options).toMatchObject({ expires: 365 });
    expect(mockUpdate).toHaveBeenCalledWith(true);

    // Banner hides after the 300ms exit animation timer
    await flushHide();
    expect(screen.queryByRole('region', { name: 'Consentimiento de cookies' })).toBeNull();
  });

  it('Essential only → persists analytics:false, marketing:false and disables GA analytics', async () => {
    render(<CookieConsent />);
    await revealBanner();

    fireEvent.click(screen.getByRole('button', { name: 'Solo necesarias' }));

    const { prefs } = lastCookiePayload();
    expect(prefs).toMatchObject({
      essential: true,
      analytics: false,
      marketing: false,
      version: VERSION,
    });
    expect(mockUpdate).toHaveBeenCalledWith(false);

    await flushHide();
    expect(screen.queryByRole('region', { name: 'Consentimiento de cookies' })).toBeNull();
  });

  it('X close button behaves as "essential only" (analytics:false)', async () => {
    render(<CookieConsent />);
    await revealBanner();

    fireEvent.click(
      screen.getByRole('button', { name: 'Cerrar y aceptar solo esenciales' })
    );

    const { prefs } = lastCookiePayload();
    expect(prefs).toMatchObject({ analytics: false, marketing: false, version: VERSION });
    expect(mockUpdate).toHaveBeenCalledWith(false);
  });

  it('Customize → toggle analytics on → Save persists the custom analytics choice', async () => {
    render(<CookieConsent />);
    await revealBanner();

    // Switches are hidden until "Personalizar" is clicked
    expect(screen.queryAllByRole('switch')).toHaveLength(0);

    fireEvent.click(screen.getByRole('button', { name: 'Personalizar' }));

    // Now the three toggles are revealed: [essential(disabled), analytics, marketing]
    const switches = screen.getAllByRole('switch');
    expect(switches).toHaveLength(3);
    const analyticsSwitch = switches[1];
    expect(analyticsSwitch).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(analyticsSwitch);
    expect(analyticsSwitch).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Guardar preferencias' }));

    const { prefs } = lastCookiePayload();
    expect(prefs).toMatchObject({
      essential: true,
      analytics: true,
      marketing: false,
      version: VERSION,
    });
    expect(mockUpdate).toHaveBeenCalledWith(true);
  });

  it('Customize with no changes → Save persists analytics:false (defaults)', async () => {
    render(<CookieConsent />);
    await revealBanner();

    fireEvent.click(screen.getByRole('button', { name: 'Personalizar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar preferencias' }));

    const { prefs } = lastCookiePayload();
    expect(prefs).toMatchObject({ analytics: false, marketing: false, version: VERSION });
    expect(mockUpdate).toHaveBeenCalledWith(false);
  });
});
