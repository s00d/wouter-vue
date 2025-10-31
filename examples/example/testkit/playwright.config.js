import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || 5173;

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*navigation*.spec.js', // Only Playwright browser tests
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'on-first-retry',
    headless: false,
  },
  webServer: [
    {
      command: 'pnpm run build',
      cwd: path.resolve(__dirname, '..'),
      reuseExistingServer: false,
      timeout: 120000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: 'node server.js',
      url: `http://localhost:${port}`,
      cwd: path.resolve(__dirname, '..'),
      env: {
        PORT: String(port),
        NODE_ENV: 'production',
      },
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});

