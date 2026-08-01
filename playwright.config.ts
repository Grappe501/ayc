import { defineConfig, devices } from '@playwright/test'

/**
 * Smoke against a deployed (or preview) origin.
 * Default: production Netlify. Override with PLAYWRIGHT_BASE_URL.
 *
 * Master unlock: AYC_E2E_MASTER_KEY or AYC_MASTER_KEY (never commit the value).
 * Browsers must live on H: — set PLAYWRIGHT_BROWSERS_PATH=H:\playwright-browsers
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL?.trim() || 'https://arkansasyouth.netlify.app'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list']],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
