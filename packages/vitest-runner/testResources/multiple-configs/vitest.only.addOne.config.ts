import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ["tests/math.addOne.spec.ts"]
  },
})
