import { test, expect } from '../fixtures/test';
import { dismissCookieConsent } from '../fixtures/test-data';
import { skipIfPortfolioServerBlocked } from '../fixtures/portfolio-server';

test.describe('Navigation', () => {
  for (const localeCase of [
    { path: '/', name: 'apigen — una herramienta que construí: de un schema SQL a una API Spring Boot completa y corriendo.', url: /\/proyectos\/apigen$/ },
    { path: '/en', name: 'apigen — a tool I built that turns a SQL schema into a complete, running Spring Boot API.', url: /\/en\/proyectos\/apigen$/ },
  ]) {
    test(`${localeCase.name} preserves the locale-aware case-study route`, async ({ page }) => {
      await page.goto(localeCase.path);
      await dismissCookieConsent(page);

      const cta = page.getByRole('link', { name: localeCase.name, exact: true });
      await expect(cta).toHaveAttribute('href', localeCase.path === '/' ? '/proyectos/apigen' : '/en/proyectos/apigen');
      await expect(cta).toHaveCount(1);
      const caption = cta.locator('xpath=ancestor::p[1]');
      await expect(caption.getByRole('link')).toHaveCount(1);
      await expect(caption.getByRole('link', { name: /github/i })).toHaveCount(0);
      await expect(page.locator('[data-testid="apigen-featured-actions"], [data-testid="apigen-case-study-cta"]')).toHaveCount(0);
      await cta.click();
      await expect(page).toHaveURL(localeCase.url);
    });
  }

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


  test('English routes preserve locale and download the English CV', async ({ page }) => {
    await page.goto('/en');
    await dismissCookieConsent(page);

    await expect(page.getByRole('link', { name: /download cv/i }).first()).toHaveAttribute(
      'href',
      '/api/resume?locale=en'
    );

    await page.goto('/en/privacy');
    await page.getByRole('link', { name: /data request page/i }).click();
    await expect(page).toHaveURL(/\/en\/data-request/);
  });

  for (const localeCase of [
    {
      path: '/',
      labels: ['Saltar al contenido principal', 'Saltar a la navegación principal', 'Saltar al pie de página'],
      targets: ['#main-content', '#main-navigation', '#footer'],
    },
    {
      path: '/en',
      labels: ['Skip to main content', 'Skip to main navigation', 'Skip to footer'],
      targets: ['#main-content', '#main-navigation', '#footer'],
    },
  ]) {
    test(`${localeCase.path} exposes localized skip links and activates the main target`, async ({ page }) => {
      await skipIfPortfolioServerBlocked();
      await page.goto(localeCase.path);
      await dismissCookieConsent(page);
      await page.waitForLoadState('domcontentloaded');

      const skipLink = page.getByRole('link', { name: localeCase.labels[0], exact: true });
      await expect(page.getByRole('link', { name: localeCase.labels[1], exact: true })).toHaveAttribute('href', localeCase.targets[1]);
      await expect(page.getByRole('link', { name: localeCase.labels[2], exact: true })).toHaveAttribute('href', localeCase.targets[2]);
      await expect(skipLink).toBeAttached();
      await expect(skipLink).toHaveAttribute('href', localeCase.targets[0]);

      // The shared cookie-consent fixture and browser startup focus are not
      // stable Tab origins. Focus the real link, then exercise its keyboard
      // activation; the component contract keeps it in the tab order.
      await skipLink.focus();
      await expect(skipLink).toBeFocused();
      await expect(skipLink).toBeVisible();

      await page.keyboard.press('Enter');

      // Real Chromium models the fragment-navigation focus transfer that
      // happy-dom cannot model; main#main-content is the existing target.
      await expect(page.locator('#main-content')).toBeFocused();
    });
  }

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
