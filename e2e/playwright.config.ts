import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env['CI'];
const isDocker = !!process.env['PLAYWRIGHT_BASE_URL'];
const baseURL = process.env['PLAYWRIGHT_BASE_URL'] ?? 'http://localhost:4200';

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? 'github' : 'html',

  use: {
    baseURL,
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // In Docker the frontend is already running — no webServer needed
  ...(isDocker
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
