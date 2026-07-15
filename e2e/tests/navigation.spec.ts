import { test, expect } from '../fixtures/test';
import { dismissCookieConsent } from '../fixtures/test-data';
import { skipIfPortfolioServerBlocked } from '../fixtures/portfolio-server';
import type { Page } from '@playwright/test';

interface FooterRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

function rectanglesOverlap(first: FooterRectangle, second: FooterRectangle): boolean {
  return !(
    first.x + first.width <= second.x ||
    second.x + second.width <= first.x ||
    first.y + first.height <= second.y ||
    second.y + second.height <= first.y
  );
}

interface FooterClippingViolation {
  ancestor: string;
  descendant: string;
  axis: 'x' | 'y';
  overflow: string;
}

async function expectNoFooterAncestorClipping(page: Page): Promise<void> {
  const violations = await page.locator('#footer').locator('*').evaluateAll((elements) => {
    const footer = elements[0]?.closest('#footer');
    if (!footer) return [] as FooterClippingViolation[];

    const container = footer.querySelector(':scope > .max-w-7xl');
    const intentionalBoundaries = new Set([footer, container]);
    const clippingValues = ['hidden', 'clip', 'auto', 'scroll'];
    const found: FooterClippingViolation[] = [];

    for (const element of elements) {
      const text = Array.from(element.childNodes)
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent?.trim() ?? '')
        .join(' ')
        .trim();
      if (!text) continue;

      const descendantBox = element.getBoundingClientRect();
      let ancestor = element.parentElement;
      while (ancestor && ancestor !== footer.parentElement) {
        if (!intentionalBoundaries.has(ancestor)) {
          const style = getComputedStyle(ancestor);
          const clipsX = clippingValues.includes(style.overflowX);
          const clipsY = clippingValues.includes(style.overflowY);
          const ancestorBox = ancestor.getBoundingClientRect();
          const exceedsX = descendantBox.left < ancestorBox.left - 1
            || descendantBox.right > ancestorBox.right + 1
            || ancestor.scrollWidth > ancestor.clientWidth + 1;
          const exceedsY = descendantBox.top < ancestorBox.top - 1
            || descendantBox.bottom > ancestorBox.bottom + 1
            || ancestor.scrollHeight > ancestor.clientHeight + 1;

          if (clipsX && exceedsX) {
            found.push({
              ancestor: ancestor.tagName.toLowerCase(),
              descendant: text,
              axis: 'x',
              overflow: style.overflowX,
            });
          }
          if (clipsY && exceedsY) {
            found.push({
              ancestor: ancestor.tagName.toLowerCase(),
              descendant: text,
              axis: 'y',
              overflow: style.overflowY,
            });
          }
        }
        ancestor = ancestor.parentElement;
      }
    }

    return found;
  });

  expect(violations, `footer text is clipped by an ancestor: ${JSON.stringify(violations)}`).toEqual([]);
}

