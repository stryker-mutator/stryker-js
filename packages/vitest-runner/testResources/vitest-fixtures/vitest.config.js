import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/*.spec.ts'],
    setupFiles: ['vitest.setup.ts'],
  },
});
