import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('homepage should match screenshot', async ({ page }) => {
    await page.goto('/');

    // Wait for images to load
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('blog page should match screenshot', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('blog.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('contact form should match screenshot', async ({ page }) => {
    await page.goto('/contacto');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('contact.png', {
      maxDiffPixels: 50,
    });
  });

  test('dark mode should match screenshot', async ({ page }) => {
    await page.goto('/');

    // Toggle dark mode
    const themeToggle = page.getByRole('button', { name: /tema/i });
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(300);

      await expect(page).toHaveScreenshot('homepage-dark.png', {
        fullPage: true,
        maxDiffPixels: 100,
      });
    }
  });
});
