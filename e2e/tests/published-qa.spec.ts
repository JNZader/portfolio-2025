import { expect, test } from '../fixtures/test';
import { skipIfPortfolioServerBlocked } from '../fixtures/portfolio-server';
import { dismissCookieConsent } from '../fixtures/test-data';

async function gotoProyectos(page: import('@playwright/test').Page, path = '/proyectos') {
  await skipIfPortfolioServerBlocked();
  await page.goto(path);
  await dismissCookieConsent(page);
}

async function openChat(page: import('@playwright/test').Page, locale: 'es' | 'en' = 'es') {
  const openName = locale === 'es' ? /^preguntame$/i : /^ask me$/i;
  await page.getByRole('button', { name: openName }).click();
  await expect(page.getByRole('dialog', { name: openName })).toBeVisible();
}

function blockIfGeminiKeyMissing() {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) return;
  const reason = 'blocked: published QA chat requires a Gemini API key';
  test.info().annotations.push({ type: 'environment', description: reason });
  test.skip(true, reason);
}

test.describe('published QA on /proyectos', () => {
  test('control is visible on /proyectos and /en/proyectos', async ({ page }) => {
    await gotoProyectos(page);
    await expect(page.getByRole('button', { name: /^preguntame$/i })).toBeVisible();
    await openChat(page, 'es');
    await expect(page.getByRole('textbox', { name: /^pregunta$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^enviar$/i })).toBeVisible();
    await expect(page.getByRole('searchbox', { name: /buscar proyectos/i })).toBeVisible();

    await gotoProyectos(page, '/en/proyectos');
    await expect(page.getByRole('button', { name: /^ask me$/i })).toBeVisible();
    await openChat(page, 'en');
    await expect(page.getByRole('textbox', { name: /^question$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^send$/i })).toBeVisible();
    await expect(page.getByRole('searchbox', { name: /search projects/i })).toBeVisible();
  });

  for (const width of [320, 1440] as const) {
    test(`control is visible and usable at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 720 });
      await gotoProyectos(page);

      const launcher = page.getByRole('button', { name: /^preguntame$/i });
      await expect(launcher).toBeVisible();
      const launcherBox = await launcher.boundingBox();
      expect(launcherBox).not.toBeNull();
      expect((launcherBox?.x ?? 0) + (launcherBox?.width ?? 0)).toBeLessThanOrEqual(width);

      await openChat(page, 'es');
      const input = page.getByRole('textbox', { name: /^pregunta$/i });
      const submit = page.getByRole('button', { name: /^enviar$/i });
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

  test('a known education question yields a published answer in Spanish', async ({ page }) => {
    blockIfGeminiKeyMissing();
    await gotoProyectos(page);
    await openChat(page, 'es');

    await page.getByRole('textbox', { name: /^pregunta$/i }).fill('qué título tenés');
    await page.getByRole('button', { name: /^enviar$/i }).click();

    await expect(page.getByText(/Universidad Gastón Dachary|Técnico en Desarrollo de Software/i)).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText('No hay una cita publicada para esa pregunta.')).toHaveCount(0);
  });

  test('a known education question yields a published answer in English', async ({ page }) => {
    blockIfGeminiKeyMissing();
    await gotoProyectos(page, '/en/proyectos');
    await openChat(page, 'en');

    await page.getByRole('textbox', { name: /^question$/i }).fill('what degree do you have');
    await page.getByRole('button', { name: /^send$/i }).click();

    await expect(
      page.getByText(/Universidad Gastón Dachary|Software Development Technician/i)
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('No published quote for that question.')).toHaveCount(0);
  });
});
