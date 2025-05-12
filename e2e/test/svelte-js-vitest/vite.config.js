import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST }), svelteTesting()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/vitest.setup.js'],
  },
});
