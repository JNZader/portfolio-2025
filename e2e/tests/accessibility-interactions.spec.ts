import { expect, test, type Locator } from '../fixtures/test';
import AxeBuilder from '@axe-core/playwright';
import { dismissCookieConsent } from '../fixtures/test-data';
import { expectMinimumTarget, rectanglesOverlap } from '../helpers/visual-ux';
import { skipIfPortfolioServerBlocked, skipIfSanityEnvironmentBlocked } from '../fixtures/portfolio-server';

type TextRectangle = { x: number; y: number; right: number; bottom: number };

async function expectCaptionGeometry(
  caption: Locator,
  viewportWidth: number
) {
  const box = await caption.boundingBox();
  expect(box).not.toBeNull();
  expect(box?.width ?? 0).toBeGreaterThan(0);
  expect(box?.height ?? 0).toBeGreaterThan(0);
  expect(box?.x ?? -1).toBeGreaterThanOrEqual(0);
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(viewportWidth);
  await expect(caption.evaluate((element) => element.scrollWidth <= element.clientWidth)).resolves.toBe(true);

  const textLayout = await caption.evaluate((element) => {
    const range = document.createRange();
    const rectangles: TextRectangle[] = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      if (node.textContent?.trim()) {
        range.selectNodeContents(node);
        for (const rect of Array.from(range.getClientRects())) {
          rectangles.push({ x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom });
        }
      }
      node = walker.nextNode();
    }
    const link = element.getBoundingClientRect();
    return {
      link: { x: link.x, y: link.y, right: link.right, bottom: link.bottom },
      rectangles,
    };
  });

  expect(textLayout.rectangles.length).toBeGreaterThan(0);
  for (const rectangle of textLayout.rectangles) {
    expect(rectangle.x).toBeGreaterThanOrEqual(textLayout.link.x - 0.5);
    expect(rectangle.right).toBeLessThanOrEqual(textLayout.link.right + 0.5);
    expect(rectangle.y).toBeGreaterThanOrEqual(textLayout.link.y - 0.5);
    expect(rectangle.bottom).toBeLessThanOrEqual(textLayout.link.bottom + 0.5);
  }
  for (let first = 0; first < textLayout.rectangles.length; first += 1) {
    for (let second = first + 1; second < textLayout.rectangles.length; second += 1) {
      const a = textLayout.rectangles[first];
      const b = textLayout.rectangles[second];
      const overlaps = !(a.right <= b.x || b.right <= a.x || a.bottom <= b.y || b.bottom <= a.y);
      expect(overlaps).toBe(false);
    }
  }
}

