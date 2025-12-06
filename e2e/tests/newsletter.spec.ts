import { test, expect } from '@playwright/test';
import { testData } from '../fixtures/test-data';

test.describe('Newsletter Subscription', () => {
  test('should show newsletter form on homepage', async ({ page }) => {
    await page.goto('/');

    const form = page.getByRole('form', { name: /newsletter/i });
    await expect(form).toBeVisible();

    const input = form.getByRole('textbox', { name: /email/i });
    await expect(input).toBeVisible();

    const button = form.getByRole('button', { name: /suscribirse/i });
    await expect(button).toBeVisible();
  });

  test('should subscribe successfully', async ({ page }) => {
    await page.goto('/');

    const email = testData.newsletter.validEmail();
    const form = page.getByRole('form', { name: /newsletter/i });

    // Fill form
    await form.getByRole('textbox', { name: /email/i }).fill(email);
    await form.getByRole('button', { name: /suscribirse/i }).click();

    // Should show success message (server returns: "¡Revisa tu email! Te hemos enviado un link de confirmación.")
    await expect(page.getByText(/revisa tu email|link de confirmación/i)).toBeVisible();

    // Form should be reset
    await expect(form.getByRole('textbox', { name: /email/i })).toHaveValue('');
  });

  test('should show error for invalid email', async ({ page }) => {
    await page.goto('/');

    const form = page.getByRole('form', { name: /newsletter/i });

    // Fill with invalid email
    await form.getByRole('textbox', { name: /email/i }).fill(testData.newsletter.invalidEmail);
    await form.getByRole('button', { name: /suscribirse/i }).click();

    // Should show validation error
    await expect(page.getByText(/email inválido/i)).toBeVisible();
  });

  test('should show error for empty email', async ({ page }) => {
    await page.goto('/');

    const form = page.getByRole('form', { name: /newsletter/i });

    // Click without filling
    await form.getByRole('button', { name: /suscribirse/i }).click();

    // Should show validation error
    await expect(page.getByText(/email es requerido/i)).toBeVisible();
  });

  test('should handle rate limiting', async ({ page }) => {
    await page.goto('/');

    const email = testData.newsletter.validEmail();
    const form = page.getByRole('form', { name: /newsletter/i });

    // Submit 6 times (rate limit is 5/hour)
    for (let i = 0; i < 6; i++) {
      await form.getByRole('textbox', { name: /email/i }).fill(email);
      await form.getByRole('button', { name: /suscribirse/i }).click();

      // Wait for either success or error message before next submission
      // Server messages: "¡Revisa tu email..." or "Demasiados intentos..."
      await Promise.race([
        page.getByText(/revisa tu email|link de confirmación/i).waitFor({ timeout: 2000 }).catch(() => {}),
        page.getByText(/demasiados intentos/i).waitFor({ timeout: 2000 }).catch(() => {}),
      ]);
    }

    // Should show rate limit error (server returns: "Demasiados intentos. Por favor, intenta más tarde.")
    await expect(page.getByText(/demasiados intentos/i)).toBeVisible();
  });
});
