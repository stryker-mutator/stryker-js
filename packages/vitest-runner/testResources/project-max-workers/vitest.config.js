import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    maxWorkers: 2,
    projects: [
      { extends: true, test: { name: 'unit', include: ['tests/*.spec.js'] } },
    ],
  },
});
