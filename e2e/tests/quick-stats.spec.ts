import { expect, test } from '../fixtures/test';
import { dismissCookieConsent } from '../fixtures/test-data';

const statLabels = {
  es: ['Años en Tecnología', 'Sistemas End-to-End', 'Certificaciones', 'Tecnologías'],
  en: ['Years in Tech', 'End-to-End Systems', 'Certifications', 'Technologies'],
} as const;

function statsGrid(page: import('@playwright/test').Page, locale: keyof typeof statLabels) {
  return page.getByText(statLabels[locale][0], { exact: true }).first().locator('xpath=../../..');
}

test.describe('Homepage quick stats', () => {
  test('uses two columns below md and four columns at md and desktop', async ({ page }) => {
    for (const [width, expectedColumns] of [
      [767, 2],
      [768, 4],
      [1440, 4],
    ] as const) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await dismissCookieConsent(page);

      await expect
        .poll(() => statsGrid(page, 'es').evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length))
        .toBe(expectedColumns);
    }
  });

  test('does not introduce horizontal overflow at responsive widths', async ({ page }) => {
    for (const width of [320, 767, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const locale of [
        { path: '/', name: 'es' as const },
        { path: '/en', name: 'en' as const },
      ]) {
        await page.goto(locale.path);
        await dismissCookieConsent(page);

        const dimensions = await page.evaluate(() => ({
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
        }));
        expect(dimensions.scrollWidth, `${locale.path} at ${width}px`).toBeLessThanOrEqual(
          dimensions.clientWidth
        );
      }
    }
  });

  for (const locale of [
    { path: '/', name: 'es' as const },
    { path: '/en', name: 'en' as const },
  ]) {
    test(`exposes localized stat labels with decorative icons hidden (${locale.name})`, async ({ page }) => {
      await page.goto(locale.path);
      await dismissCookieConsent(page);

      const grid = statsGrid(page, locale.name);
      await expect(grid).toHaveCount(1);
      await expect(grid.locator(':scope > div')).toHaveCount(4);

      for (const label of statLabels[locale.name]) {
        const labelLocator = page.getByText(label, { exact: true }).first();
        await expect(labelLocator).toBeVisible();
        await expect(labelLocator).toHaveText(label);
        await expect(labelLocator.locator('xpath=..').locator('svg[aria-hidden="true"]')).toHaveCount(1);
      }
    });
  }
});
