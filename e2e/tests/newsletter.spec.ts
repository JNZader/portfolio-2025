import { test, expect } from '@playwright/test';
import { testData, dismissCookieConsent } from '../fixtures/test-data';

test.describe('Newsletter Subscription', () => {
  test('should show newsletter form on homepage', async ({ page }) => {
    await page.goto('/');
    await dismissCookieConsent(page);

    const form = page.getByRole('form', { name: /newsletter/i });
    await expect(form).toBeVisible();

    const input = form.getByRole('textbox', { name: /email/i });
    await expect(input).toBeVisible();

    const button = form.getByRole('button', { name: /suscrib/i });
    await expect(button).toBeVisible();
  });

  test('should submit form and show response', async ({ page }) => {
    await page.goto('/');
    await dismissCookieConsent(page);

    const email = testData.newsletter.validEmail();
    const form = page.getByRole('form', { name: /newsletter/i });
    const button = form.getByRole('button', { name: /suscrib/i });

    // Fill form
    await form.getByRole('textbox', { name: /email/i }).fill(email);
    await button.click();

    // Wait for some response - either loading state, success state, error, or toast
    // The form should show some feedback within reasonable time
    await expect(async () => {
      const buttonText = await button.textContent();
      const hasToast = await page.locator('[role="status"], [data-sonner-toast], .toast').count() > 0;
      const hasLoadingOrSuccess = buttonText?.includes('Suscribiendo') || buttonText?.includes('Suscrito');
      const hasError = await page.getByText(/error|inesperado/i).isVisible().catch(() => false);

      // At least one response indicator should be present
      expect(hasLoadingOrSuccess || hasToast || hasError).toBeTruthy();
    }).toPass({ timeout: 10000 });
  });

  test('should show error for invalid email', async ({ page }) => {
    await page.goto('/');
    await dismissCookieConsent(page);

    const form = page.getByRole('form', { name: /newsletter/i });

    // Fill with invalid email
    await form.getByRole('textbox', { name: /email/i }).fill(testData.newsletter.invalidEmail);
    await form.getByRole('button', { name: /suscrib/i }).click();

    // Wait for form to process
    await page.waitForTimeout(500);

    // Should show validation error - client-side validation
    // The error appears outside the form, so search the whole page
    const errorMessage = page.getByText(/email inválido/i);
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should show error for empty email', async ({ page }) => {
    await page.goto('/');
    await dismissCookieConsent(page);

    const form = page.getByRole('form', { name: /newsletter/i });

    // Click without filling
    await form.getByRole('button', { name: /suscrib/i }).click();

    // Should show validation error - client-side validation
    await expect(page.getByText(/email.*requerido/i)).toBeVisible();
  });

  test('should disable button during submission', async ({ page }) => {
    await page.goto('/');
    await dismissCookieConsent(page);

    // Block the API request indefinitely until we verify the loading state
    let resolveRoute: (() => void) | undefined;
    const routePromise = new Promise<void>((resolve) => {
      resolveRoute = resolve;
    });

    // Note: Newsletter uses server actions, not API routes directly
    // We need to intercept the server action call
    await page.route('**/*', async (route) => {
      const url = route.request().url();
      // Intercept POST requests that might be the form submission
      if (route.request().method() === 'POST' && !url.includes('_next/static')) {
        await routePromise;
      }
      await route.continue();
    });

    const email = testData.newsletter.validEmail();
    const form = page.getByRole('form', { name: /newsletter/i });

    await form.getByRole('textbox', { name: /email/i }).fill(email);

    const button = form.getByRole('button', { name: /suscrib/i });

    // Click to start submission (don't await - it will hang waiting for response)
    button.click();

    // Button should be disabled during submission
    await expect(button).toBeDisabled({ timeout: 5000 });

    // Unblock the route to allow test to complete
    resolveRoute?.();

    // Give time for the UI to update
    await page.waitForTimeout(1000);
  });
});
