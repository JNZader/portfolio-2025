import { fireEvent, render, screen, waitFor } from '@/__tests__/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Assert the sign-out button delegates to next-auth's signOut
vi.mock('next-auth/react', () => ({ signOut: vi.fn() }));

// Stub the child so this test stays focused (UptimeStatus is tested separately)
vi.mock('@/components/admin/UptimeStatus', () => ({
  UptimeStatus: () => <div data-testid="uptime" />,
}));

// Import after mocking
import { signOut } from 'next-auth/react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

const mockSignOut = signOut as unknown as ReturnType<typeof vi.fn>;

const USER = {
  name: 'Javier Zader',
  email: 'jnzader@gmail.com',
  image: null,
};

// Shape read by AdminDashboard from GET /api/admin/health
const HEALTH = {
  status: 'healthy' as const,
  timestamp: '2026-07-04T00:00:00.000Z',
  version: '1.2.3',
  environment: 'production',
  uptime: 90061, // 1d 1h 1m
  responseTime: '42ms',
  services: {
    database: 'ok',
    email: 'ok',
    env_config: 'ok',
  },
};

function mockFetchOk(payload: unknown = HEALTH) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => payload,
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchOk();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders the current-session user and embeds the UptimeStatus stub', async () => {
    render(<AdminDashboard user={USER} />);

    // The "Sesión Actual" card only renders once the health fetch resolves
    expect(await screen.findByText('Javier Zader')).toBeInTheDocument();
    expect(screen.getByText('jnzader@gmail.com')).toBeInTheDocument();

    // The embedded child is stubbed, not the real component
    expect(screen.getByTestId('uptime')).toBeInTheDocument();
  });

  it('calls signOut with the "/" callbackUrl when clicking "Cerrar sesión"', async () => {
    render(<AdminDashboard user={USER} />);

    // Wait for the initial load so state settles before interacting
    await screen.findByText('Javier Zader');

    fireEvent.click(screen.getByRole('button', { name: /cerrar sesión/i }));

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/' });
  });

  it('fetches /api/admin/health and renders the returned health data', async () => {
    const fetchMock = mockFetchOk();
    render(<AdminDashboard user={USER} />);

    // Values from the mocked payload surface in the overview cards
    expect(await screen.findByText('v1.2.3')).toBeInTheDocument();
    expect(screen.getByText('production')).toBeInTheDocument();
    expect(screen.getByText('42ms')).toBeInTheDocument();
    // uptime 90061s → "1d 1h 1m" via formatUptime
    expect(screen.getByText('1d 1h 1m')).toBeInTheDocument();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/admin/health');
    });
  });
});
