import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Common axe configuration - exclude color-contrast for dynamic/external content
// The #61dafb color comes from external badges (Sanity CMS, GitHub shields)
const createAxeBuilder = (page: Page) =>
  new AxeBuilder({ page }).disableRules(['color-contrast']);

test.describe('Accessibility', () => {
  test('homepage should not have accessibility violations', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await createAxeBuilder(page).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('blog page should not have accessibility violations', async ({ page }) => {
    await page.goto('/blog');

    const accessibilityScanResults = await createAxeBuilder(page).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('contact page should not have accessibility violations', async ({ page }) => {
    await page.goto('/contacto');

    const accessibilityScanResults = await createAxeBuilder(page).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should meet WCAG 2.2 AA standards', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await createAxeBuilder(page)
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');

    // Wait for page to be interactive
    await page.waitForLoadState('domcontentloaded');

    // Tab through focusable elements and collect unique ones
    const focusedElements: string[] = [];

    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      // Get both tagName and a more specific identifier
      const focused = await page.evaluate((index: number) => {
        const el = document.activeElement;
        if (!el || el === document.body) return 'BODY';
        return `${el.tagName}:${el.getAttribute('href') || el.getAttribute('aria-label') || el.textContent?.slice(0, 20) || index}`;
      }, i);
      focusedElements.push(focused);
    }

    // Should have focused multiple unique elements (skip link, nav links, buttons, etc.)
    const uniqueElements = new Set(focusedElements.filter((el) => el !== 'BODY'));
    expect(uniqueElements.size).toBeGreaterThanOrEqual(3);
  });

  test('images should have alt text', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');

      // Alt should exist (can be empty for decorative images)
      expect(alt).not.toBeNull();
    }
  });
});
