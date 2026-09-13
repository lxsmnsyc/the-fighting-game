import { defineConfig, devices } from '@playwright/test';

/**
 * Browser tests: the game as a player meets it, in a real browser
 * against the dev server. Engine rules are tested without a screen in
 * `test/`; these catch what only shows up when the game is played.
 */

const PORT = 5199;
const ORIGIN = `http://localhost:${PORT}`;

const onCI = process.env.CI != null;

export default defineConfig({
  testDir: 'e2e',
  forbidOnly: onCI,
  retries: onCI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: onCI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: ORIGIN,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1400, height: 900 } },
    },
  ],
  webServer: {
    command: `pnpm exec vite --port ${PORT} --strictPort`,
    url: ORIGIN,
    reuseExistingServer: !onCI,
    timeout: 60_000,
  },
});
