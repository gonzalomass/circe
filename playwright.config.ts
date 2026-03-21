import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/integration',
  timeout: 60_000,
  retries: 0,
  workers: 1, // Electron tests must run serially
  use: {
    headless: false // Electron doesn't support headless
  },
  reporter: [['list']]
});
