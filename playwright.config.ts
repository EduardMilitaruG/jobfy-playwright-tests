import { defineConfig, devices } from '@playwright/test';

// Where JobFy v2 is running. Defaults match `npm run dev` in the JobFy-v2 repo.
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5173';
const API_URL = process.env.API_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }], ['github']]
    : [['list'], ['html', { open: 'never' }]],

  // Fails fast with a clear message if the app isn't running.
  globalSetup: './tests/global-setup.ts',

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      // Backend contract tests: no browser, talks to Express directly.
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: API_URL },
    },
    {
      name: 'chromium',
      testDir: './tests/e2e',
      testIgnore: '**/*.mobile.spec.ts',
      use: { ...devices['Desktop Chrome'], baseURL: BASE_URL },
    },
    {
      name: 'mobile-chrome',
      testDir: './tests/e2e',
      testMatch: '**/*.mobile.spec.ts',
      use: { ...devices['Pixel 5'], baseURL: BASE_URL },
    },
  ],
});
