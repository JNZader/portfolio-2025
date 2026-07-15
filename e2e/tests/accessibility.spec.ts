import { test, expect, type Page } from '../fixtures/test';
import AxeBuilder from '@axe-core/playwright';
import { dismissCookieConsent } from '../fixtures/test-data';
import { contrastRatio } from '../helpers/contrast';

const createAxeBuilder = (page: Page) => new AxeBuilder({ page });

test.describe('Accessibility', () => {
  test('homepage should not have accessibility violations', async ({ page }) => {
    await page.goto('/');
    await dismissCookieConsent(page);

    const accessibilityScanResults = await createAxeBuilder(page).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('blog page should not have accessibility violations', async ({ page }) => {
    await page.goto('/blog');
    await dismissCookieConsent(page);

    const accessibilityScanResults = await createAxeBuilder(page).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('contact page should not have accessibility violations', async ({ page }) => {
    await page.goto('/contacto');
    await dismissCookieConsent(page);

    const accessibilityScanResults = await createAxeBuilder(page).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('English home and privacy states should not have accessibility violations', async ({ page }) => {
    for (const path of ['/en', '/en/privacy']) {
      await page.goto(path);
      await dismissCookieConsent(page);
      const results = await createAxeBuilder(page).analyze();
      expect(results.violations).toEqual([]);
    }
  });

  test('should meet WCAG 2.2 AA standards', async ({ page }) => {
    await page.goto('/');
    await dismissCookieConsent(page);

    const accessibilityScanResults = await createAxeBuilder(page)
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('SkillBadge labels meet AA contrast in both themes and hover states', async ({ page }) => {
    await page.goto('/');
    await dismissCookieConsent(page);
    const badge = page.locator('span').filter({ hasText: /^React$/ }).first();
    await expect(badge).toBeVisible();

    for (const dark of [false, true]) {
      await page.evaluate((isDark) => document.documentElement.classList.toggle('dark', isDark), dark);
      for (const state of ['normal', 'hover'] as const) {
        if (state === 'hover') await badge.hover();
        const colors = await badge.evaluate((element) => {
          const style = window.getComputedStyle(element);
          return { foreground: style.color, background: style.backgroundColor };
        });
        const ratio = contrastRatio(colors.foreground, colors.background);
        expect(ratio, `${dark ? 'dark' : 'light'} ${state} SkillBadge contrast`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  test('should be keyboard navigable', async ({ page, browserName }) => {
    // WebKit on CI doesn't properly handle Tab key focus - skip on webkit
    test.skip(browserName === 'webkit', 'WebKit Tab key behavior differs on CI');

    await page.goto('/');
    await dismissCookieConsent(page);

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
    await dismissCookieConsent(page);

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
