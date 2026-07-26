'use client';

import {
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/utils/cn';

const DRAG_THRESHOLD_PX = 4;

interface FeaturedProjectsRailProps {
  children: ReactNode;
  itemCount: number;
}

interface DragState {
  pointerId: number;
  startClientX: number;
  startScrollLeft: number;
  isDragging: boolean;
}

export function FeaturedProjectsRail({ children, itemCount }: Readonly<FeaturedProjectsRailProps>) {
  const railRef = useRef<HTMLUListElement>(null);
  const progressIndicatorRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const updateProgress = () => {
      const indicator = progressIndicatorRef.current;
      if (!indicator) return;

      const maximumScroll = rail.scrollWidth - rail.clientWidth;

      if (rail.scrollWidth === 0 || maximumScroll <= 0) {
        indicator.style.width = '100%';
        indicator.style.transform = 'translateX(0%)';
        return;
      }

      const visibleRatio = rail.clientWidth / rail.scrollWidth;
      const progress = rail.scrollLeft / maximumScroll;

      indicator.style.width = `${visibleRatio * 100}%`;
      indicator.style.transform = `translateX(${progress * (100 / visibleRatio - 100)}%)`;
    };

    updateProgress();
    rail.addEventListener('scroll', updateProgress, { passive: true });

    const resizeObserver = new ResizeObserver(updateProgress);
    resizeObserver.observe(rail);

    return () => {
      rail.removeEventListener('scroll', updateProgress);
      resizeObserver.disconnect();
    };
  }, []);

  const capturePointer = (rail: HTMLUListElement, pointerId: number) => {
    try {
      rail.setPointerCapture(pointerId);
    } catch {
      // Environments without an active pointer (tests, older browsers) cannot capture.
    }
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLUListElement>) => {
    // Touch keeps native swipe; only primary-button mouse drags are intercepted.
    if (event.button !== 0 || event.pointerType === 'touch') return;

    const rail = railRef.current;
    if (!rail) return;

    // Defensively clear stale suppression from any previous interaction so it
    // can never leak into the next click (e.g. after pointercancel).
    suppressClickRef.current = false;

    dragStateRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startScrollLeft: rail.scrollLeft,
      isDragging: false,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLUListElement>) => {
    const dragState = dragStateRef.current;
    const rail = railRef.current;
    if (!dragState || !rail || event.pointerId !== dragState.pointerId) return;

    const delta = event.clientX - dragState.startClientX;

    if (!dragState.isDragging) {
      if (Math.abs(delta) < DRAG_THRESHOLD_PX) return;

      dragState.isDragging = true;
      capturePointer(rail, dragState.pointerId);
      rail.style.scrollSnapType = 'none';
      setIsDragging(true);
    }

    rail.scrollLeft = dragState.startScrollLeft - delta;
  };

  const endDrag = (event: ReactPointerEvent<HTMLUListElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || event.pointerId !== dragState.pointerId) return false;

    const rail = railRef.current;
    const wasDragging = dragState.isDragging;

    if (rail && wasDragging) {
      // Restoring snap lets native scroll settle at the nearest card.
      rail.style.scrollSnapType = '';
      setIsDragging(false);
    }

    dragStateRef.current = null;
    return wasDragging;
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLUListElement>) => {
    // A genuine post-drag click follows pointerup, so suppress it once.
    if (endDrag(event)) {
      suppressClickRef.current = true;
    }
  };

  const handlePointerCancel = (event: ReactPointerEvent<HTMLUListElement>) => {
    // Per UI Events, pointercancel is NOT followed by a click, so any
    // suppression flag set here would never be consumed and would swallow
    // the next genuine click. Reset drag state without suppressing.
    endDrag(event);
  };

  const handleClickCapture = (event: ReactMouseEvent<HTMLUListElement>) => {
    if (!suppressClickRef.current) return;

    suppressClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="min-w-0 max-w-full">
      <ul
        ref={railRef}
        id="featured-projects-rail"
        className={cn(
          'm-0 flex list-none items-stretch gap-6 overflow-x-auto overscroll-x-contain p-0 pb-4 snap-x snap-mandatory',
          isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
        )}
        data-testid="featured-projects-rail"
        data-scroll-snap="x mandatory"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onClickCapture={handleClickCapture}
        onDragStart={(event) => event.preventDefault()}
      >
        {children}
      </ul>

      {itemCount > 1 && (
        <div
          aria-hidden="true"
          className="h-0.5 w-full overflow-hidden rounded-full bg-muted"
          data-testid="featured-projects-progress"
        >
          <div
            ref={progressIndicatorRef}
            className="h-full w-full rounded-full bg-muted-foreground/60"
            data-testid="featured-projects-progress-indicator"
          />
        </div>
      )}
    </div>
  );
}
