import { nanoid } from 'nanoid';

/**
 * Generate unique test data
 */
export const testData = {
  // Newsletter
  newsletter: {
    validEmail: () => `test-${nanoid(8)}@example.com`,
    invalidEmail: 'not-an-email',
  },

  // Contact
  contact: {
    name: 'John Doe',
    email: () => `test-${nanoid(8)}@example.com`,
    message: 'This is a test message from E2E tests.',
    longMessage: 'a'.repeat(1001), // More than 1000 chars to trigger error
  },

  // Search
  search: {
    validQuery: 'React',
    noResultsQuery: 'xyzabc123',
  },
};

/**
 * Cookie consent helper - dismisses the cookie banner
 */
export async function dismissCookieConsent(page: import('@playwright/test').Page) {
  // Wait a bit for the cookie banner to appear (it shows after 1 second)
  await page.waitForTimeout(1500);

  // Try to find and click the "Solo esenciales" button to dismiss
  const cookieBanner = page.locator('text=Usamos cookies');
  if (await cookieBanner.isVisible({ timeout: 1000 }).catch(() => false)) {
    // Click "Solo esenciales" to dismiss without tracking
    const dismissButton = page.getByRole('button', { name: /solo esenciales/i });
    if (await dismissButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await dismissButton.click();
      // Wait for banner to disappear
      await page.waitForTimeout(500);
    }
  }
}
