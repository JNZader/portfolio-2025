import { test, expect } from '@playwright/test';
import { dismissCookieConsent } from '../fixtures/test-data';

// Skip visual regression tests on CI - snapshots are platform-specific (win32 vs linux)
test.describe('Visual Regression', () => {
  test.skip(!!process.env.CI, 'Visual regression tests are skipped on CI due to platform-specific snapshots');

  test('homepage should match screenshot', async ({ page }) => {
    await page.goto('/');
    await dismissCookieConsent(page);

    // Wait for images and animations to settle
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Take screenshot with tolerance for dynamic content
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05, // Allow up to 5% difference
    });
  });

  test('blog page should match screenshot', async ({ page }) => {
    await page.goto('/blog');
    await dismissCookieConsent(page);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('blog.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test('contact form should match screenshot', async ({ page }) => {
    await page.goto('/contacto');
    await dismissCookieConsent(page);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('contact.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('dark mode should match screenshot', async ({ page }) => {
    await page.goto('/');
    await dismissCookieConsent(page);

    // Toggle dark mode
    const themeToggle = page.getByRole('button', { name: /cambiar a modo/i });
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('homepage-dark.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
      });
    }
  });
});
