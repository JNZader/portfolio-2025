import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('homepage should match screenshot', async ({ page }) => {
    await page.goto('/');

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
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('blog.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test('contact form should match screenshot', async ({ page }) => {
    await page.goto('/contacto');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('contact.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('dark mode should match screenshot', async ({ page }) => {
    await page.goto('/');

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
