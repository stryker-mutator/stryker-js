import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ["tests/math.add.spec.ts"]
  },
})
