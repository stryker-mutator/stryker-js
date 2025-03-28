/// <reference types="vitest/config" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    include: ['components/Counter.test.tsx', 'components/Product.test.tsx'],
    browser: {
      headless: true,
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
    },
  },
});
