import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/vitest/*.spec.js'],
    watch: false,
    environment: 'node',
  },
});