test.describe('Visual UX accessibility and interactions', () => {
  for (const localeCase of [
    {
      name: 'Spanish',
      path: '/',
       caption: 'apigen — una herramienta que construí: de un schema SQL a una API Spring Boot completa y corriendo.',
      cv: 'Ver CV',
    },
    {
      name: 'English',
      path: '/en',
       caption: 'apigen — a tool I built that turns a SQL schema into a complete, running Spring Boot API.',
      cv: 'View CV',
    },
  ]) {
     test(`${localeCase.name} featured caption link remains semantic and keyboard-safe`, async ({ page }) => {
      await page.goto(localeCase.path);
      await dismissCookieConsent(page);

      const terminal = page.getByTestId('hero-terminal');
       const caseStudy = page.getByRole('link', { name: localeCase.caption, exact: true });
      const cv = page.getByRole('link', { name: localeCase.cv, exact: true });

      await caseStudy.scrollIntoViewIfNeeded();
      await expect(caseStudy).toBeVisible();
      await expect(cv).toBeVisible();
      await expect(terminal).toHaveAttribute('aria-hidden', 'true');
       await expect(terminal.locator('a,button,input,select,textarea,[tabindex]')).toHaveCount(0);
       await expect(caseStudy).toHaveCount(1);
       const captionParagraph = caseStudy.locator('xpath=ancestor::p[1]');
       await expect(captionParagraph.getByRole('link')).toHaveCount(1);
       await expect(captionParagraph.getByRole('link', { name: /github/i })).toHaveCount(0);
       await expect(page.locator('[data-testid="apigen-featured-actions"], [data-testid="apigen-case-study-cta"]')).toHaveCount(0);
      // Start from the preceding hero action so the assertion follows the
      // local keyboard order rather than depending on document-wide focusables.
      await cv.focus();
      await page.keyboard.press('Tab');
      let reachedCaseStudy = false;
      for (let index = 0; index < 12; index += 1) {
        const focusState = await page.evaluate(() => {
          const active = document.activeElement;
          const terminalElement = document.querySelector('[data-testid="hero-terminal"]');
          return {
             isCaseStudy: active?.getAttribute('href')?.endsWith('/proyectos/apigen') ?? false,
            isInsideTerminal: terminalElement?.contains(active) ?? false,
          };
        });
        expect(focusState.isInsideTerminal).toBe(false);
        if (focusState.isCaseStudy) {
          reachedCaseStudy = true;
          await expect(caseStudy).toBeFocused();
          await expect(caseStudy.evaluate((element) => {
            const style = window.getComputedStyle(element);
            return style.outlineWidth !== '0px' || style.boxShadow !== 'none';
          })).resolves.toBe(true);
          break;
        }
        await page.keyboard.press('Tab');
      }
      expect(reachedCaseStudy).toBe(true);
       await expect(caseStudy.locator('xpath=ancestor::p[1]')).toBeVisible();
    });

    test(`${localeCase.name} exposes complete featured content with reduced motion`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(localeCase.path);
      await dismissCookieConsent(page);

      await expect(page.getByText('Generation complete — 199 files')).toBeVisible();
       const caseStudy = page.getByRole('link', { name: localeCase.caption, exact: true });
      await caseStudy.scrollIntoViewIfNeeded();
      await expect(caseStudy).toBeVisible();
      await expect(caseStudy).toBeEnabled();
    });

    test(`${localeCase.name} homepage has no overflow at 320px after CTA focus`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 720 });
      await page.goto(localeCase.path);
      await dismissCookieConsent(page);

       const caseStudy = page.getByRole('link', { name: localeCase.caption, exact: true });
       await caseStudy.scrollIntoViewIfNeeded();
       await caseStudy.focus();
       await expectCaptionGeometry(caseStudy, 320);
    });

    test(`${localeCase.name} homepage reflows at 200 percent without clipping actions`, async ({ page }) => {
      // A 640 CSS-pixel viewport at 2x zoom is the Playwright equivalent of
      // a 320px effective viewport, while keeping the layout viewport honest.
      await page.setViewportSize({ width: 640, height: 720 });
      await page.goto(localeCase.path);
      await dismissCookieConsent(page);
      await page.evaluate(() => {
        document.documentElement.style.zoom = '2';
      });

       const caption = page.getByRole('link', { name: localeCase.caption, exact: true });
       await caption.scrollIntoViewIfNeeded();
       await caption.focus();
       await expectCaptionGeometry(caption, 640);
    });
  }

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

  for (const menuCase of [
    {
      name: 'Spanish',
      path: '/',
      opener: 'Abrir menú de navegación',
      title: 'Menú de navegación',
      close: 'Cerrar menú',
      destination: '/proyectos',
      destinationLink: 'Proyectos',
    },
    {
      name: 'English',
      path: '/en',
      opener: 'Open navigation menu',
      title: 'Navigation menu',
      close: 'Close menu',
      destination: '/en/proyectos',
      destinationLink: 'Projects',
    },
  ]) {
    test(`${menuCase.name} mobile dialog keeps its name and focus contract at 320px`, async ({ page }) => {
      await skipIfPortfolioServerBlocked();
      await skipIfSanityEnvironmentBlocked();
      await page.setViewportSize({ width: 320, height: 720 });
      await page.goto(menuCase.path);
      await dismissCookieConsent(page);

      const opener = page.getByRole('button', { name: menuCase.opener });
      await opener.focus();
      await opener.click();

      const dialog = page.getByRole('dialog', { name: menuCase.title });
      await expect(dialog).toBeVisible();
      const dialogAxe = await new AxeBuilder({ page }).include('dialog').analyze();
      expect(dialogAxe.violations).toEqual([]);
      await expect(dialog.getByRole('button', { name: menuCase.close }).last()).toBeFocused();
      await expect(page.locator('h1').first()).toHaveCount(1);
      const firstHeadingIsH1 = await page
        .locator('h1, h2')
        .evaluateAll((headings) => headings[0]?.tagName === 'H1');
      expect(firstHeadingIsH1).toBe(true);

      await dialog.getByRole('button', { name: menuCase.close }).last().click();
      await expect(opener).toBeFocused();

      await opener.click();
      await expect(dialog).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      await expect(opener).toBeFocused();

      await opener.click();
      await dialog.getByRole('link', { name: menuCase.destinationLink, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${menuCase.destination}$`));
      await expect(page.locator('#main-content')).toBeFocused();
    });
  }

  test('CV action copy is explicit in both locales', async ({ page }) => {
    await page.goto('/');
    await dismissCookieConsent(page);
    await expect(page.getByRole('link', { name: 'Ver CV' }).first()).toBeVisible();

    await page.goto('/en');
    await expect(page.getByRole('link', { name: 'View CV' }).first()).toBeVisible();
  });
});
