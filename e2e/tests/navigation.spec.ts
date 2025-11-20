import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');

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

    // Tab to skip link
    await page.keyboard.press('Tab');

    // Should show skip link
    const skipLink = page.getByRole('link', { name: /saltar al contenido/i });
    await expect(skipLink).toBeVisible();

    // Click skip link
    await skipLink.click();

    // Focus should be on main content
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeFocused();
  });

  test('should toggle mobile menu', async ({ page, viewport }) => {
    // Only on mobile
    if (viewport && viewport.width < 768) {
      await page.goto('/');

      // Mobile menu button should be visible
      const menuButton = page.getByRole('button', { name: /menú/i });
      await expect(menuButton).toBeVisible();

      // Click to open
      await menuButton.click();

      // Menu should be visible
      const mobileMenu = page.getByRole('navigation', { name: /móvil/i });
      await expect(mobileMenu).toBeVisible();

      // Click link
      await mobileMenu.getByRole('link', { name: /blog/i }).click();

      // Should navigate
      await expect(page).toHaveURL(/\/blog/);
    }
  });

  test('should have footer links', async ({ page }) => {
    await page.goto('/');

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

    // Find theme toggle button
    const themeToggle = page.getByRole('button', { name: /tema/i });

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

    const themeToggle = page.getByRole('button', { name: /tema/i });

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
