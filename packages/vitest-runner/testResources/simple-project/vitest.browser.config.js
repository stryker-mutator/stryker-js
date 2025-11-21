import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  test: {
    browser: {
      instances: [{ browser: 'chromium' }],
      headless: true,
      provider: playwright(),
      enabled: true,
    },
    include: ['tests/*.ts'],
    setupFiles: ['vitest.setup.ts'],
  },
});
