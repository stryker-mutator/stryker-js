import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    browser: {
      enabled: true,
      instances: [
        {
          browser: 'chromium',
          screenshotFailures: false,
        },
      ],
      provider: 'playwright',
      headless: true,
    },
    root: '.',
  },
});
