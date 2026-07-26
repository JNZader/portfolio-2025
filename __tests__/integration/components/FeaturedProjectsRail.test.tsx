import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@/__tests__/test-utils';
import { FeaturedProjectsRail } from '@/components/projects/FeaturedProjectsRail';

function renderRail() {
  return render(
    <FeaturedProjectsRail
      itemCount={3}
      previousLabel="Proyecto anterior"
      nextLabel="Proyecto siguiente"
    >
      <li data-featured-project-item>Alpha</li>
      <li data-featured-project-item>Beta</li>
      <li data-featured-project-item>Gamma</li>
    </FeaturedProjectsRail>
  );
}

interface RailGeometry {
  clientWidth: number;
  scrollLeft: number;
  scrollWidth: number;
}

let resizeObserverCallback: ResizeObserverCallback | undefined;
let resizeObserverInstance: ResizeObserver | undefined;

class ControllableResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    resizeObserverCallback = callback;
    resizeObserverInstance = this as unknown as ResizeObserver;
  }

  disconnect() {}
  observe() {}
  takeRecords(): ResizeObserverEntry[] {
    return [];
  }
  unobserve() {}
}

function triggerRailResize() {
  if (!resizeObserverCallback || !resizeObserverInstance) {
    throw new Error('ResizeObserver was not initialized');
  }

  resizeObserverCallback([], resizeObserverInstance);
}

function setRailGeometry(rail: HTMLElement, geometry: RailGeometry) {
  Object.defineProperties(rail, {
    clientWidth: { configurable: true, value: geometry.clientWidth },
    scrollWidth: { configurable: true, value: geometry.scrollWidth },
    scrollLeft: { configurable: true, value: geometry.scrollLeft, writable: true },
  });
}

describe('FeaturedProjectsRail', () => {
  beforeEach(() => {
    resizeObserverCallback = undefined;
    resizeObserverInstance = undefined;
    vi.stubGlobal('ResizeObserver', ControllableResizeObserver);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('advances each direction by exactly one measured card plus the rendered gap', async () => {
    renderRail();
    const rail = screen.getByTestId('featured-projects-rail');
    const firstCard = rail.querySelector<HTMLElement>('[data-featured-project-item]');
    const scrollBy = vi.fn();

    expect(firstCard).not.toBeNull();
    vi.spyOn(firstCard as HTMLElement, 'getBoundingClientRect').mockReturnValue({
      bottom: 0,
      height: 400,
      left: 0,
      right: 280,
      top: 0,
      width: 280,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    Object.defineProperty(rail, 'scrollBy', { configurable: true, value: scrollBy });
    rail.style.columnGap = '24px';
    setRailGeometry(rail, { clientWidth: 600, scrollWidth: 912, scrollLeft: 100 });
    fireEvent.scroll(rail);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Proyecto anterior' })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Proyecto siguiente' }));
    fireEvent.click(screen.getByRole('button', { name: 'Proyecto anterior' }));

    expect(scrollBy).toHaveBeenNthCalledWith(1, { left: 304, behavior: 'smooth' });
    expect(scrollBy).toHaveBeenNthCalledWith(2, { left: -304, behavior: 'smooth' });
  });

  it('updates disabled states at the start and end of the rail', async () => {
    renderRail();
    const rail = screen.getByTestId('featured-projects-rail');
    const previous = screen.getByRole('button', { name: 'Proyecto anterior' });
    const next = screen.getByRole('button', { name: 'Proyecto siguiente' });

    setRailGeometry(rail, { clientWidth: 600, scrollWidth: 912, scrollLeft: 0 });
    fireEvent.scroll(rail);

    await waitFor(() => {
      expect(previous).toBeDisabled();
      expect(next).toBeEnabled();
    });

    Object.defineProperty(rail, 'scrollLeft', { configurable: true, value: 312 });
    fireEvent.scroll(rail);

    await waitFor(() => {
      expect(previous).toBeEnabled();
      expect(next).toBeDisabled();
    });
  });

  it('updates disabled states from ResizeObserver after responsive geometry changes', async () => {
    renderRail();
    const rail = screen.getByTestId('featured-projects-rail');
    const previous = screen.getByRole('button', { name: 'Proyecto anterior' });
    const next = screen.getByRole('button', { name: 'Proyecto siguiente' });

    setRailGeometry(rail, { clientWidth: 600, scrollWidth: 912, scrollLeft: 0 });
    triggerRailResize();

    await waitFor(() => {
      expect(previous).toBeDisabled();
      expect(next).toBeEnabled();
    });

    setRailGeometry(rail, { clientWidth: 912, scrollWidth: 912, scrollLeft: 0 });
    triggerRailResize();

    await waitFor(() => {
      expect(previous).toBeDisabled();
      expect(next).toBeDisabled();
    });

    setRailGeometry(rail, { clientWidth: 500, scrollWidth: 912, scrollLeft: 412 });
    triggerRailResize();

    await waitFor(() => {
      expect(previous).toBeEnabled();
      expect(next).toBeDisabled();
    });
  });

  it('uses instant movement when reduced motion is preferred', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    }));
    renderRail();
    const rail = screen.getByTestId('featured-projects-rail');
    const firstCard = rail.querySelector<HTMLElement>('[data-featured-project-item]');
    const scrollBy = vi.fn();

    expect(firstCard).not.toBeNull();
    vi.spyOn(firstCard as HTMLElement, 'getBoundingClientRect').mockReturnValue({
      bottom: 0,
      height: 400,
      left: 0,
      right: 280,
      top: 0,
      width: 280,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    Object.defineProperty(rail, 'scrollBy', { configurable: true, value: scrollBy });
    rail.style.columnGap = '24px';

    fireEvent.click(screen.getByRole('button', { name: 'Proyecto siguiente' }));

    expect(scrollBy).toHaveBeenCalledWith({ left: 304, behavior: 'auto' });
  });

  it('never advances without manual interaction', () => {
    vi.useFakeTimers();
    renderRail();
    const rail = screen.getByTestId('featured-projects-rail');
    const scrollBy = vi.fn();
    Object.defineProperty(rail, 'scrollBy', { configurable: true, value: scrollBy });

    vi.advanceTimersByTime(60_000);

    expect(scrollBy).not.toHaveBeenCalled();
  });
});
