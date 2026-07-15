import { devices } from '@playwright/test';
import type { PlaywrightTestConfig } from '@playwright/test';
import { environmentReportPath, environmentRunId } from './e2e/fixtures/environment-status';

/**
 * Playwright E2E test configuration
 * Multi-browser testing with accessibility checks
 *
 * @see https://playwright.dev/docs/test-configuration
 */
const config: PlaywrightTestConfig = {
  forbidOnly: true,
  // Test directory
  testDir: './e2e/tests',

  globalSetup: './e2e/fixtures/global-setup.ts',

  // Timeout per test (3 minutes)
  timeout: 3 * 60 * 1000,

  // Fail fast: stop after first failure
  fullyParallel: !process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Limit parallel workers (GitHub Actions free tier has 2 cores)
  workers: process.env.CI ? 2 : undefined,

  // Fail on console errors
  expect: {
    timeout: 10000,
  },

  // Reporter to use
  reporter: [
    ['./e2e/reporters/environment-reporter.ts'],
    ['html'],
    ['json', { outputFile: environmentReportPath('results.json') }],
    ['list'],
  ],

  // Shared settings for all the projects below
  use: {
    // Base URL
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL ?? 'http://localhost:3000',

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
    timezoneId: 'America/Argentina/Buenos_Aires',

    // Enable JavaScript
    javaScriptEnabled: true,

    // Accept downloads
    acceptDownloads: true,

    // Ignore HTTPS errors (for local dev)
    ignoreHTTPSErrors: true,
  },

  // Projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    // Mobile viewports
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 13'],
      },
    },
  ],

  // Web server configuration (auto-start dev server for local tests)
  webServer: process.env.CI || process.env.PLAYWRIGHT_TEST_BASE_URL
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        timeout: 120 * 1000,
        reuseExistingServer: !process.env.CI,
      },

  // Output folder for test results
  outputDir: `test-results/${environmentRunId()}/playwright/`,
};

export default config;
