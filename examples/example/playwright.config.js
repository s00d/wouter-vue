import { defineConfig, devices } from '@playwright/test';

const port = process.env.PORT || 5173;

export default defineConfig({
  testDir: './test',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'on-first-retry',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: [
    {
      command: 'pnpm run build',
      reuseExistingServer: false,
      timeout: 120000,
      stdout: 'inherit',
      stderr: 'inherit',
    },
    {
      command: 'pnpm run preview',
      url: `http://localhost:${port}`,
      env: {
        PORT: String(port),
        NODE_ENV: 'production',
      },
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
      stdout: 'inherit',
      stderr: 'inherit',
    },
  ],
});

