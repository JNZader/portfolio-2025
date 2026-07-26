'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

const SCROLL_DIRECTION = {
  previous: -1,
  next: 1,
} as const;

type ScrollDirection = (typeof SCROLL_DIRECTION)[keyof typeof SCROLL_DIRECTION];

interface FeaturedProjectsRailProps {
  children: ReactNode;
  itemCount: number;
  previousLabel: string;
  nextLabel: string;
}

const BOUNDARY_TOLERANCE = 1;

function getScrollStep(rail: HTMLElement) {
  const firstItem = rail.querySelector<HTMLElement>('[data-featured-project-item]');

  if (!firstItem) return 0;

  const styles = globalThis.getComputedStyle(rail);
  const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;

  return firstItem.getBoundingClientRect().width + gap;
}

export function FeaturedProjectsRail({
  children,
  itemCount,
  previousLabel,
  nextLabel,
}: Readonly<FeaturedProjectsRailProps>) {
  const railRef = useRef<HTMLUListElement>(null);
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(itemCount > 1);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const updateControls = () => {
      const maximumScroll = rail.scrollWidth - rail.clientWidth;

      if (rail.scrollWidth === 0 && rail.clientWidth === 0) return;

      setCanScrollPrevious(rail.scrollLeft > BOUNDARY_TOLERANCE);
      setCanScrollNext(rail.scrollLeft < maximumScroll - BOUNDARY_TOLERANCE);
    };

    updateControls();
    rail.addEventListener('scroll', updateControls, { passive: true });

    const resizeObserver = new ResizeObserver(updateControls);
    resizeObserver.observe(rail);

    return () => {
      rail.removeEventListener('scroll', updateControls);
      resizeObserver.disconnect();
    };
  }, []);

  const moveByOneCard = (direction: ScrollDirection) => {
    const rail = railRef.current;
    if (!rail) return;

    const step = getScrollStep(rail);
    if (step === 0) return;

    const reducedMotion = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
    rail.scrollBy({
      left: direction * step,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <div className="min-w-0 max-w-full">
      {itemCount > 1 && (
        <div className="mb-4 hidden justify-end gap-2 sm:flex">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={previousLabel}
            aria-controls="featured-projects-rail"
            disabled={!canScrollPrevious}
            onClick={() => moveByOneCard(SCROLL_DIRECTION.previous)}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={nextLabel}
            aria-controls="featured-projects-rail"
            disabled={!canScrollNext}
            onClick={() => moveByOneCard(SCROLL_DIRECTION.next)}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      )}

      <ul
        ref={railRef}
        id="featured-projects-rail"
        className="m-0 flex list-none items-stretch gap-6 overflow-x-auto overscroll-x-contain p-0 pb-4 snap-x snap-mandatory"
        data-testid="featured-projects-rail"
        data-scroll-snap="x mandatory"
      >
        {children}
      </ul>
    </div>
  );
}
