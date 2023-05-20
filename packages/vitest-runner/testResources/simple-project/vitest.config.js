import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/*.ts'],
    setupFiles: ['vitest.setup.ts']
  },
})
