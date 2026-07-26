import { expect, test } from '../fixtures/test';
import {
  skipIfPortfolioServerBlocked,
  skipIfSanityEnvironmentBlocked,
} from '../fixtures/portfolio-server';
import { dismissCookieConsent } from '../fixtures/test-data';

const PIXEL_TOLERANCE = 2;
const MINIMUM_PROJECT_COUNT = 4;

const VIEWPORT_CASES = [
  { name: 'desktop', width: 1440, height: 1000, fullyVisibleCards: 3, expectsPeek: false },
  { name: 'tablet', width: 768, height: 1000, fullyVisibleCards: 2, expectsPeek: false },
  { name: 'mobile', width: 390, height: 844, fullyVisibleCards: 1, expectsPeek: true },
] as const;

interface CardGeometry {
  height: number;
  left: number;
  right: number;
  width: number;
}

function expectEqualDimensions(
  geometries: CardGeometry[],
  dimension: 'height' | 'width',
  viewportName: string
) {
  const values = geometries.map((geometry) => geometry[dimension]);
  expect(
    Math.max(...values) - Math.min(...values),
    `${viewportName} featured card ${dimension}s`
  ).toBeLessThanOrEqual(PIXEL_TOLERANCE);
}

test.describe('Featured projects responsive rail', () => {
  test.beforeEach(async () => {
    await skipIfPortfolioServerBlocked();
    await skipIfSanityEnvironmentBlocked();
  });

  test('keeps equal cards contained in a responsive, horizontally scrollable rail', async ({
    page,
  }) => {
    for (const viewport of VIEWPORT_CASES) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await dismissCookieConsent(page);

      const section = page.locator('#featured-projects');
      await expect(section, `${viewport.name} section anchor`).toBeVisible();
      await expect(section).toHaveAttribute('id', 'featured-projects');
      await section.scrollIntoViewIfNeeded();
      await page.evaluate(() => document.fonts.ready);

      const cta = section.getByRole('link', { name: 'Ver todos los proyectos' });
      await expect(cta, `${viewport.name} projects CTA`).toHaveAttribute('href', '/proyectos');

      const rail = section.getByTestId('featured-projects-rail');
      const cards = rail.getByTestId('featured-project-card');
      await expect(cards.first()).toBeVisible();
      expect(
        await cards.count(),
        `${viewport.name} requires enough featured projects to verify overflow geometry`
      ).toBeGreaterThanOrEqual(MINIMUM_PROJECT_COUNT);

      const railGeometry = await rail.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        return {
          clientWidth: element.clientWidth,
          left: bounds.left,
          right: bounds.right,
          scrollWidth: element.scrollWidth,
        };
      });
      const cardGeometries = await cards.evaluateAll((elements) =>
        elements.map((element) => {
          const bounds = element.getBoundingClientRect();
          return {
            height: bounds.height,
            left: bounds.left,
            right: bounds.right,
            width: bounds.width,
          };
        })
      );

      expectEqualDimensions(cardGeometries, 'width', viewport.name);
      expectEqualDimensions(cardGeometries, 'height', viewport.name);
      expect(
        railGeometry.scrollWidth,
        `${viewport.name} rail should overflow its own viewport`
      ).toBeGreaterThan(railGeometry.clientWidth + PIXEL_TOLERANCE);

      const visibleRatios = cardGeometries.map((card) => {
        const visibleWidth = Math.max(
          0,
          Math.min(card.right, railGeometry.right) - Math.max(card.left, railGeometry.left)
        );
        return visibleWidth / card.width;
      });
      const fullyVisibleCards = visibleRatios.filter((ratio) => ratio >= 0.98).length;
      const peekedCards = visibleRatios.filter((ratio) => ratio >= 0.03 && ratio < 0.98);

      expect(fullyVisibleCards, `${viewport.name} fully visible cards`).toBe(
        viewport.fullyVisibleCards
      );
      if (viewport.expectsPeek) {
        expect(peekedCards, 'mobile should expose one additional card as a small peek').toHaveLength(
          1
        );
        expect(peekedCards[0], 'mobile card peek should remain small').toBeLessThanOrEqual(0.25);
      } else {
        expect(peekedCards, `${viewport.name} should not show a partial extra card`).toHaveLength(0);
      }

      const pageWidths = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
      }));
      expect(
        pageWidths.scrollWidth,
        `${viewport.name} page-level horizontal containment`
      ).toBeLessThanOrEqual(pageWidths.viewportWidth);
    }
  });
});