async function expectFooterGeometry(page: Page, viewportWidth: number) {
  const footer = page.locator('#footer');
  const grid = footer.locator('[data-footer-grid="primary"]');
  const columns = footer.locator('[data-footer-column]');
  const bottomBar = footer.locator('[data-footer-bottom-bar]');
  const bottomGroups = footer.locator('[data-footer-bottom-group]');

  await expect(footer).toBeVisible();
  await expect(grid).toHaveCount(1);
  await expect(columns).toHaveCount(3);
  await expect(bottomBar).toHaveCount(1);
  await expect(bottomGroups).toHaveCount(2);

  const documentWidth = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(documentWidth.scrollWidth).toBeLessThanOrEqual(documentWidth.clientWidth);

  const regions = await Promise.all(
    [grid, ...Array.from({ length: 3 }, (_, index) => columns.nth(index)), bottomBar, ...Array.from({ length: 2 }, (_, index) => bottomGroups.nth(index))].map(
      async (region) => region.boundingBox()
    )
  );
  for (const region of regions) {
    expect(region).not.toBeNull();
    expect(region?.x ?? -1).toBeGreaterThanOrEqual(0);
    expect((region?.x ?? 0) + (region?.width ?? 0)).toBeLessThanOrEqual(viewportWidth);
    expect(region?.width ?? 0).toBeGreaterThan(0);
    expect(region?.height ?? 0).toBeGreaterThan(0);
  }

  await expect(
    columns.evaluateAll((elements) =>
      elements.map((element) => ['left', 'start'].includes(getComputedStyle(element).textAlign))
    )
  ).resolves.toEqual([true, true, true]);

  const columnStarts = await Promise.all(
    Array.from({ length: 3 }, (_, index) => Promise.all([
      columns.nth(index).boundingBox(),
      columns.nth(index).locator(':scope > :first-child').boundingBox(),
    ]))
  );
  for (const [column, content] of columnStarts) {
    expect(column).not.toBeNull();
    expect(content).not.toBeNull();
    expect(content?.x ?? -1).toBeCloseTo(column?.x ?? -2, 0);
  }

  const primary = regions[0];
  const bottom = regions[4];
  expect(primary).not.toBeNull();
  expect(bottom).not.toBeNull();
  expect(bottom?.x ?? -1).toBeCloseTo(primary?.x ?? -2, 0);

  for (let first = 1; first < 4; first += 1) {
    for (let second = first + 1; second < 4; second += 1) {
      expect(rectanglesOverlap(regions[first] as FooterRectangle, regions[second] as FooterRectangle)).toBe(false);
    }
  }
  expect(rectanglesOverlap(regions[5] as FooterRectangle, regions[6] as FooterRectangle)).toBe(false);

  for (const target of await footer.getByRole('link').all()) {
    const box = await target.boundingBox();
    expect(box).not.toBeNull();
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }

  const textDescendants = await footer.locator('*').evaluateAll((elements) => elements.flatMap((element) => {
    const text = Array.from(element.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent?.trim() ?? '')
      .join(' ')
      .trim();
    if (!text) return [];

    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    return [{
      text,
      visible: style.visibility !== 'hidden' && style.display !== 'none',
      hasClientRect: element.getClientRects().length > 0,
      withinViewport: box.left >= 0 && box.right <= window.innerWidth,
      clippedHorizontally: element.scrollWidth > element.clientWidth + 1,
      clippedByOverflow: style.overflowX === 'hidden' && element.scrollWidth > element.clientWidth + 1,
    }];
  }));
  for (const descendant of textDescendants) {
    expect(descendant.visible, `text descendant is hidden: ${descendant.text}`).toBe(true);
    expect(descendant.hasClientRect, `text descendant has no client rect: ${descendant.text}`).toBe(true);
    expect(descendant.withinViewport, `text descendant is horizontally clipped: ${descendant.text}`).toBe(true);
    expect(descendant.clippedHorizontally, `text descendant overflows its box: ${descendant.text}`).toBe(false);
    expect(descendant.clippedByOverflow, `text descendant is clipped by overflow: ${descendant.text}`).toBe(false);
  }

  await expectNoFooterAncestorClipping(page);
}

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

  for (const localeCase of [
    {
      path: '/',
      homeHref: '/',
      contactHref: '/contacto',
      privacyHref: '/privacy',
      dataRequestHref: '/data-request',
      navLabels: ['Inicio', 'Sobre mí', 'Proyectos', 'Blog', 'Contacto'],
      githubLabel: 'Visitar perfil de GitHub',
      linkedinLabel: 'Visitar perfil de LinkedIn',
      contactLabel: 'Contactar →',
      privacyLabel: 'Privacidad',
      dataRequestLabel: 'Datos GDPR',
    },
    {
      path: '/en',
      homeHref: '/en',
      contactHref: '/en/contacto',
      privacyHref: '/en/privacy',
      dataRequestHref: '/en/data-request',
      navLabels: ['Home', 'About', 'Projects', 'Blog', 'Contact'],
      githubLabel: 'Visit GitHub profile',
      linkedinLabel: 'Visit LinkedIn profile',
      contactLabel: 'Get in touch →',
      privacyLabel: 'Privacy',
      dataRequestLabel: 'GDPR Data',
    },
  ]) {
    test(
      `footer preserves localized semantic links and external behavior (${localeCase.path})`,
      { tag: ['@footer', '@footer-semantics'] },
      async ({ page }) => {
        await page.goto(localeCase.path);
        await dismissCookieConsent(page);

        const footer = page.locator('#footer');
        await expect(footer.getByRole('link', { name: 'JZ', exact: true })).toHaveAttribute('href', localeCase.homeHref);
        await expect(footer.getByRole('navigation').getByRole('link')).toHaveText(localeCase.navLabels);
        await expect(footer.getByRole('link', { name: localeCase.contactLabel, exact: true })).toHaveAttribute('href', localeCase.contactHref);
        await expect(footer.getByRole('link', { name: localeCase.privacyLabel, exact: true })).toHaveAttribute('href', localeCase.privacyHref);
        await expect(footer.getByRole('link', { name: localeCase.dataRequestLabel, exact: true })).toHaveAttribute('href', localeCase.dataRequestHref);

        for (const [label, href] of [
          [localeCase.githubLabel, 'https://github.com/JNZader'],
          [localeCase.linkedinLabel, 'https://www.linkedin.com/in/jnzader/'],
        ]) {
          const external = footer.getByRole('link', { name: label, exact: true });
          await expect(external).toHaveAttribute('href', href);
          await expect(external).toHaveAttribute('target', '_blank');
          await expect(external).toHaveAttribute('rel', 'noopener noreferrer');
        }
      }
    );

    test(
      `footer links are Tab reachable and activate with Enter (${localeCase.path})`,
      { tag: ['@footer', '@footer-keyboard'] },
      async ({ page }) => {
        await page.goto(localeCase.path);
        await dismissCookieConsent(page);

        const footer = page.locator('#footer');
        const links = footer.getByRole('link');
        const linkCount = await links.count();
        expect(linkCount).toBeGreaterThan(0);

        await links.first().focus();
        for (let index = 0; index < linkCount; index += 1) {
          await expect(links.nth(index)).toBeFocused();
          if (index < linkCount - 1) await page.keyboard.press('Tab');
        }

        for (let index = 0; index < linkCount; index += 1) {
          const link = links.nth(index);
          const href = await link.getAttribute('href');
          const target = await link.getAttribute('target');
          await link.focus();
          await expect(link).toBeFocused();

          if (target === '_blank') {
            const popupPromise = page.waitForEvent('popup');
            await page.keyboard.press('Enter');
            const popup = await popupPromise;
            expect(popup.url()).toContain(new URL(href ?? '').hostname);
            await popup.close();
          } else {
            await page.keyboard.press('Enter');
            await expect(page).toHaveURL(new RegExp(`${href?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') ?? '^$'}$`));
            await page.goto(localeCase.path);
            await dismissCookieConsent(page);
          }
        }
      }
    );
  }

  for (const localeCase of [
    { path: '/', name: 'Spanish' },
    { path: '/en', name: 'English' },
  ]) {
    for (const theme of ['light', 'dark'] as const) {
      for (const viewport of [
        { width: 320, height: 720 },
        { width: 390, height: 844 },
        { width: 768, height: 900 },
        { width: 1440, height: 900 },
      ]) {
        test(
          `footer geometry remains contained (${localeCase.name}, ${theme}, ${viewport.width}px)`,
          { tag: ['@footer', '@footer-layout', `@footer-${theme}`, `@footer-${viewport.width}`] },
          async ({ page }) => {
            await page.setViewportSize(viewport);
            await page.goto(localeCase.path);
            await dismissCookieConsent(page);
            await page.waitForLoadState('domcontentloaded');

            const isDark = await page.locator('html').evaluate((element) => element.classList.contains('dark'));
            if ((theme === 'dark') !== isDark) {
              await page.getByRole('button', { name: /cambiar a modo|switch to/i }).click();
            }
            await expect.poll(() => page.locator('html').evaluate((element) => element.classList.contains('dark')))
              .toBe(theme === 'dark');

            await page.locator('#footer').scrollIntoViewIfNeeded();
            await expectFooterGeometry(page, viewport.width);
          }
        );
      }
    }
  }
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
