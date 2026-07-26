import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@/__tests__/test-utils';
import { FeaturedProjectsRail } from '@/components/projects/FeaturedProjectsRail';

function renderRail(itemCount = 3) {
  return render(
    <FeaturedProjectsRail itemCount={itemCount}>
      <li data-featured-project-item>
        <a href="/proyectos/alpha">Alpha</a>
      </li>
      <li data-featured-project-item>
        <a href="/proyectos/beta">Beta</a>
      </li>
      <li data-featured-project-item>
        <a href="/proyectos/gamma">Gamma</a>
      </li>
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

function readTranslateX(indicator: HTMLElement) {
  const match = /translateX\((-?\d+(?:\.\d+)?)%\)/.exec(indicator.style.transform);

  if (!match) {
    throw new Error(`Unexpected indicator transform: ${indicator.style.transform}`);
  }

  return Number.parseFloat(match[1]);
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

  it('renders no previous or next arrow controls', () => {
    renderRail();

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /anterior|siguiente|previous|next/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/anterior|siguiente|previous|next/i)).not.toBeInTheDocument();
  });

  it('renders a purely decorative progress indicator when more than one project exists', () => {
    renderRail(3);

    const progress = screen.getByTestId('featured-projects-progress');
    expect(progress).toHaveAttribute('aria-hidden', 'true');
    expect(progress).not.toHaveAttribute('role');
    expect(progress).not.toHaveAttribute('tabindex');
    expect(screen.getByTestId('featured-projects-progress-indicator')).toBeInTheDocument();
  });

  it('omits the progress indicator when the rail cannot overflow', () => {
    renderRail(1);

    expect(screen.queryByTestId('featured-projects-progress')).not.toBeInTheDocument();
  });

  it('moves scrollLeft predictably during a mouse drag and restores snap on release', () => {
    renderRail();
    const rail = screen.getByTestId('featured-projects-rail');
    setRailGeometry(rail, { clientWidth: 600, scrollWidth: 912, scrollLeft: 100 });

    fireEvent.pointerDown(rail, { pointerId: 1, pointerType: 'mouse', button: 0, clientX: 300 });
    fireEvent.pointerMove(rail, { pointerId: 1, clientX: 250 });
    expect(rail.scrollLeft).toBe(150);

    fireEvent.pointerMove(rail, { pointerId: 1, clientX: 350 });
    expect(rail.scrollLeft).toBe(50);

    fireEvent.pointerUp(rail, { pointerId: 1 });
    expect(rail.style.scrollSnapType).toBe('');
  });

  it('toggles the grabbing cursor and disables scroll snap only while dragging', () => {
    renderRail();
    const rail = screen.getByTestId('featured-projects-rail');
    setRailGeometry(rail, { clientWidth: 600, scrollWidth: 912, scrollLeft: 100 });

    expect(rail).toHaveClass('cursor-grab');

    fireEvent.pointerDown(rail, { pointerId: 1, pointerType: 'mouse', button: 0, clientX: 300 });
    fireEvent.pointerMove(rail, { pointerId: 1, clientX: 280 });

    expect(rail).toHaveClass('cursor-grabbing');
    expect(rail.style.scrollSnapType).toBe('none');

    fireEvent.pointerUp(rail, { pointerId: 1 });

    expect(rail).toHaveClass('cursor-grab');
    expect(rail).not.toHaveClass('cursor-grabbing');
    expect(rail.style.scrollSnapType).toBe('');
  });

  it('restores cursor and snap when the drag is cancelled', () => {
    renderRail();
    const rail = screen.getByTestId('featured-projects-rail');
    setRailGeometry(rail, { clientWidth: 600, scrollWidth: 912, scrollLeft: 100 });

    fireEvent.pointerDown(rail, { pointerId: 1, pointerType: 'mouse', button: 0, clientX: 300 });
    fireEvent.pointerMove(rail, { pointerId: 1, clientX: 260 });
    expect(rail.style.scrollSnapType).toBe('none');

    fireEvent.pointerCancel(rail, { pointerId: 1 });

    expect(rail).toHaveClass('cursor-grab');
    expect(rail.style.scrollSnapType).toBe('');
  });

  it('keeps links clickable after a cancelled drag (pointercancel is not followed by click)', () => {
    renderRail();
    const rail = screen.getByTestId('featured-projects-rail');
    setRailGeometry(rail, { clientWidth: 600, scrollWidth: 912, scrollLeft: 100 });

    fireEvent.pointerDown(rail, { pointerId: 1, pointerType: 'mouse', button: 0, clientX: 300 });
    fireEvent.pointerMove(rail, { pointerId: 1, clientX: 260 });
    fireEvent.pointerCancel(rail, { pointerId: 1 });

    // A click after pointercancel is a genuine user click and must NOT be swallowed.
    const link = screen.getByRole('link', { name: 'Alpha' });
    expect(fireEvent.click(link)).toBe(true);
  });

  it('clears stale click suppression on the next pointerdown', () => {
    renderRail();
    const rail = screen.getByTestId('featured-projects-rail');
    setRailGeometry(rail, { clientWidth: 600, scrollWidth: 912, scrollLeft: 100 });

    // Real drag ending in pointerup sets the suppression flag, but no click
    // arrives to consume it (e.g. the browser swallowed the synthesized click).
    fireEvent.pointerDown(rail, { pointerId: 1, pointerType: 'mouse', button: 0, clientX: 300 });
    fireEvent.pointerMove(rail, { pointerId: 1, clientX: 240 });
    fireEvent.pointerUp(rail, { pointerId: 1 });

    // The next interaction must start with a clean slate.
    fireEvent.pointerDown(rail, { pointerId: 2, pointerType: 'mouse', button: 0, clientX: 300 });

    const link = screen.getByRole('link', { name: 'Alpha' });
    expect(fireEvent.click(link)).toBe(true);
  });

  it('ignores sub-threshold pointer movement and keeps links clickable', () => {
    renderRail();
    const rail = screen.getByTestId('featured-projects-rail');
    setRailGeometry(rail, { clientWidth: 600, scrollWidth: 912, scrollLeft: 100 });

    fireEvent.pointerDown(rail, { pointerId: 1, pointerType: 'mouse', button: 0, clientX: 300 });
    fireEvent.pointerMove(rail, { pointerId: 1, clientX: 298 });
    fireEvent.pointerUp(rail, { pointerId: 1 });

    expect(rail.scrollLeft).toBe(100);
    expect(rail).not.toHaveClass('cursor-grabbing');
    expect(fireEvent.click(screen.getByRole('link', { name: 'Alpha' }))).toBe(true);
  });

  it('suppresses only the first click after a real drag', () => {
    renderRail();
    const rail = screen.getByTestId('featured-projects-rail');
    setRailGeometry(rail, { clientWidth: 600, scrollWidth: 912, scrollLeft: 100 });

    fireEvent.pointerDown(rail, { pointerId: 1, pointerType: 'mouse', button: 0, clientX: 300 });
    fireEvent.pointerMove(rail, { pointerId: 1, clientX: 240 });
    fireEvent.pointerUp(rail, { pointerId: 1 });

    const link = screen.getByRole('link', { name: 'Alpha' });
    expect(fireEvent.click(link)).toBe(false);
    expect(fireEvent.click(link)).toBe(true);
  });

  it('leaves native touch scrolling untouched', () => {
    renderRail();
    const rail = screen.getByTestId('featured-projects-rail');
    setRailGeometry(rail, { clientWidth: 600, scrollWidth: 912, scrollLeft: 100 });

    fireEvent.pointerDown(rail, { pointerId: 2, pointerType: 'touch', button: 0, clientX: 300 });
    fireEvent.pointerMove(rail, { pointerId: 2, pointerType: 'touch', clientX: 200 });
    fireEvent.pointerUp(rail, { pointerId: 2, pointerType: 'touch' });

    expect(rail.scrollLeft).toBe(100);
    expect(rail).not.toHaveClass('cursor-grabbing');
    expect(rail.style.touchAction).not.toBe('none');
    expect(rail.style.scrollSnapType).toBe('');
  });

  it('keeps every project link keyboard reachable', () => {
    renderRail();

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/proyectos/alpha',
      '/proyectos/beta',
      '/proyectos/gamma',
    ]);
  });

  it('tracks scroll position in the progress indicator', () => {
    renderRail();
    const rail = screen.getByTestId('featured-projects-rail');
    const indicator = screen.getByTestId('featured-projects-progress-indicator');

    setRailGeometry(rail, { clientWidth: 600, scrollWidth: 912, scrollLeft: 0 });
    fireEvent.scroll(rail);

    expect(Number.parseFloat(indicator.style.width)).toBeCloseTo((600 / 912) * 100, 1);
    expect(readTranslateX(indicator)).toBeCloseTo(0, 1);

    Object.defineProperty(rail, 'scrollLeft', { configurable: true, value: 312, writable: true });
    fireEvent.scroll(rail);

    expect(readTranslateX(indicator)).toBeCloseTo(52, 0);

    Object.defineProperty(rail, 'scrollLeft', { configurable: true, value: 156, writable: true });
    fireEvent.scroll(rail);

    expect(readTranslateX(indicator)).toBeCloseTo(26, 0);
  });

  it('updates the progress indicator from ResizeObserver after geometry changes', () => {
    renderRail();
    const rail = screen.getByTestId('featured-projects-rail');
    const indicator = screen.getByTestId('featured-projects-progress-indicator');

    setRailGeometry(rail, { clientWidth: 600, scrollWidth: 912, scrollLeft: 0 });
    triggerRailResize();
    expect(Number.parseFloat(indicator.style.width)).toBeCloseTo((600 / 912) * 100, 1);

    setRailGeometry(rail, { clientWidth: 912, scrollWidth: 912, scrollLeft: 0 });
    triggerRailResize();
    expect(Number.parseFloat(indicator.style.width)).toBeCloseTo(100, 1);
    expect(readTranslateX(indicator)).toBeCloseTo(0, 1);
  });

  it('never scrolls programmatically, even when reduced motion is preferred', () => {
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
    vi.useFakeTimers();
    renderRail();
    const rail = screen.getByTestId('featured-projects-rail');
    const scrollBy = vi.fn();
    const scrollTo = vi.fn();
    Object.defineProperty(rail, 'scrollBy', { configurable: true, value: scrollBy });
    Object.defineProperty(rail, 'scrollTo', { configurable: true, value: scrollTo });
    setRailGeometry(rail, { clientWidth: 600, scrollWidth: 912, scrollLeft: 100 });

    fireEvent.pointerDown(rail, { pointerId: 1, pointerType: 'mouse', button: 0, clientX: 300 });
    fireEvent.pointerMove(rail, { pointerId: 1, clientX: 240 });
    fireEvent.pointerUp(rail, { pointerId: 1 });
    vi.advanceTimersByTime(60_000);

    expect(scrollBy).not.toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalled();
    expect(rail.scrollLeft).toBe(160);
  });
});
