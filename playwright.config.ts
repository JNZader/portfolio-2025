import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Next.js portfolio
 */
export default defineConfig({
  // Test directory
  testDir: './e2e/tests',

  // Maximum time one test can run (increased for slower environments)
  timeout: 60 * 1000,

  // Expect timeout (increased for network requests)
  expect: {
    timeout: 10000,
  },

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only
  forbidOnly: !!process.env.CI,

  // Retry failed tests (helps with flaky network issues)
  retries: process.env.CI ? 2 : 1,

  // Limit parallel workers to avoid resource contention and ECONNRESET errors
  workers: process.env.CI ? 1 : 2,

  // Reporter to use
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],

  // Shared settings for all the projects below
  use: {
    // Base URL
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',

    // Navigation timeout (increased for slow page loads)
    navigationTimeout: 30000,

    // Action timeout (clicks, fills, etc.)
    actionTimeout: 15000,

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on first retry
    video: 'retain-on-failure',

    // Locale
    locale: 'es-ES',

    // Timezone
    timezoneId: 'Europe/Madrid',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    // Tablet
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: process.env.CI ? 'npm start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
