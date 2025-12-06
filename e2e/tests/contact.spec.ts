import { test, expect } from '@playwright/test';
import { testData, dismissCookieConsent } from '../fixtures/test-data';

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contacto');
    await dismissCookieConsent(page);
  });

  test('should render contact form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /contacto/i })).toBeVisible();

    // Use main content area as context
    const main = page.locator('main');
    await expect(main.getByRole('textbox', { name: /nombre/i })).toBeVisible();
    await expect(main.getByRole('textbox', { name: /^email/i })).toBeVisible();
    await expect(main.getByRole('textbox', { name: /mensaje/i })).toBeVisible();
    await expect(main.getByRole('button', { name: /enviar/i })).toBeVisible();
  });

  test('should submit form and show response', async ({ page }) => {
    const email = testData.contact.email();
    const main = page.locator('main');

    // Fill form
    await main.getByRole('textbox', { name: /nombre/i }).fill(testData.contact.name);
    await main.getByRole('textbox', { name: /^email/i }).fill(email);
    await main.getByLabel(/asunto/i).fill('Test Subject');
    await main.getByRole('textbox', { name: /mensaje/i }).fill(testData.contact.message);

    // Submit
    await main.getByRole('button', { name: /enviar/i }).click();

    // Wait for some response - either success or error (API might not be configured in CI)
    await expect(async () => {
      const successMessage = await page.getByText(/mensaje.*enviado/i).isVisible().catch(() => false);
      const errorMessage = await page.getByText(/error|inesperado/i).isVisible().catch(() => false);
      const hasToast = await page.locator('[role="status"], .toast, [data-sonner-toast]').count() > 0;

      // Form should show some response after submission
      expect(successMessage || errorMessage || hasToast).toBeTruthy();
    }).toPass({ timeout: 15000 });
  });

  test('should show validation errors', async ({ page }) => {
    const main = page.locator('main');

    // Submit empty form
    await main.getByRole('button', { name: /enviar/i }).click();

    // Should show errors (messages from contactSchema validation)
    await expect(page.getByText(/nombre.*al menos 2 caracteres/i)).toBeVisible();
    await expect(page.getByText(/email.*requerido/i)).toBeVisible();
    await expect(page.getByText(/asunto.*al menos 5 caracteres/i)).toBeVisible();
    await expect(page.getByText(/mensaje.*al menos 10 caracteres/i)).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    const main = page.locator('main');

    await main.getByRole('textbox', { name: /nombre/i }).fill(testData.contact.name);
    await main.getByRole('textbox', { name: /^email/i }).fill('invalid-email');
    await main.getByLabel(/asunto/i).fill('Test Subject');
    await main.getByRole('textbox', { name: /mensaje/i }).fill(testData.contact.message);

    await main.getByRole('button', { name: /enviar/i }).click();

    await expect(page.getByText(/email inválido/i)).toBeVisible();
  });

  test('should show loading state during submission', async ({ page }) => {
    const email = testData.contact.email();
    const main = page.locator('main');

    // Intercept all POST requests to add delay (server actions use POST)
    await page.route('**/*', async (route) => {
      if (route.request().method() === 'POST') {
        // Add delay to server action calls
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
      await route.continue();
    });

    await main.getByRole('textbox', { name: /nombre/i }).fill(testData.contact.name);
    await main.getByRole('textbox', { name: /^email/i }).fill(email);
    await main.getByLabel(/asunto/i).fill('Test Subject');
    await main.getByRole('textbox', { name: /mensaje/i }).fill(testData.contact.message);

    // Get the submit button before clicking (its text will change to "Enviando...")
    const submitButton = main.getByRole('button', { name: /enviar/i });

    // Click to start submission
    submitButton.click();

    // Wait for the loading state - look for button with "Enviando" text which should be disabled
    const loadingButton = main.getByRole('button', { name: /enviando/i });
    await expect(loadingButton).toBeDisabled({ timeout: 5000 });
  });

  test('should enforce character limits', async ({ page }) => {
    const main = page.locator('main');

    await main.getByRole('textbox', { name: /nombre/i }).fill(testData.contact.name);
    await main.getByRole('textbox', { name: /^email/i }).fill(testData.contact.email());
    await main.getByLabel(/asunto/i).fill('Test Subject');
    await main.getByRole('textbox', { name: /mensaje/i }).fill(testData.contact.longMessage);

    await main.getByRole('button', { name: /enviar/i }).click();

    // Should show error for message too long
    await expect(page.getByText(/mensaje.*1000 caracteres/i)).toBeVisible();
  });
});
