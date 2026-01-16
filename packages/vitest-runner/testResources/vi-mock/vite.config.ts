/// <reference types="vitest/config" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    include: ['components/Counter.test.tsx', 'components/Product.test.tsx'],
    browser: {
      headless: true,
      enabled: true,
      instances: [{ browser: 'chromium' }],
      provider: playwright({
        launchOptions: {
          executablePath: process.env.PLAYWRIGHT_LAUNCH_OPTIONS_EXECUTABLE_PATH,
        },
      }),
    },
  },
});
