import { expect, test } from '@playwright/test';
import { dismissCookieConsent } from '../fixtures/test-data';

test.describe('Interior page visual UX', () => {
  test('interior pages have no horizontal overflow from 320 to 1440 pixels', async ({ page }) => {
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ['/proyectos', '/contacto', '/en/proyectos', '/en/contacto']) {
        await page.goto(path);
        await dismissCookieConsent(page);
        const dimensions = await page.evaluate(() => ({
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
        }));
        expect(dimensions.scrollWidth, `${path} at ${width}px`).toBeLessThanOrEqual(
          dimensions.clientWidth
        );
      }
    }
  });
});
