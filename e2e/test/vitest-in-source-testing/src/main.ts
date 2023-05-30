// src/index.ts

// the implementation
export function add(...args: number[]) {
  return args.reduce((a, b) => a + b, 0)
}


// in-source test suites
// Stryker disable all: Unit tests start here
if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest
  it('add', () => {
    expect(add()).toBe(0)
    expect(add(1)).toBe(1)
    expect(add(1, 2, 3)).toBe(6)
  })
}
