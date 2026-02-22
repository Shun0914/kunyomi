import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2Eテスト設定
 * 実行前にフロントエンド(localhost:3000)とバックエンド(localhost:8000)を起動してください。
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
});
