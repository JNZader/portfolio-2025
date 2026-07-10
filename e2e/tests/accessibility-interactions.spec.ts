import { expect, test } from '@playwright/test';
import { dismissCookieConsent } from '../fixtures/test-data';
import { expectMinimumTarget, rectanglesOverlap } from '../helpers/visual-ux';

test.describe('Visual UX accessibility and interactions', () => {
  test('language option provides a comfortable pointer target', async ({ page }) => {
    await page.goto('/proyectos');
    await dismissCookieConsent(page);

    const languageLink = page.getByRole('link', { name: /ver en inglés/i });
    await expectMinimumTarget(languageLink);
  });

  test('cookie consent does not cover the primary hero conversion action', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.context().clearCookies();
    await page.goto('/');

    const consent = page.getByRole('region', { name: /consentimiento de cookies/i });
    await expect(consent).toBeVisible({ timeout: 4000 });
    const close = page.getByRole('button', { name: /cerrar y aceptar solo esenciales/i });
    await expectMinimumTarget(close);

    const primaryCta = page.getByRole('link', { name: /ver proyectos/i }).first();
    const consentBox = await consent.boundingBox();
    const ctaBox = await primaryCta.boundingBox();
    expect(consentBox).not.toBeNull();
    expect(ctaBox).not.toBeNull();
    expect(rectanglesOverlap(consentBox!, ctaBox!)).toBe(false);
  });

  test('focused skip link remains fully inside the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto('/');
    await dismissCookieConsent(page);

    const skipLink = page.getByRole('link', { name: /saltar al contenido principal/i });
    await skipLink.focus();
    const box = await skipLink.boundingBox();
    expect(box).not.toBeNull();
    expect(box?.x ?? -1).toBeGreaterThanOrEqual(0);
    expect(box?.y ?? -1).toBeGreaterThanOrEqual(0);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(320);
  });

  test('mobile navigation keeps Contact as a clear primary action', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto('/');
    await dismissCookieConsent(page);

    await page.getByRole('button', { name: /abrir menú/i }).click();
    const menu = page.getByRole('navigation', { name: /navegación móvil/i });
    const contact = menu.getByRole('link', { name: /^contacto$/i });
    await expect(contact).toBeVisible();
    await expectMinimumTarget(contact);
    await expect(contact).toHaveClass(/bg-primary/);
  });

  test('CV action copy is explicit in both locales', async ({ page }) => {
    await page.goto('/');
    await dismissCookieConsent(page);
    await expect(page.getByRole('link', { name: 'Ver CV' }).first()).toBeVisible();

    await page.goto('/en');
    await expect(page.getByRole('link', { name: 'View CV' }).first()).toBeVisible();
  });
});
