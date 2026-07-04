import { act, render, screen } from '@/__tests__/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HeroTerminal } from '@/components/sections/HeroTerminal';

/**
 * HeroTerminal replays a hardcoded `apigen` run char-by-char via a setTimeout
 * cascade. Animation output is inherently frame-dependent, so these tests only
 * assert STABLE facts: the always-rendered terminal chrome, the reduced-motion
 * short-circuit (everything instant), and that the hardcoded output eventually
 * surfaces once timers are flushed — never exact intermediate frames.
 */

// The component reads globalThis.matchMedia inside a useEffect. jsdom has no
// matchMedia, so provide a mock. Default: motion allowed (matches:false).
function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

// The header label is static chrome — rendered regardless of animation state.
const HEADER = /apigen — sql schema/;

describe('HeroTerminal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockMatchMedia(false);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders the terminal chrome without crashing', () => {
    render(<HeroTerminal />);

    // Stable landmark: the terminal title bar label always renders.
    expect(screen.getByText(HEADER)).toBeInTheDocument();
    // The explanatory tooltip copy is also static chrome.
    expect(screen.getByText(/Ejemplo real generado con apigen/)).toBeInTheDocument();
  });

  it('renders the full hardcoded output immediately under prefers-reduced-motion', () => {
    // Reduced motion → the effect sets done = SCRIPT.length synchronously,
    // so the whole script is present without advancing the timer cascade.
    mockMatchMedia(true);

    render(<HeroTerminal />);

    // No timer advance: final-act content is already on screen.
    expect(screen.getByText(/Generation complete — 199 files/)).toBeInTheDocument();
    // Content from the last act (the 404 branch) — proves the entire script rendered.
    expect(screen.getByText(/urn:apigen:problem:not-found/)).toBeInTheDocument();
  });

  it('reveals the hardcoded output as the timer cascade advances', async () => {
    render(<HeroTerminal />);

    // Nothing from the script body is revealed on the first frame.
    expect(screen.queryByText(/Generation complete — 199 files/)).toBeNull();

    // Flush the setTimeout cascade generously (real run is tens of seconds of
    // simulated time). We only assert that hardcoded output eventually appears.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(120_000);
    });

    expect(screen.getByText(/Generation complete — 199 files/)).toBeInTheDocument();
    // Chrome is still present after the run completes.
    expect(screen.getByText(HEADER)).toBeInTheDocument();
  });
});
