import { test, expect } from '@playwright/test';
import { testData } from '../fixtures/test-data';

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contacto');
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

  test('should submit form successfully', async ({ page }) => {
    const email = testData.contact.email();
    const main = page.locator('main');

    // Fill form
    await main.getByRole('textbox', { name: /nombre/i }).fill(testData.contact.name);
    await main.getByRole('textbox', { name: /^email/i }).fill(email);
    await main.getByLabel(/asunto/i).fill('Test Subject');
    await main.getByRole('textbox', { name: /mensaje/i }).fill(testData.contact.message);

    // Submit
    await main.getByRole('button', { name: /enviar/i }).click();

    // Wait for success message
    await expect(page.getByText(/mensaje.*enviado/i)).toBeVisible({ timeout: 10000 });

    // Form should be reset
    await expect(main.getByRole('textbox', { name: /nombre/i })).toHaveValue('');
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

    // Slow down network to catch loading state
    await page.route('**/api/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.continue();
    });

    await main.getByRole('textbox', { name: /nombre/i }).fill(testData.contact.name);
    await main.getByRole('textbox', { name: /^email/i }).fill(email);
    await main.getByLabel(/asunto/i).fill('Test Subject');
    await main.getByRole('textbox', { name: /mensaje/i }).fill(testData.contact.message);

    const submitButton = main.getByRole('button', { name: /enviar/i });

    // Start submission and immediately check loading state
    const clickPromise = submitButton.click();

    // Button should show loading state (check quickly before submission completes)
    await expect(submitButton).toBeDisabled({ timeout: 2000 });
    await expect(submitButton).toHaveAttribute('aria-busy', 'true', { timeout: 2000 });

    // Wait for submission to complete
    await clickPromise;
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
