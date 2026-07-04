import { fireEvent, render, screen, waitFor } from '@/__tests__/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UptimeStatus } from '@/components/admin/UptimeStatus';

const mockFetch = vi.fn();

// Shape the component reads: { configured, monitors: [{ id, name, url, status,
// statusCode, responseTime, uptime: { day, week, month }, logs: [] }], timestamp }
function uptimePayload() {
  return {
    configured: true,
    timestamp: '2026-07-04T10:00:00.000Z',
    monitors: [
      {
        id: 1,
        name: 'Portfolio Prod',
        url: 'https://javierzader.com',
        status: 'up',
        statusCode: 200,
        responseTime: 142,
        uptime: { day: 100, week: 99.98, month: 99.95 },
        logs: [],
      },
    ],
  };
}

describe('UptimeStatus (admin)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('fetches /api/admin/uptime on mount and renders the monitor data', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => uptimePayload(),
    });

    render(<UptimeStatus />);

    // Calls the right endpoint on mount
    expect(mockFetch).toHaveBeenCalledWith('/api/admin/uptime');

    // After the promise resolves, monitor data renders
    expect(await screen.findByText('Portfolio Prod')).toBeInTheDocument();
    expect(screen.getByText('https://javierzader.com')).toBeInTheDocument();
    expect(screen.getByText('142ms')).toBeInTheDocument();
  });

  it('shows the error UI when the fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('Network down'));

    render(<UptimeStatus />);

    expect(await screen.findByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Network down')).toBeInTheDocument();
    // Retry button is offered
    expect(screen.getByRole('button', { name: /Reintentar/i })).toBeInTheDocument();
  });

  it('re-fetches when the refresh button is clicked', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => uptimePayload(),
    });

    render(<UptimeStatus />);

    // Wait for the initial load to settle (data rendered = refresh button present)
    await screen.findByText('Portfolio Prod');
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // The success view header has an icon-only refresh button (the last button)
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[buttons.length - 1]);

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
  });
});
