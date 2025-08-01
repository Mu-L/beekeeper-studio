import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  expect: {
    timeout: 30000,
  },
  fullyParallel: true,
  workers: 3,
  use: {
    actionTimeout: 10000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  }
});
