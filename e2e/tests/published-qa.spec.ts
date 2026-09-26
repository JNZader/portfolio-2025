import { expect, test } from '../fixtures/test';
import { dismissCookieConsent } from '../fixtures/test-data';
import { skipIfPortfolioServerBlocked } from '../fixtures/portfolio-server';

async function gotoProyectos(page: import('@playwright/test').Page, path = '/proyectos') {
  await skipIfPortfolioServerBlocked();
  await page.goto(path);
  await dismissCookieConsent(page);
}

test.describe('published QA on /proyectos', () => {
  test('control is visible on /proyectos and /en/proyectos', async ({ page }) => {
    await gotoProyectos(page);
    await expect(
      page.getByRole('textbox', { name: /preguntá sobre un proyecto o la formación/i })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /^consultar$/i })).toBeVisible();
    await expect(page.getByRole('searchbox', { name: /buscar proyectos/i })).toBeVisible();

    await gotoProyectos(page, '/en/proyectos');
    await expect(
      page.getByRole('textbox', { name: /ask about a project or the training/i })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /^ask$/i })).toBeVisible();
    await expect(page.getByRole('searchbox', { name: /search projects/i })).toBeVisible();
  });

  for (const width of [320, 1440] as const) {
    test(`control is visible and usable at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 720 });
      await gotoProyectos(page);

      const input = page.getByRole('textbox', {
        name: /preguntá sobre un proyecto o la formación/i,
      });
      const submit = page.getByRole('button', { name: /^consultar$/i });
      await expect(input).toBeVisible();
      await expect(submit).toBeVisible();
      await expect(input).toBeEnabled();
      await expect(submit).toBeEnabled();

      const inputBox = await input.boundingBox();
      const submitBox = await submit.boundingBox();
      expect(inputBox).not.toBeNull();
      expect(submitBox).not.toBeNull();
      expect((inputBox?.x ?? 0) + (inputBox?.width ?? 0)).toBeLessThanOrEqual(width);
      expect((submitBox?.x ?? 0) + (submitBox?.width ?? 0)).toBeLessThanOrEqual(width);
    });
  }

  test('a known education question yields a citation link in Spanish', async ({ page }) => {
    await gotoProyectos(page);

    await page
      .getByRole('textbox', { name: /preguntá sobre un proyecto o la formación/i })
      .fill('qué título tenés');
    await page.getByRole('button', { name: /^consultar$/i }).click();

    const citation = page.getByRole('link', { name: /Universidad Gastón Dachary/i });
    await expect(citation).toBeVisible();
    await expect(citation).toHaveAttribute('href', '/cv');
  });

  test('a known education question yields a citation link in English', async ({ page }) => {
    await gotoProyectos(page, '/en/proyectos');

    await page
      .getByRole('textbox', { name: /ask about a project or the training/i })
      .fill('what degree do you have');
    await page.getByRole('button', { name: /^ask$/i }).click();

    const citation = page.getByRole('link', { name: /Universidad Gastón Dachary/i });
    await expect(citation).toBeVisible();
    await expect(citation).toHaveAttribute('href', '/en/cv');
  });
});
