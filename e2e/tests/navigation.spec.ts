import { test, expect } from '@playwright/test';
import { dismissCookieConsent } from '../fixtures/test-data';

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page, viewport }) => {
    // Skip on mobile - nav is hidden in hamburger menu (tested separately)
    test.skip(!!viewport && viewport.width < 768, 'Desktop navigation test - skipped on mobile');

    await page.goto('/');
    await dismissCookieConsent(page);

    // Test header navigation
    const nav = page.getByRole('navigation', { name: /principal/i });

    // Home
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // About
    await nav.getByRole('link', { name: /sobre mí/i }).click();
    await expect(page).toHaveURL(/\/sobre-mi/);

    // Projects
    await nav.getByRole('link', { name: /proyectos/i }).click();
    await expect(page).toHaveURL(/\/proyectos/);

    // Blog
    await nav.getByRole('link', { name: /blog/i }).click();
    await expect(page).toHaveURL(/\/blog/);

    // Contact
    await nav.getByRole('link', { name: /contacto/i }).click();
    await expect(page).toHaveURL(/\/contacto/);
  });

  test('should have skip links', async ({ page }) => {
    await page.goto('/');
    await dismissCookieConsent(page);

    // Wait for page to be fully loaded and interactive
    await page.waitForLoadState('domcontentloaded');

    // Skip link should exist in the DOM (it's sr-only, so not visible until focused)
    const skipLink = page.getByRole('link', { name: /saltar al contenido principal/i });
    await expect(skipLink).toBeAttached();

    // Focus the skip link directly
    await skipLink.focus();

    // Wait briefly for focus styles to apply
    await page.waitForTimeout(100);

    // When focused, skip link should become visible (focus:not-sr-only)
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toBeFocused();

    // Click skip link
    await skipLink.click();

    // Wait for focus to move
    await page.waitForTimeout(100);

    // Focus should be on main content
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeFocused();
  });

  test('should toggle mobile menu', async ({ page, viewport }) => {
    // Skip on desktop - mobile menu is only visible on mobile
    test.skip(!viewport || viewport.width >= 768, 'Mobile menu test - skipped on desktop');

    await page.goto('/');
    await dismissCookieConsent(page);

    // Wait for page to be fully loaded
    await page.waitForLoadState('domcontentloaded');

    // Mobile menu button should be visible - matches "Abrir menú de navegación"
    const menuButton = page.getByRole('button', { name: /abrir menú/i });
    await expect(menuButton).toBeVisible({ timeout: 5000 });

    // Click to open
    await menuButton.click();

    // Wait for menu animation to complete
    await page.waitForTimeout(300);

    // Menu should be visible - look for the mobile menu nav with "Navegación móvil" aria-label
    const mobileMenu = page.getByRole('navigation', { name: /navegación móvil/i });
    await expect(mobileMenu).toBeVisible({ timeout: 5000 });

    // Click link
    await mobileMenu.getByRole('link', { name: /blog/i }).click();

    // Should navigate
    await expect(page).toHaveURL(/\/blog/);
  });

  test('should have footer links', async ({ page }) => {
    await page.goto('/');
    await dismissCookieConsent(page);

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const footer = page.locator('footer');

    // Privacy link
    await expect(footer.getByRole('link', { name: /privacidad/i })).toBeVisible();

    // Data request link (GDPR)
    await expect(footer.getByRole('link', { name: /datos.*gdpr/i })).toBeVisible();
  });
});

test.describe('Dark Mode', () => {
  test('should toggle dark mode', async ({ page }) => {
    await page.goto('/');
    await dismissCookieConsent(page);

    // Find theme toggle button
    const themeToggle = page.getByRole('button', { name: /cambiar a modo/i });

    if (await themeToggle.isVisible()) {
      // Get initial state
      const html = page.locator('html');
      const initialDark = await html.evaluate((el) => el.classList.contains('dark'));

      // Toggle
      await themeToggle.click();

      // Should have changed
      const newDark = await html.evaluate((el) => el.classList.contains('dark'));
      expect(newDark).toBe(!initialDark);
    }
  });

  test('should persist dark mode preference', async ({ page, context }) => {
    await page.goto('/');
    await dismissCookieConsent(page);

    const themeToggle = page.getByRole('button', { name: /cambiar a modo/i });

    if (await themeToggle.isVisible()) {
      // Toggle to dark
      await themeToggle.click();

      // Create new page (simulates reload)
      const newPage = await context.newPage();
      await newPage.goto('/');

      // Should still be dark
      const html = newPage.locator('html');
      const isDark = await html.evaluate((el) => el.classList.contains('dark'));
      expect(isDark).toBe(true);
    }
  });
});
