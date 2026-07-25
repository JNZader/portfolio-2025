import { expect, test } from '../fixtures/test';
import { dismissCookieConsent } from '../fixtures/test-data';

const statLabels = {
  es: ['Años en Tecnología', 'Sistemas End-to-End', 'Certificaciones', 'Tecnologías'],
  en: ['Years in Tech', 'End-to-End Systems', 'Certifications', 'Technologies'],
} as const;

test.describe('Homepage quick stats', () => {
  test('does not render the quick stats grid on home', async ({ page }) => {
    for (const width of [767, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const locale of [
        { path: '/', name: 'es' as const },
        { path: '/en', name: 'en' as const },
      ]) {
        await page.goto(locale.path);
        await dismissCookieConsent(page);

        for (const label of statLabels[locale.name]) {
          await expect(page.getByText(label, { exact: true })).toHaveCount(0);
        }
      }
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
    test(`keeps stat labels absent and decorative icons hidden (${locale.name})`, async ({ page }) => {
      await page.goto(locale.path);
      await dismissCookieConsent(page);

      for (const label of statLabels[locale.name]) {
        await expect(page.getByText(label, { exact: true })).toHaveCount(0);
      }
    });
  }
});
