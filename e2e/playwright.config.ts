import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env['CI'];
const apiOnly = !!process.env['API_ONLY'];

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.e2e.ts',
  testIgnore: apiOnly ? [] : ['api/**'],
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? 'github' : 'html',

  use: {
    baseURL: process.env['API_URL'] ?? 'http://localhost:4200',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },

  projects: apiOnly
    ? [{ name: 'api', use: {} }]
    : [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
      ],

  ...(apiOnly
    ? {}
    : {
        webServer: {
          command: 'bun run start:web',
          url: 'http://localhost:4200',
          reuseExistingServer: !isCI,
          cwd: '..',
          timeout: 120_000,
        },
      }),
});
