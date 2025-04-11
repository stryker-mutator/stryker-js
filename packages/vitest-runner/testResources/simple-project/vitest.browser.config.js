import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    browser: {
      instances: [
        {
          browser: 'chromium',
          screenshotFailures: false,
        },
      ],
      headless: true,
      provider: 'playwright',
      enabled: true
    },
    include: ['tests/*.ts'],
    setupFiles: ['vitest.setup.ts'],
  },
});
