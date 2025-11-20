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
  // Wait for cookie banner to appear
  const cookieBanner = page.locator('text=Usamos cookies');

  try {
    // Wait for banner to be visible (max 3 seconds)
    await cookieBanner.waitFor({ state: 'visible', timeout: 3000 });

    // Click "Solo esenciales" to dismiss without tracking
    const dismissButton = page.getByRole('button', { name: /solo esenciales/i });
    await dismissButton.click();

    // Wait for banner to actually disappear
    await cookieBanner.waitFor({ state: 'hidden', timeout: 3000 });
  } catch (error) {
    // Cookie banner didn't appear or couldn't be dismissed - that's fine
  }
}
